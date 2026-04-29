import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const result = await prisma.wine.updateMany({
    where: { country: 'Mexico' },
    data: { country: 'México' }
  })
  console.log('Wines updated:', result.count)
  await prisma.$disconnect()
}
main()
