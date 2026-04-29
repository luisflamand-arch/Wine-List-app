import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// ========== 1. RENAMES ==========
const RENAMES: { oldName: string; newName: string; extraData?: Record<string, any> }[] = [
  { oldName: 'Castelvecci', newName: 'Chianti Castelvecchi', extraData: { country: 'Italia', region: 'Toscana', grape: 'Sangiovese' } },
  { oldName: 'Donelli', newName: 'Donelli Lambrusco Dulce', extraData: { grape: 'Lambrusco' } },
  { oldName: 'Calixa Ojos Negros Blanco', newName: 'Calixa Ojos Negros Pinot Noir', extraData: { type: 'Tinto', grape: 'Pinot Noir' } },
  { oldName: 'Casa Madero 2V', newName: 'Casa Madero 2V Blanco' },
  { oldName: 'Linda Mora Blend', newName: 'Linda Mora' },
  { oldName: 'Trisquel Blend Reserva', newName: 'Trisquel Reserva Blend' },
  { oldName: 'Viu Manent', newName: 'Viu Manent Gran Reserva', extraData: { classification: 'Gran Reserva' } },
  { oldName: 'Cordus Blend', newName: 'Cordus Ensamble' },
  { oldName: 'Faustino Rivero Ulecia', newName: 'Faustino Rivero Ulecia Roble', extraData: { classification: 'Roble' } },
  { oldName: 'L.A. Cetto Cabernet Sauvignon', newName: 'L.A. Cetto Reserva Privada Cabernet', extraData: { classification: 'Reserva Privada' } },
  { oldName: 'Casillero del Diablo Reserva Privada', newName: 'Casillero del Diablo Colección Privada Cabernet', extraData: { classification: 'Colección Privada' } },
];

// ========== 2. PRICE UPDATES (DB name after renames → price) ==========
const PRICE_MAP: Record<string, number> = {
  // Argentina
  'Luigi Bosca Cabernet Sauvignon': 1480,
  'Navarro Correa Colección Privada Cabernet Sauvignon': 1080,
  'Amicorum': 1290,
  'Catena Zapata Reserva Cabernet Sauvignon': 1430,
  'Catena Zapata Reserva Malbec': 1430,
  'Domaine Bousquet Gaia': 1080,
  'Domaine Bousquet Cabernet Sauvignon': 1080,
  'Terrazas de los Andes Malbec': 1290,
  'Trivento Golden Reserva Malbec': 1240,
  'Trapiche Vineyards Malbec': 570,
  'Portillo Cabernet Sauvignon': 720,
  'Portillo Malbec': 720,
  'Hileras del Sol Malbec': 990,
  'Norton Reserva Malbec': 1190,
  'Alto Las Hormigas Malbec': 980,
  'Estancia Mendoza Bonarda': 490,
  'Finca Las Moras Malbec': 490,
  'Finca Las Moras Reserva': 720,
  'Las Moras Reserva Tannat': 720,
  'Alma Mora Malbec': 460,
  'Linda Mora': 490,
  'Estancia Mendoza Malbec': 490,
  'Trivento Reserve Cabernet': 490,
  'Trapiche Malbec': 490,
  'Doña Paula': 490,
  // México
  'Casa Madero 3V': 1250,
  'Casa Madero 2V Blanco': 980,
  'Xolo Nebbiolo': 2090,
  'Casa Magoni Nebbiolo': 1590,
  'Tierra de Ángeles Nebbiolo': 1090,
  'Inspiración Nebbiolo': 990,
  'Monte Xanic Cabernet Syrah': 1790,
  'Calixa Cabernet Sauvignon': 1190,
  'Calixa Ojos Negros Pinot Noir': 890,
  'Cordus Ensamble': 1290,
  'L.A. Cetto Reserva Privada Cabernet': 1050,
  'L.A. Cetto Petit Syrah': 510,
  'L.A. Cetto Nebbiolo': 990,
  // España
  'Alfonso López Tempranillo': 890,
  'Rioja Vega Crianza': 890,
  'Corrales del Monte': 650,
  'Dominio Fournier Reserva': 4490,
  'Emilio Moro': 2090,
  'Faustino Rivero Reserva': 690,
  'Faustino Rivero Ulecia Crianza': 890,
  'Marqués de Cáceres Crianza': 435,
  'Finca Resalso': 1150,
  'Acapella Crianza': 590,
  'Ramón Roqueta Reserva': 920,
  // Chile
  'Casillero del Diablo Red Blend': 750,
  'Casillero del Diablo Cabernet Sauvignon': 650,
  'Casillero del Diablo Colección Privada Cabernet': 990,
  'Casillero del Diablo Be Light': 540,
  'Viu Manent Gran Reserva': 890,
  'Trisquel Reserva Blend': 740,
  // Resto del mundo
  '19 Crimes': 790,
  'Red Blend Portugal': 350,
  'Château Bell Air': 450,
  // Italia
  'Amarone': 1890,
  "Gaetano D'Aquino": 420,
  'Donelli Lambrusco Dulce': 940,
};

// ========== 3. NEW WINES ==========
type NewWine = {
  name: string; price: number; type: string; country: string;
  region: string; grape: string; classification?: string;
};

const NEW_WINES: NewWine[] = [
  // --- Argentinos (re-alta stock=0) ---
  { name: 'Luigi Bosca Terroir Los Miradores', price: 2490, type: 'Tinto', country: 'Argentina', region: 'Mendoza', grape: 'Malbec' },
  { name: 'Luigi Bosca Malbec', price: 1480, type: 'Tinto', country: 'Argentina', region: 'Mendoza', grape: 'Malbec' },
  { name: 'Luigi Bosca Chardonnay', price: 1480, type: 'Blanco', country: 'Argentina', region: 'Mendoza', grape: 'Chardonnay' },
  { name: 'Navarro Correas Colección Privada Malbec', price: 1080, type: 'Tinto', country: 'Argentina', region: 'Mendoza', grape: 'Malbec' },
  { name: 'Domaine Bousquet Reserva', price: 1080, type: 'Tinto', country: 'Argentina', region: 'Mendoza', grape: 'Blend', classification: 'Reserva' },
  { name: 'Terrazas de los Andes Cabernet', price: 1290, type: 'Tinto', country: 'Argentina', region: 'Mendoza', grape: 'Cabernet Sauvignon' },
  { name: 'Terrazas de los Andes Torrontés', price: 1150, type: 'Blanco', country: 'Argentina', region: 'Mendoza', grape: 'Torrontés' },
  { name: 'Trapiche Pinot Noir', price: 690, type: 'Tinto', country: 'Argentina', region: 'Mendoza', grape: 'Pinot Noir' },
  { name: 'Trapiche Vineyards Cabernet', price: 570, type: 'Tinto', country: 'Argentina', region: 'Mendoza', grape: 'Cabernet Sauvignon' },
  { name: 'Benjamín Malbec', price: 460, type: 'Tinto', country: 'Argentina', region: 'Mendoza', grape: 'Malbec' },
  { name: 'Benjamín Cabernet Sauvignon', price: 460, type: 'Tinto', country: 'Argentina', region: 'Mendoza', grape: 'Cabernet Sauvignon' },
  { name: 'Don Nicanor Senetiner', price: 990, type: 'Tinto', country: 'Argentina', region: 'Mendoza', grape: 'Blend' },
  { name: 'Norton Barrel Select Malbec', price: 870, type: 'Tinto', country: 'Argentina', region: 'Mendoza', grape: 'Malbec' },
  { name: 'Finca Las Moras Chardonnay', price: 720, type: 'Blanco', country: 'Argentina', region: 'Mendoza', grape: 'Chardonnay' },
  { name: 'Estancia Mendoza Cabernet', price: 490, type: 'Tinto', country: 'Argentina', region: 'Mendoza', grape: 'Cabernet Sauvignon' },
  { name: 'Vasco Viejo Malbec', price: 520, type: 'Tinto', country: 'Argentina', region: 'Mendoza', grape: 'Malbec' },
  // --- Mexicanos (re-alta stock=0) ---
  { name: 'El Cielo Cabernet', price: 1120, type: 'Tinto', country: 'México', region: 'Baja California', grape: 'Cabernet Sauvignon' },
  { name: 'L.A. Cetto Don Luis Terra', price: 1070, type: 'Tinto', country: 'México', region: 'Baja California', grape: 'Blend' },
  { name: 'L.A. Cetto Cabernet Sauvignon', price: 910, type: 'Tinto', country: 'México', region: 'Baja California', grape: 'Cabernet Sauvignon' },
  { name: 'L.A. Cetto Tempranillo', price: 510, type: 'Tinto', country: 'México', region: 'Baja California', grape: 'Tempranillo' },
  { name: 'L.A. Cetto Sierra Blanca', price: 590, type: 'Tinto', country: 'México', region: 'Baja California', grape: 'Tempranillo' },
  { name: 'L.A. Cetto Rosado Zinfandel', price: 490, type: 'Rosado', country: 'México', region: 'Baja California', grape: 'Zinfandel' },
  { name: 'L.A. Cetto Reserva Nebbiolo', price: 1050, type: 'Tinto', country: 'México', region: 'Baja California', grape: 'Nebbiolo', classification: 'Reserva' },
  { name: 'Tierra de Ángeles Espumante', price: 540, type: 'Espumoso', country: 'México', region: 'Baja California', grape: 'Blend' },
  // --- Españoles (re-alta stock=0) ---
  { name: 'Bodega Zerran Reserva', price: 870, type: 'Tinto', country: 'España', region: 'España', grape: 'Tempranillo', classification: 'Reserva' },
  { name: 'Marqués del Riscal', price: 890, type: 'Tinto', country: 'España', region: 'Rioja', grape: 'Tempranillo' },
  { name: 'Marqués del Silvo Reserva', price: 750, type: 'Tinto', country: 'España', region: 'España', grape: 'Tempranillo', classification: 'Reserva' },
  { name: 'Hito Cepa 21', price: 770, type: 'Tinto', country: 'España', region: 'Ribera del Duero', grape: 'Tempranillo' },
  { name: 'López de Haro Blanco', price: 870, type: 'Blanco', country: 'España', region: 'Rioja', grape: 'Viura' },
  { name: 'López de Haro Blend', price: 740, type: 'Tinto', country: 'España', region: 'Rioja', grape: 'Tempranillo' },
  { name: 'Faustino Rivero Semidulce', price: 480, type: 'Blanco', country: 'España', region: 'España', grape: 'Blend' },
  // --- Chilenos (re-alta stock=0) ---
  { name: 'Casillero del Diablo Selección Blanco', price: 450, type: 'Blanco', country: 'Chile', region: 'Valle Central', grape: 'Blend' },
  // --- Resto del mundo (re-alta stock=0) ---
  { name: 'Pinot Rosé Garzón', price: 1020, type: 'Rosado', country: 'Uruguay', region: 'Maldonado', grape: 'Pinot Noir' },
  { name: 'Gewürztraminer Alsacia', price: 1190, type: 'Blanco', country: 'Francia', region: 'Alsacia', grape: 'Gewürztraminer' },
  { name: 'Le Petit Arnaud', price: 0, type: 'Tinto', country: 'Francia', region: 'Bordeaux', grape: 'Blend' },
  // --- Italianos nuevos ---
  { name: 'Sasso al Poggio', price: 1280, type: 'Tinto', country: 'Italia', region: 'Toscana', grape: 'Blend' },
  { name: "Barbera d'Asti", price: 990, type: 'Tinto', country: 'Italia', region: 'Piemonte', grape: 'Barbera' },
  { name: 'Asti Superiore Villa Panni', price: 930, type: 'Espumoso', country: 'Italia', region: 'Piemonte', grape: 'Moscato' },
  { name: 'Collezione Sangiovese', price: 470, type: 'Tinto', country: 'Italia', region: 'Italia', grape: 'Sangiovese' },
  { name: 'Frascati Bianco', price: 650, type: 'Blanco', country: 'Italia', region: 'Lazio', grape: 'Blend' },
  { name: 'Pinot Grigio', price: 650, type: 'Blanco', country: 'Italia', region: 'Italia', grape: 'Pinot Grigio' },
  { name: 'Prosecco Giacobazzi', price: 650, type: 'Espumoso', country: 'Italia', region: 'Veneto', grape: 'Glera' },
  { name: 'Prosecco Bianco', price: 480, type: 'Espumoso', country: 'Italia', region: 'Veneto', grape: 'Glera' },
  { name: 'Prosecco Rosado', price: 720, type: 'Espumoso', country: 'Italia', region: 'Veneto', grape: 'Glera' },
  { name: 'Asti Cinzano', price: 0, type: 'Espumoso', country: 'Italia', region: 'Piemonte', grape: 'Moscato' },
];

async function main() {
  const apply = process.argv.includes('--apply');
  let renamedCount = 0, priceUpdated = 0, createdCount = 0, costUpdated = 0;

  // --- STEP 1: RENAMES ---
  console.log('\n=== RENAMES ===');
  for (const r of RENAMES) {
    const w = await prisma.wine.findFirst({ where: { name: r.oldName } });
    if (!w) { console.log(`  SKIP (no encontrado): "${r.oldName}"`); continue; }
    console.log(`  ${r.oldName} → ${r.newName}${r.extraData ? ' + ' + JSON.stringify(r.extraData) : ''}`);
    if (apply) {
      await prisma.wine.update({ where: { id: w.id }, data: { name: r.newName, ...r.extraData } });
      renamedCount++;
    }
  }

  // --- STEP 2: PRICE UPDATES ---
  console.log('\n=== PRICE UPDATES ===');
  for (const [name, price] of Object.entries(PRICE_MAP)) {
    const w = await prisma.wine.findFirst({ where: { name } });
    if (!w) { console.log(`  SKIP (no encontrado): "${name}"`); continue; }
    const cost = Math.round(price * 0.45);
    if (w.price !== price || w.costPrice !== cost) {
      console.log(`  ${name}: $${w.price}→$${price} | costo $${w.costPrice}→$${cost}`);
      if (apply) {
        await prisma.wine.update({ where: { id: w.id }, data: { price, costPrice: cost } });
        priceUpdated++;
      }
    }
  }

  // --- STEP 3: COST UPDATE for existing wines that already have price but no cost ---
  console.log('\n=== COST SYNC (price>0 pero costPrice=0) ===');
  const needsCost = await prisma.wine.findMany({ where: { price: { gt: 0 }, costPrice: 0 } });
  for (const w of needsCost) {
    const cost = Math.round(w.price * 0.45);
    console.log(`  ${w.name}: costPrice 0 → $${cost}`);
    if (apply) {
      await prisma.wine.update({ where: { id: w.id }, data: { costPrice: cost } });
      costUpdated++;
    }
  }

  // --- STEP 4: NEW WINES ---
  console.log('\n=== NEW WINES (stock=0) ===');
  for (const nw of NEW_WINES) {
    const exists = await prisma.wine.findFirst({ where: { name: nw.name } });
    if (exists) { console.log(`  SKIP (ya existe): "${nw.name}"`); continue; }
    const cost = nw.price > 0 ? Math.round(nw.price * 0.45) : 0;
    console.log(`  CREATE: ${nw.name} | $${nw.price} | costo $${cost} | ${nw.type} | ${nw.country}`);
    if (apply) {
      await prisma.wine.create({
        data: {
          name: nw.name, price: nw.price, costPrice: cost,
          type: nw.type, country: nw.country, region: nw.region,
          grape: nw.grape, classification: nw.classification ?? null,
          stock: 0, minStock: 2, active: true,
          description: '', tastingNotes: '', imageUrl: null,
        },
      });
      createdCount++;
    }
  }

  // --- SUMMARY ---
  const total = await prisma.wine.count();
  const totalStock = await prisma.wine.aggregate({ _sum: { stock: true } });
  console.log(`\n=== RESUMEN ===`);
  console.log(`Renombrados: ${renamedCount}`);
  console.log(`Precios actualizados: ${priceUpdated}`);
  console.log(`Costos sincronizados: ${costUpdated}`);
  console.log(`Vinos creados: ${createdCount}`);
  console.log(`Total vinos en BD: ${total}`);
  console.log(`Stock total: ${totalStock._sum.stock}`);
  if (!apply) console.log('\n(DRY RUN — usa --apply para ejecutar)');

  await prisma.$disconnect();
}
main();
