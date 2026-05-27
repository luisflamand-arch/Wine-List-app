import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedPairings() {
  try {
    const pairings = [
      {
        dishName: "Provoleta",
        premiumWineId: "bodega-zerran-reserva",
        mediumWineId: "l-pez-haro-crianza",
        economicWineId: "benjam-n-malbec"
      },
      {
        dishName: "Burrata",
        premiumWineId: "cmohnu5u40008o3boacstores",
        mediumWineId: "calixa-ojos-negros-blanco",
        economicWineId: "finca-las-moras-chardonnay"
      },
      {
        dishName: "Penne Arrabiata",
        premiumWineId: "le-petit-arnauds",
        mediumWineId: "acapella-crianza",
        economicWineId: "gran-sangre-de-toro"
      },
      {
        dishName: "Spaghetti Carbonara",
        premiumWineId: "norton-reserva-malbec",
        mediumWineId: "luigi-bosca-cabernet-sauvignon",
        economicWineId: "casillero-del-diablo-blend"
      },
      {
        dishName: "Spaghetti Frutti di Mare",
        premiumWineId: "cmohnu5u20003o3bowq6ilsj7",
        mediumWineId: "l-pez-haro-blanco-viura",
        economicWineId: "cmohnu5tp0000o3boowfq6zjk"
      },
      {
        dishName: "Escalopas al Vino Blanco",
        premiumWineId: "gewurztraminer-alsacia",
        mediumWineId: "casa-madero-2v",
        economicWineId: "faustino-rivero-blanco"
      },
      {
        dishName: "Rollo de Pollo",
        premiumWineId: "cmohnu5u60009o3boo6jvm9nz",
        mediumWineId: "trapiche-pinot-noir",
        economicWineId: "casillero-del-diablo-be-light"
      },
      {
        dishName: "Cortes de Res",
        premiumWineId: "norton-reserva-malbec",
        mediumWineId: "alto-las-hormigas-malbec",
        economicWineId: "benjam-n-malbec"
      },
      {
        dishName: "Costillar de Cerdo",
        premiumWineId: "catena-zapata-reserva-cabernet-sauvignon",
        mediumWineId: "estancia-mendoza-bonarda",
        economicWineId: "luigi-bosca-chardonnay"
      },
      {
        dishName: "Saltimbocca",
        premiumWineId: "dominio-fournier-reserva",
        mediumWineId: "emilio-moro",
        economicWineId: "faustino-rivero-ulecia"
      },
      {
        dishName: "Salmón a las Brasas",
        premiumWineId: "cmohnu5u40008o3boacstores",
        mediumWineId: "casa-madero-2v",
        economicWineId: "calixa-ojos-negros-blanco"
      },
      {
        dishName: "Atún a las Brasas",
        premiumWineId: "cmohnu5u20003o3bowq6ilsj7",
        mediumWineId: "l-pez-haro-blanco",
        economicWineId: "cmohnu5tp0000o3boowfq6zjk"
      }
    ]

    for (const pairing of pairings) {
      await prisma.menuPairing.upsert({
        where: { dishName: pairing.dishName },
        update: pairing,
        create: pairing
      })
      console.log(`✅ ${pairing.dishName}`)
    }

    console.log("\n✨ Todos los maridajes han sido creados")
  } catch (err: unknown) {
    console.error("❌ Error:", err instanceof Error ? err.message : String(err))
  } finally {
    await prisma.$disconnect()
  }
}

seedPairings()
