import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log('\n🍷 Iniciando simulacion de 30 dias...\n');

  const wines = await prisma.wine.findMany({ where: { active: true, stock: { gt: 0 } } });

  if (wines.length === 0) {
    console.log('❌ No hay vinos activos disponibles para simular');
    return;
  }

  console.log(`📍 Encontrados ${wines.length} vinos activos\n`);

  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  const salesPerWine: { [key: string]: number } = {};
  wines.forEach((w) => { salesPerWine[w.id] = 0; });

  console.log('📍 Simulando 30 dias de ventas (3-4 vinos/dia)...');
  let totalSalesCount = 0;
  for (let day = 0; day < 30; day++) {
    const currentDate = new Date(thirtyDaysAgo.getTime() + day * 24 * 60 * 60 * 1000);
    const salesCount = getRandomInt(3, 4);
    
    for (let i = 0; i < salesCount; i++) {
      const wine = getRandomItem(wines);
      const quantity = getRandomInt(1, 3);
      
      // Verificar que hay stock disponible
      const currentStock = await prisma.wine.findUnique({ where: { id: wine.id }, select: { stock: true } });
      if (!currentStock || currentStock.stock < quantity) continue;

      await prisma.wineRequest.create({
        data: {
          wineId: wine.id,
          tableName: `Mesa ${getRandomInt(1, 8)}`,
          quantity,
          status: 'confirmed',
          createdAt: currentDate,
        },
      });
      
      await prisma.wine.update({
        where: { id: wine.id },
        data: { stock: { decrement: quantity } },
      });
      
      salesPerWine[wine.id] += quantity;
      totalSalesCount++;
    }
  }

  console.log(`✅ ${totalSalesCount} ventas registradas\n`);

  console.log('📍 Simulando 4 compras semanales para reponer stock...');
  
  for (let week = 0; week < 4; week++) {
    const purchaseDate = new Date(thirtyDaysAgo.getTime() + (week * 7 + 1) * 24 * 60 * 60 * 1000);
    
    // Seleccionar los 5 vinos más vendidos o aleatorios si no hay muchas ventas
    const topSoldWines = wines
      .filter(w => salesPerWine[w.id] > 0)
      .sort((a, b) => (salesPerWine[b.id] || 0) - (salesPerWine[a.id] || 0))
      .slice(0, 5)
      .length > 0 
      ? wines
          .filter(w => salesPerWine[w.id] > 0)
          .sort((a, b) => (salesPerWine[b.id] || 0) - (salesPerWine[a.id] || 0))
          .slice(0, 5)
      : wines.slice(0, 5);
    
    const items = topSoldWines.map((wine) => ({
      wineId: wine.id,
      quantity: 30,
    }));
    
    const order = await prisma.purchaseOrder.create({
      data: {
        status: 'received',
        notes: `Compra semanal numero ${week + 1}`,
        createdAt: purchaseDate,
        items: { create: items },
      },
      include: { items: true },
    });
    
    for (const item of order.items) {
      await prisma.wine.update({
        where: { id: item.wineId },
        data: { stock: { increment: item.quantity } },
      });
    }
    
    console.log(`  Semana ${week + 1}: Compra el ${purchaseDate.toLocaleDateString('es-MX')} (${items.length} vinos)`);
  }

  console.log('✅ Compras creadas\n');

  console.log('📍 Creando ajustes de inventario (roturas, perdidas)...');
  
  for (let i = 0; i < 15; i++) {
    const wine = getRandomItem(wines);
    const adjustDate = new Date(thirtyDaysAgo.getTime() + getRandomInt(0, 29) * 24 * 60 * 60 * 1000);
    const quantity = getRandomInt(1, 3);
    
    if (Math.random() > 0.5) {
      await prisma.inventoryAdjustment.create({
        data: {
          wineId: wine.id,
          type: 'decrease',
          quantity,
          reason: getRandomItem(['Botella rota', 'Control de calidad', 'Perdida en traslado']),
          notes: 'Ajuste manual de inventario',
          createdAt: adjustDate,
        },
      });
      
      await prisma.wine.update({
        where: { id: wine.id },
        data: { stock: { decrement: quantity } },
      });
    } else {
      const increaseQty = getRandomInt(1, 2);
      await prisma.inventoryAdjustment.create({
        data: {
          wineId: wine.id,
          type: 'increase',
          quantity: increaseQty,
          notes: 'Botellas encontradas en conteo fisico',
          createdAt: adjustDate,
        },
      });
      
      await prisma.wine.update({
        where: { id: wine.id },
        data: { stock: { increment: increaseQty } },
      });
    }
  }

  console.log('✅ Ajustes creados\n');

  console.log('=====================================');
  console.log('📊 RESUMEN DE SIMULACION - 30 DIAS');
  console.log('====================================\n');
  
  const finalWines = await prisma.wine.findMany({ orderBy: { name: 'asc' } });
  let totalValue = 0;
  let totalSoldValue = 0;
  
  console.log('📦 TOP 20 VINOS (por cambios de stock):\n');
  const topChanged = finalWines
    .filter(w => salesPerWine[w.id] > 0)
    .sort((a, b) => (salesPerWine[b.id] || 0) - (salesPerWine[a.id] || 0))
    .slice(0, 20);

  topChanged.forEach((wine) => {
    const sold = salesPerWine[wine.id] || 0;
    const stockValue = wine.stock * wine.costPrice;
    const soldValue = sold * wine.price;
    totalValue += stockValue;
    totalSoldValue += soldValue;
    
    console.log(`  ${wine.name}`);
    console.log(`    Stock actual: ${wine.stock} | Vendidas: ${sold} | Valor stock: $${stockValue.toLocaleString('es-MX')}`);
  });
  
  const totalWineRequests = await prisma.wineRequest.count();
  const totalPurchaseOrders = await prisma.purchaseOrder.count();
  const totalAdjustments = await prisma.inventoryAdjustment.count();
  const totalSold = Object.values(salesPerWine).reduce((a, b) => a + b, 0);
  
  console.log('\n📈 ESTADISTICAS GENERALES:\n');
  console.log(`  Total vinos en sistema: ${finalWines.length}`);
  console.log(`  Botellas vendidas: ${totalSold}`);
  console.log(`  Solicitudes de vino: ${totalWineRequests}`);
  console.log(`  Ordenes de compra: ${totalPurchaseOrders}`);
  console.log(`  Ajustes de inventario: ${totalAdjustments}`);
  console.log(`\n💰 VALORES:\n`);
  console.log(`  Valor inventario total actual: $${(finalWines.reduce((sum, w) => sum + (w.stock * w.costPrice), 0)).toLocaleString('es-MX')}`);
  console.log(`  Valor vinos vendidos (30 dias): $${totalSoldValue.toLocaleString('es-MX')}`);
  
  console.log('\n✅ Simulacion completada!\n');
  console.log('Ahora puedes ir a Admin > Reportes para ver los reportes generados.');
  console.log('\n');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
