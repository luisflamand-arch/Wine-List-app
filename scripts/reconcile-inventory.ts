import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Explicit mapping: list name -> DB name (exact). qty
const MAPPING: { list: string; db: string | null; qty: number }[] = [
  { list: '19 Crimes', db: '19 Crimes', qty: 2 },
  { list: '2V', db: 'Casa Madero 2V', qty: 1 },
  { list: 'Acapella', db: 'Acapella Crianza', qty: 11 },
  { list: 'Alianza Gastón', db: 'Alianza Tannat', qty: 5 },
  { list: 'Alma Mora Cabernet', db: null, qty: 2 },
  { list: 'Alma Mora Malbec', db: 'Alma Mora Malbec', qty: 2 },
  { list: 'Alonso López', db: 'Alfonso López Tempranillo', qty: 3 },
  { list: 'Alto Las Hormigas', db: 'Alto Las Hormigas Malbec', qty: 9 },
  { list: 'Amarone', db: null, qty: 3 },
  { list: 'Amicorum', db: 'Amicorum', qty: 2 },
  { list: 'Arthur Mertz', db: null, qty: 2 },
  { list: 'Asticca', db: null, qty: 1 },
  { list: 'Bolla', db: null, qty: 2 },
  { list: 'Casillero del Diablo Cabernet', db: 'Casillero del Diablo Cabernet Sauvignon', qty: 10 },
  { list: 'Casillero del Diablo Be Light', db: 'Casillero del Diablo Be Light', qty: 2 },
  { list: 'Casillero del Diablo Reserva Privada', db: null, qty: 4 },
  { list: 'Casillero del Diablo Red Blend', db: 'Casillero del Diablo Red Blend', qty: 5 },
  { list: 'Calaixa', db: 'Calixa Cabernet Sauvignon', qty: 2 },
  { list: 'Casa Madero Shiraz', db: null, qty: 1 },
  { list: 'Casa Magoni', db: 'Casa Magoni Nebbiolo', qty: 2 },
  { list: 'Castalunga', db: null, qty: 6 },
  { list: 'Castelvecci', db: null, qty: 1 },
  { list: 'Catena Cabernet', db: 'Catena Zapata Reserva Cabernet Sauvignon', qty: 3 },
  { list: 'Catena Malbec', db: 'Catena Zapata Reserva Malbec', qty: 2 },
  { list: 'Chateau Bel Air', db: 'Château Bell Air', qty: 2 },
  { list: 'Chateau de Marians', db: null, qty: 3 },
  { list: 'Chianti Clásico Kirkland', db: null, qty: 1 },
  { list: 'Cordus', db: 'Cordus Blend', qty: 2 },
  { list: 'Corrales Montes', db: 'Corrales del Monte', qty: 3 },
  { list: 'Cuore de la Toscana', db: null, qty: 2 },
  { list: 'Decordi', db: null, qty: 3 },
  { list: 'Dolce 3', db: 'Casa Madero 3V', qty: 9 },
  { list: 'Domaine Bousquet', db: 'Domaine Bousquet Cabernet Sauvignon', qty: 16 },
  { list: 'Dominio Fournier', db: 'Dominio Fournier Reserva', qty: 2 },
  { list: 'Donelli', db: null, qty: 5 },
  { list: 'Doña Paula', db: null, qty: 2 },
  { list: 'Emilio Moro', db: 'Emilio Moro', qty: 1 },
  { list: 'Estancia Mendoza', db: 'Estancia Mendoza Bonarda', qty: 13 },
  { list: 'Estancia Mendoza Malbec', db: 'Estancia Mendoza Malbec', qty: 12 },
  { list: 'Estancia Mendoza Reserva', db: 'Estancia Mendoza Reserva', qty: 8 },
  { list: 'Faustino Rivero', db: 'Faustino Rivero Reserva', qty: 17 },
  { list: 'Faustino Rivero Crianza', db: 'Faustino Rivero Ulecia Crianza', qty: 1 },
  { list: 'Faustino Rivero Ulecia', db: 'Faustino Rivero Ulecia', qty: 1 },
  { list: 'Finca Beltrán Dúo', db: null, qty: 1 },
  { list: 'Finca Las Moras', db: 'Finca Las Moras Reserva', qty: 2 },
  { list: 'Finca Las Moras Malbec', db: 'Finca Las Moras Malbec', qty: 1 },
  { list: 'Finca Las Moras Tannat', db: 'Las Moras Reserva Tannat', qty: 2 },
  { list: 'Finca Manzanos', db: null, qty: 2 },
  { list: 'Finca Resalso', db: 'Finca Resalso', qty: 2 },
  { list: 'Frulli Grave', db: null, qty: 2 },
  { list: "Gaetano D'Aquino", db: null, qty: 9 },
  { list: 'Gaia', db: 'Domaine Bousquet Gaia', qty: 3 },
  { list: 'Gran Sangre de Toro', db: 'Gran Sangre de Toro Reserva', qty: 5 },
  { list: 'Hileras del Sol', db: 'Hileras del Sol Malbec', qty: 3 },
  { list: 'Inspiración', db: 'Inspiración Nebbiolo', qty: 1 },
  { list: 'L.A. Cetto Nebbiolo', db: 'L.A. Cetto Nebbiolo', qty: 2 },
  { list: 'L.A. Cetto Petit Sirah', db: 'L.A. Cetto Petit Syrah', qty: 4 },
  { list: 'L.A. Cetto Reserva Privada Cabernet', db: 'L.A. Cetto Cabernet Sauvignon', qty: 2 },
  { list: 'Linda Mora', db: 'Linda Mora Blend', qty: 11 },
  { list: 'Los Haroldos Cabernet', db: null, qty: 1 },
  { list: 'Los Haroldos Malbec', db: null, qty: 1 },
  { list: 'Luigi Bosca Cabernet', db: 'Luigi Bosca Cabernet Sauvignon', qty: 5 },
  { list: 'Mario Primo', db: null, qty: 3 },
  { list: 'Marqués de Cáceres', db: 'Marqués de Cáceres Crianza', qty: 4 },
  { list: 'Monte Xanic', db: 'Monte Xanic Cabernet Syrah', qty: 2 },
  { list: 'Navarro Correas Colección Privada', db: 'Navarro Correa Colección Privada Cabernet Sauvignon', qty: 10 },
  { list: 'Norton', db: 'Norton Reserva Malbec', qty: 1 },
  { list: 'Paladin', db: null, qty: 2 },
  { list: 'Pardosso Montepulciano', db: null, qty: 2 },
  { list: 'Portillo Cabernet', db: 'Portillo Cabernet Sauvignon', qty: 3 },
  { list: 'Portillo Malbec', db: 'Portillo Malbec', qty: 2 },
  { list: 'Ramón Roqueta', db: 'Ramón Roqueta Reserva', qty: 8 },
  { list: 'Red Blend Portugal', db: 'Red Blend Portugal', qty: 3 },
  { list: 'Rioja Vega', db: 'Rioja Vega Crianza', qty: 6 },
  { list: 'Sangre de Toro', db: null, qty: 2 },
  { list: 'Selección Tinto', db: null, qty: 4 },
  { list: 'Terrazas de los Andes', db: 'Terrazas de los Andes Malbec', qty: 9 },
  { list: 'Tierra de Ángeles', db: 'Tierra de Ángeles Nebbiolo', qty: 5 },
  { list: 'Trapiche Vineyards', db: 'Trapiche Vineyards Malbec', qty: 7 },
  { list: 'Trapiche Malbec', db: null, qty: 1 },
  { list: 'Trisquel Blend', db: 'Trisquel Blend Reserva', qty: 3 },
  { list: 'Trivento Golden Reserve Malbec', db: 'Trivento Golden Reserva Malbec', qty: 2 },
  { list: 'Trivento Reserve Cabernet', db: null, qty: 2 },
  { list: 'UNI', db: null, qty: 6 },
  { list: 'Valdeviero Crianza', db: 'Valderivero Crianza', qty: 3 },
  { list: 'Valdeviero Joven', db: null, qty: 6 },
  { list: 'Valdeviero Roble', db: null, qty: 1 },
  { list: 'Valle Ojos Negros', db: 'Calixa Ojos Negros Blanco', qty: 1 },
  { list: 'Villa de Liceaga', db: null, qty: 1 },
  { list: 'Viu Manent', db: null, qty: 12 },
  { list: 'Xolo', db: 'Xolo Nebbiolo', qty: 1 },
];

async function main() {
  const wines = await prisma.wine.findMany({ select: { id: true, name: true, stock: true } });
  const byName = new Map(wines.map(w => [w.name, w]));

  const keepIds = new Set<string>();
  const stockUpdates: { id: string; name: string; oldStock: number; newStock: number }[] = [];
  const missingDbMatches: string[] = [];

  for (const m of MAPPING) {
    if (!m.db) continue;
    const w = byName.get(m.db);
    if (!w) {
      missingDbMatches.push(`${m.list} -> ${m.db} (NOT FOUND)`);
      continue;
    }
    keepIds.add(w.id);
    if (w.stock !== m.qty) {
      stockUpdates.push({ id: w.id, name: w.name, oldStock: w.stock, newStock: m.qty });
    }
  }

  const toDelete = wines.filter(w => !keepIds.has(w.id));

  console.log(`KEEP: ${keepIds.size} wines`);
  console.log(`UPDATE STOCK: ${stockUpdates.length} wines`);
  console.log(`DELETE: ${toDelete.length} wines`);
  console.log(`LIST ITEMS WITHOUT DB MATCH (será preciso darlos de alta): ${MAPPING.filter(m => !m.db).length + missingDbMatches.length}`);
  if (missingDbMatches.length) {
    console.log('MISSING DB MATCHES (mapping wrong):');
    missingDbMatches.forEach(s => console.log('  ' + s));
  }

  if (process.argv.includes('--apply')) {
    console.log('\n=== APPLYING CHANGES ===');
    // Update stocks + record adjustments
    for (const u of stockUpdates) {
      const delta = u.newStock - u.oldStock;
      await prisma.wine.update({ where: { id: u.id }, data: { stock: u.newStock } });
      await prisma.inventoryAdjustment.create({
        data: {
          wineId: u.id,
          type: delta >= 0 ? 'increase' : 'decrease',
          quantity: Math.abs(delta),
          reason: 'Conteo físico de inventario',
          notes: `Ajuste por conteo físico (${u.oldStock} -> ${u.newStock})`,
        },
      });
      console.log(`  Updated stock: ${u.name} ${u.oldStock} -> ${u.newStock}`);
    }

    // Delete wines not in list
    for (const w of toDelete) {
      try {
        await prisma.wine.delete({ where: { id: w.id } });
        console.log(`  Deleted: ${w.name}`);
      } catch (e: any) {
        console.log(`  ERROR deleting ${w.name}: ${e.message}`);
      }
    }
    console.log('\nDONE');
  } else {
    console.log('\n(dry run; pass --apply to execute)');
  }

  await prisma.$disconnect();
}
main();
