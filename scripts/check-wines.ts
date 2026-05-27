import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const total = await prisma.wine.count();
  const withCost = await prisma.wine.count({ where: { costPrice: { gt: 0 } } });
  const withoutCost = await prisma.wine.count({ where: { costPrice: 0 } });
  const active = await prisma.wine.count({ where: { active: true, stock: { gt: 0 } } });
  
  const allWines = await prisma.wine.findMany({ select: { costPrice: true, stock: true } });
  let totalValue = 0;
  for (const w of allWines) { totalValue += (w.costPrice ?? 0) * (w.stock ?? 0); }
  
  console.log(`Total vinos: ${total}`);
  console.log(`Con costPrice > 0: ${withCost}`);
  console.log(`Con costPrice = 0: ${withoutCost}`);
  console.log(`Activos con stock: ${active}`);
  console.log(`Valor inventario (solo costPrice): $${totalValue.toLocaleString('es-MX')}`);
}
main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
