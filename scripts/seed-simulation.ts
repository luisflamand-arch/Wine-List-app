import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const wines = [
  { name: 'Vino Tinto Reserva', type: 'Tinto', country: 'España', region: 'Rioja', grape: 'Tempranillo', vintage: '2018', price: 850, costPrice: 350 },
  { name: 'Vino Blanco Sauvignon', type: 'Blanco', country: 'Francia', region: 'Loire', grape: 'Sauvignon Blanc', vintage: '2022', price: 450, costPrice: 180 },
  { name: 'Vino Rosado Premium', type: 'Rosado', country: 'España', region: 'Cataluña', grape: 'Garnacha', vintage: '2021', price: 520, costPrice: 200 },
  { name: 'Champagne Brut', type: 'Espumoso', country: 'Francia', region: 'Champagne', grape: 'Blend', vintage: '2019', price: 1200, costPrice: 450 },
  { name: 'Vino Dulce Moscatel', type: 'Dulce', country: 'España', region: 'Alicante', grape: 'Moscatel', vintage: '2020', price: 380, costPrice: 150 },
  { name: 'Pinot Noir Oregon', type: 'Tinto', country: 'USA', region: 'Willamette Valley', grape: 'Pinot Noir', vintage: '2021', price: 920, costPrice: 380 },
  { name: 'Riesling Alsacia', type: 'Blanco', country: 'Francia', region: 'Alsacia', grape: 'Riesling', vintage: '2021', price: 550, costPrice: 220 },
  { name: 'Tempranillo Mexico', type: 'Tinto', country: 'Mexico', region: 'Baja California', grape: 'Tempranillo', vintage: '2021', price: 680, costPrice: 280 },
  { name: 'Merlot Napa Valley', type: 'Tinto', country: 'USA', region: 'Napa Valley', grape: 'Merlot', vintage: '2020', price: 1100, costPrice: 450 },
  { name: 'Chardonnay Borgona', type: 'Blanco', country: 'Francia', region: 'Borgona', grape: 'Chardonnay', vintage: '2020', price: 750, costPrice: 300 },
];

async function main() {
  console.log('\n🍷 Iniciando simulacion de 30 dias...\n');

  await prisma.wineRequest.deleteMany({});
  await prisma.inventoryAdjustment.deleteMany({});
  await prisma.purchaseOrderItem.deleteMany({});
  await prisma.purchaseOrder.deleteMany({});
  await prisma.wine.deleteMany({});

  console.log('📍 Creando 10 vinos con 100 botellas cada uno...');
  const createdWines = await Promise.all(
    wines.map((w) =>
      prisma.wine.create({
        data: {
          name: w.name,
          type: w.type,
          country: w.country,
          region: w.region,
          grape: w.grape,
          vintage: w.vintage,
          price: w.price,
          costPrice: w.costPrice,
          stock: 100,
          minStock: 10,
          avgConsumption: 4,
          description: `Vino premium ${w.name}`,
          active: true,
        },
      })
    )
  );

  console.log(`✅ ${createdWines.length} vinos creados\n`);

  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  const salesPerWine: { [key: string]: number } = {};
  createdWines.forEach((w) => { salesPerWine[w.id] = 0; });

  console.log('📍 Simulando 30 dias de ventas (3-4 vinos/dia)...');
  let totalSalesCount = 0;
  for (let day = 0; day < 30; day++) {
    const currentDate = new Date(thirtyDaysAgo.getTime() + day * 24 * 60 * 60 * 1000);
    const salesCount = getRandomInt(3, 4);
    
    for (let i = 0; i < salesCount; i++) {
      const wine = getRandomItem(createdWines);
      const quantity = getRandomInt(1, 3);
      
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
    
    const topSoldWines = createdWines
      .sort((a, b) => (salesPerWine[b.id] || 0) - (salesPerWine[a.id] || 0))
      .slice(0, 5);
    
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
    
    console.log(`  Semana ${week + 1}: Compra el ${purchaseDate.toLocaleDateString('es-MX')}`);
  }

  console.log('✅ Compras creadas\n');

  console.log('📍 Creando ajustes de inventario (roturas, perdidas)...');
  
  for (let i = 0; i < 10; i++) {
    const wine = getRandomItem(createdWines);
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
      await prisma.inventoryAdjustment.create({
        data: {
          wineId: wine.id,
          type: 'increase',
          quantity: getRandomInt(1, 2),
          notes: 'Botellas encontradas en conteo fisico',
          createdAt: adjustDate,
        },
      });
      
      await prisma.wine.update({
        where: { id: wine.id },
        data: { stock: { increment: getRandomInt(1, 2) } },
      });
    }
  }

  console.log('✅ Ajustes creados\n');

  console.log('=====================================');
  console.log('📊 RESUMEN DE SIMULACION - 30 DIAS');
  console.log('====================================\n');
  
  const finalWines = await prisma.wine.findMany();
  let totalValue = 0;
  let totalSoldValue = 0;
  
  console.log('📦 INVENTARIO ACTUAL:\n');
  finalWines.forEach((wine) => {
    const sold = salesPerWine[wine.id] || 0;
    const stockValue = wine.stock * wine.costPrice;
    const soldValue = sold * wine.price;
    totalValue += stockValue;
    totalSoldValue += soldValue;
    
    console.log(`  ${wine.name}`);
    console.log(`    Stock: ${wine.stock} | Vendidas: ${sold} | Valor: $${stockValue.toLocaleString('es-MX')}`);
  });
  
  const totalWineRequests = await prisma.wineRequest.count();
  const totalPurchaseOrders = await prisma.purchaseOrder.count();
  const totalAdjustments = await prisma.inventoryAdjustment.count();
  const totalSold = Object.values(salesPerWine).reduce((a, b) => a + b, 0);
  
  console.log('\n📈 ESTADISTICAS GENERALES:\n');
  console.log(`  Total vinos: ${finalWines.length}`);
  console.log(`  Botellas vendidas: ${totalSold}`);
  console.log(`  Solicitudes de vino: ${totalWineRequests}`);
  console.log(`  Ordenes de compra: ${totalPurchaseOrders}`);
  console.log(`  Ajustes de inventario: ${totalAdjustments}`);
  console.log(`\n💰 VALORES:\n`);
  console.log(`  Valor inventario actual: $${totalValue.toLocaleString('es-MX')}`);
  console.log(`  Valor vinos vendidos: $${totalSoldValue.toLocaleString('es-MX')}`);
  
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
