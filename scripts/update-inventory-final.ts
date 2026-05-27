import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Inventario al 22 de abril - mapa más flexible
const inventoryData: Record<string, number> = {
  "19 Crimes": 2,
  "Acapella": 11,
  "Alianza": 5,
  "Alma Mora Cabernet": 2,
  "Alma Mora Malbec": 2,
  "Alonso": 3,
  "Alto las Hormigas": 9,
  "Amarone": 3,
  "Amicorum": 2,
  "Arthur": 2,
  "Asiolo": 2,
  "Asticca": 1,
  "Bolla": 2,
  "Cabernet": 10,
  "Be Light": 2,
  "Priv": 4,
  "Red Blend": 5,
  "Calaixa": 2,
  "Casa Madero": 1,
  "Casa Magoni": 2,
  "Castalunga": 6,
  "Castelvecci": 1,
  "Catena Cabernet": 3,
  "Catena Malbec": 2,
  "Chatau": 6, // 1+2+3 de los tres Chateaux
  "Chianti": 1,
  "Cordus": 2,
  "Corrales": 3,
  "Cuore": 2,
  "Decordi": 3,
  "Dolce": 9,
  "Domaine Busquet": 16, // 4+12
  "Dominio": 2,
  "Doneli": 5,
  "Doña": 2,
  "Emilio": 1,
  "Estancia Mendoza": 13, // Total de Estancia Mendoza (6+1+6)
  "Estancia Malbec": 12,
  "Estancia Reserva": 8, // 2+6
  "Faustino": 19, // 17+1+1
  "Finca Beltran": 1,
  "Finca Moras Malbec": 1,
  "Finca Moras Tannat": 2,
  "Finca Manzanos": 2,
  "Finca Resalso": 2,
  "Frulli": 2,
  "Gaetano": 9,
  "Gaia": 3,
  "Garzon": 1,
  "Gran Sangre": 5,
  "Hileras": 3,
  "Inspiracion": 1,
  "LA Cetto Blanc": 8,
  "LA Cetto Nebbiolo": 2,
  "LA Cetto Petit": 4,
  "LA Cetto Priv": 2,
  "Linda Mora": 11,
  "Los Haroldos Cabernet": 1,
  "Los Haroldos Malbec": 1,
  "Luigi Bosca": 5,
  "López Haro Blanco": 1,
  "López Haro Crianza": 1,
  "Mario": 3,
  "Marqués": 4,
  "Monte": 2,
  "Navarro Correas": 10, // 4+6
  "Norton": 1,
  "Palodin": 2,
  "Pardosso": 2,
  "Portillo Cabernet": 3,
  "Portillo Malbec": 2,
  "Pouilly": 1,
  "Prosseco": 3,
  "Ramon": 8,
  "Rioja": 6,
  "San Marco": 3,
  "Sangre de Toro": 2,
  "Selección Blanco": 6,
  "Selección Tinto": 4,
  "Terrazas": 9, // 6+3
  "Tierra": 5,
  "Trapiche": 8, // 7+1
  "Trisquel": 3,
  "Trivento Gold": 2,
  "Trivento": 2,
  "Valdeviero": 10, // 3+6+1
  "Valle": 1,
  "Villa": 1,
  "Viu": 12,
  "Xolo": 1,
};

const countDate = new Date("2026-04-22");

async function main() {
  console.log("Actualizando inventario al 22 de abril...\n");

  let updated = 0;
  const processed = new Set<string>();
  const adjustments = [];

  // Obtener todos los vinos
  const allWines = await prisma.wine.findMany();

  for (const wine of allWines) {
    // Buscar coincidencia flexible
    let matchedKey: string | null = null;

    for (const [key] of Object.entries(inventoryData)) {
      if (wine.name.toLowerCase().includes(key.toLowerCase())) {
        matchedKey = key;
        break;
      }
    }

    if (!matchedKey) continue;

    const newStock = inventoryData[matchedKey];
    const oldStock = wine.stock;
    const diff = newStock - oldStock;

    if (processed.has(wine.id)) continue;
    processed.add(wine.id);

    // Actualizar stock
    await prisma.wine.update({
      where: { id: wine.id },
      data: { stock: newStock },
    });

    // Crear registro de ajuste si hay diferencia
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
  }

  // Crear registros de ajuste
  console.log(`\nCreando ${adjustments.length} registros de ajuste...\n`);
  for (const adj of adjustments) {
    try {
      await prisma.inventoryAdjustment.create({ data: adj });
    } catch (err) {
      console.error("Error creando ajuste:", err);
    }
  }

  console.log(
    `\n✅ Inventario actualizado: ${updated} vinos modificados\n📊 Ajustes de inventario creados: ${adjustments.length}`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
