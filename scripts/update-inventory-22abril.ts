import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Inventario al 22 de abril
const inventoryData: Record<string, number> = {
  "19 Crimes": 2,
  "2V": 1,
  "Acapella": 11,
  "Alianza Gaston": 5,
  "Alma Mora Cabernet": 2,
  "Alma Mora Malbec": 2,
  "Alonso Lopez": 3,
  "Alto las Hormigas": 9,
  "Amarone de la": 3,
  "Amicorum": 2,
  "Arthur Mertz": 2,
  "Asiolo Espumoso": 2,
  "Asticca": 1,
  "Bolla": 2,
  "C del Diablo Cabernet": 10,
  "C. del Diablo Be Light": 2,
  "C. del Diablo R. Priv.": 4,
  "C. del Diablo Red Blend": 5,
  "Calaixa": 2,
  "Casa Madero Shiraz": 1,
  "Casa Magoni": 2,
  "Castalunga": 6,
  "Castelvecci": 1,
  "Catena Cabernet": 3,
  "Catena Malbec": 2,
  "Chatau Bel Liv": 1,
  "Chatau Bell Aire": 2,
  "Chatau de Marians": 3,
  "Chianti Clásico Kirkland": 1,
  "Cordus": 2,
  "Corrales Montes": 3,
  "Cuore de la Toscana": 2,
  "Decordi": 3,
  "Dolce 3": 9,
  "Domaine Busquet": 4,
  "Domaine Busquet R": 12,
  "Dominio Faurier": 2,
  "Doneli": 5,
  "Doña Paula": 2,
  "Emilio Moro": 1,
  "Estancia Mendoza": 13, // 6 + 1 + 6 = 13
  "Estancia Mendoza Malbec": 12,
  "Estancia Mendoza R": 8, // 2 + 6 = 8\n  "Faustino Rivera R": 17,
  "Faustino Rivero Crianza": 1,
  "Faustino Rivero Ulecia": 1,
  "Finca Beltrán Duo": 1,
  "Finca Las Moras Malbec": 1,
  "Finca Las Moras R Tannat": 2,
  "Finca Manzanos": 2,
  "Finca Resalso": 2,
  "Finca las Moras": 2,
  "Frulli Grave": 2,
  "Gaetano DAquini": 9,
  "Gaia": 3,
  "Garzón Pinot Rose": 1,
  "Gran Sangre de Toro": 5,
  "Hileras del Sol": 3,
  "Inspiracion": 1,
  "LA Cetto Blanc Zinfandel": 8,
  "LA Cetto Nebbiolo": 2,
  "LA Cetto Petit Shirah": 4,
  "LA Cetto R.Priv. Cab": 2,
  "Linda Mora": 11,
  "Los Haroldos Cabernet": 1,
  "Los Haroldos Malbec": 1,
  "Luigi Bosca Cabernet": 5,
  "López Haro Blanco": 1,
  "López Haro Crianza": 1,
  "Mario Primo": 3,
  "Marqués de Caceres": 4,
  "Monte Xanic": 2,
  "Navarro Correas C. Priv.": 10, // 4 + 6 = 10
  "Norton": 1,
  "Palodin": 2,
  "Pardosso Montepuccioano": 2,
  "Portillo Cabernet": 3,
  "Portillo Malbec": 2,
  "Poully Fune": 1,
  "Prosseco Rose Kirkland": 3,
  "Ramón Roqueta": 8,
  "Red Blend Portugal": 3,
  "Rioja Vega": 6,
  "San Marco Frascati": 3,
  "Sangre de Toro": 2,
  "Selección Blanco": 6,
  "Selección Tinto": 4,
  "Terrazas de los Andes": 9, // 6 + 3 = 9
  "Tierra de Angeles": 5,
  "Trapiche Vinyards": 7,
  "Trapiche Vinyards Malbec": 1,
  "Trisquel Blend": 3,
  "Trivento Gold R Malbec": 2,
  "Trivento R Csbernet": 2,
  "Uno": 6,
  "Valdeviero Crianza": 3,
  "Valdeviero Joven": 6,
  "Valdeviero Roble": 1,
  "Valle Ojos Negros": 1,
  "Villa de Liceaga": 1,
  "Viu Manet": 12,
  "Xolo": 1,
};

const countDate = new Date("2026-04-22");

async function main() {
  console.log("Actualizando inventario al 22 de abril...\n");

  let updated = 0;
  let notFound = 0;
  const adjustments = [];

  for (const [wineName, newStock] of Object.entries(inventoryData)) {
    try {
      const wine = await prisma.wine.findFirst({
        where: {
          name: {
            contains: wineName,
            mode: "insensitive",
          },
        },
      });

      if (!wine) {
        console.log(`⚠️  No encontrado: "${wineName}"`);
        notFound++;
        continue;
      }

      const oldStock = wine.stock;
      const diff = newStock - oldStock;

      // Actualizar stock
      await prisma.wine.update({
        where: { id: wine.id },
        data: { stock: newStock },
      });

      // Crear registro de ajuste
      if (diff !== 0) {
        adjustments.push({
          wineId: wine.id,
          type: diff > 0 ? "increase" : "decrease",
          quantity: Math.abs(diff),
          reason: "conteo_fisico",
          notes: `Conteo físico 22 de abril: ${oldStock} → ${newStock} botellas`,
          createdAt: countDate,
        });
      }

      console.log(
        `✅ ${wine.name}: ${oldStock} → ${newStock} (${diff > 0 ? "+" : ""}${diff})`
      );
      updated++;
    } catch (err) {
      console.error(`❌ Error procesando "${wineName}":`, err);
    }
  }

  // Crear registros de ajuste de inventario
  console.log(`\nCreando ${adjustments.length} registros de ajuste...\n`);
  for (const adj of adjustments) {
    try {
      await prisma.inventoryAdjustment.create({ data: adj });
    } catch (err) {
      console.error("Error creando ajuste:", err);
    }
  }

  console.log(
    `\n✅ Inventario actualizado: ${updated} vinos modificados\n⚠️  No encontrados: ${notFound} vinos`
  );
  console.log(`📊 Ajustes de inventario creados: ${adjustments.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
