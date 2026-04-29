import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n📍 Asignando precios de costo a todos los vinos...\n');
  
  const wines = await prisma.wine.findMany();
  
  let updated = 0;
  for (const wine of wines) {
    const costPrice = Math.round(wine.price * 0.45);
    
    await prisma.wine.update({
      where: { id: wine.id },
      data: { costPrice }
    });
    
    updated++;
    if (updated % 10 === 0) {
      console.log(`  ✓ ${updated} vinos actualizados...`);
    }
  }
  
  // Calculate and show total
  const allWines = await prisma.wine.findMany({ 
    select: { name: true, price: true, costPrice: true, stock: true } 
  });
  
  let totalValue = 0;
  allWines.forEach(w => {
    totalValue += w.costPrice * w.stock;
  });
  
  console.log(`\n✅ ${updated} vinos actualizados correctamente\n`);
  console.log(`📊 Nuevos valores:\n`);
  
  allWines.slice(0, 5).forEach(w => {
    console.log(`  ${w.name}: price=$${w.price}, costPrice=$${w.costPrice}, stock=${w.stock}`);
  });
  
  console.log(`\n💰 Valor inventario total (con costos): $${totalValue.toLocaleString('es-MX')}\n`);
}

main()
  .then(() => process.exit(0))
  .catch(e => { console.error(e); process.exit(1); });
