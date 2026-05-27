import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type W = {
  name: string;
  qty: number;
  type?: string; // Tinto, Blanco, Rosado, Espumoso
  country?: string;
  region?: string;
  grape?: string;
  classification?: string;
};

// 33 vinos pendientes. Datos cruzados con Excel INV.VINO.TR.xlsx donde aplica.
const PENDING: W[] = [
  { name: 'Alma Mora Cabernet', qty: 2, type: 'Tinto', country: 'Argentina', region: 'Mendoza', grape: 'Cabernet Sauvignon' },
  { name: 'Amarone', qty: 3, type: 'Tinto', country: 'Italia', region: 'Veneto', grape: 'Corvina Blend' },
  { name: 'Arthur Mertz', qty: 2 },
  { name: 'Asticca', qty: 1, type: 'Tinto', country: 'Argentina', region: 'Mendoza', grape: 'Cabernet Sauvignon' },
  { name: 'Bolla', qty: 2, type: 'Tinto', country: 'Italia' },
  { name: 'Casillero del Diablo Reserva Privada', qty: 4, type: 'Tinto', country: 'Chile', region: 'Valle Central', grape: 'Cabernet Sauvignon', classification: 'Reserva Privada' },
  { name: 'Casa Madero Shiraz', qty: 1, type: 'Tinto', country: 'México', region: 'Coahuila', grape: 'Shiraz' },
  { name: 'Castalunga', qty: 6, type: 'Tinto', country: 'Italia' },
  { name: 'Castelvecci', qty: 1, type: 'Tinto', country: 'Italia' },
  { name: 'Chateau de Marians', qty: 3, type: 'Tinto', country: 'Francia', region: 'Bordeaux', grape: 'Blend' },
  { name: 'Chianti Clásico Kirkland', qty: 1, type: 'Tinto', country: 'Italia', region: 'Toscana', grape: 'Sangiovese' },
  { name: 'Cuore de la Toscana', qty: 2, type: 'Tinto', country: 'Italia', region: 'Toscana', grape: 'Blend' },
  { name: 'Decordi', qty: 3, type: 'Tinto', country: 'Italia' },
  { name: 'Donelli', qty: 5, type: 'Tinto', country: 'Italia' },
  { name: 'Doña Paula', qty: 2, type: 'Tinto', country: 'Argentina', region: 'Mendoza', grape: 'Blend' },
  { name: 'Finca Beltrán Dúo', qty: 1, type: 'Tinto', country: 'Argentina', region: 'Mendoza', grape: 'Syrah Cabernet' },
  { name: 'Finca Manzanos', qty: 2, type: 'Tinto', country: 'España', region: 'Rioja', grape: 'Tempranillo' },
  { name: 'Frulli Grave', qty: 2, type: 'Tinto', country: 'Italia' },
  { name: "Gaetano D'Aquino", qty: 9, type: 'Tinto', country: 'Italia' },
  { name: 'Los Haroldos Cabernet', qty: 1, type: 'Tinto', country: 'Argentina', region: 'Mendoza', grape: 'Cabernet Sauvignon' },
  { name: 'Los Haroldos Malbec', qty: 1, type: 'Tinto', country: 'Argentina', region: 'Mendoza', grape: 'Malbec' },
  { name: 'Mario Primo', qty: 3, type: 'Tinto', country: 'Italia' },
  { name: 'Paladin', qty: 2, type: 'Tinto', country: 'Italia' },
  { name: 'Pardosso Montepulciano', qty: 2, type: 'Tinto', country: 'Italia', grape: 'Montepulciano' },
  { name: 'Sangre de Toro', qty: 2, type: 'Tinto', country: 'España', region: 'Cataluña', grape: 'Tempranillo' },
  { name: 'Selección Tinto', qty: 4, type: 'Tinto' },
  { name: 'Trapiche Malbec', qty: 1, type: 'Tinto', country: 'Argentina', region: 'Mendoza', grape: 'Malbec' },
  { name: 'Trivento Reserve Cabernet', qty: 2, type: 'Tinto', country: 'Argentina', region: 'Mendoza', grape: 'Cabernet Sauvignon', classification: 'Reserve' },
  { name: 'UNI', qty: 6, type: 'Tinto', country: 'Argentina', region: 'Mendoza' },
  { name: 'Valdeviero Joven', qty: 6, type: 'Tinto', country: 'España', region: 'Ribera del Duero', grape: 'Tempranillo', classification: 'Joven' },
  { name: 'Valdeviero Roble', qty: 1, type: 'Tinto', country: 'España', region: 'Ribera del Duero', grape: 'Tempranillo', classification: 'Roble' },
  { name: 'Villa de Liceaga', qty: 1, type: 'Tinto', country: 'México' },
  { name: 'Viu Manent', qty: 12, type: 'Tinto', country: 'Chile', region: 'Valle de Colchagua' },
];

async function main() {
  const apply = process.argv.includes('--apply');
  let created = 0;
  for (const w of PENDING) {
    const existing = await prisma.wine.findFirst({ where: { name: w.name } });
    if (existing) {
      console.log(`SKIP (existe): ${w.name}`);
      continue;
    }
    console.log(`CREATE: ${w.name} | ${w.type ?? ''} | ${w.country ?? ''} | ${w.region ?? ''} | ${w.grape ?? ''} | stock=${w.qty}`);
    if (apply) {
      await prisma.wine.create({
        data: {
          name: w.name,
          type: w.type ?? 'Tinto',
          country: w.country ?? '',
          region: w.region ?? '',
          grape: w.grape ?? '',
          classification: w.classification ?? null,
          price: 0,
          costPrice: 0,
          stock: w.qty,
          minStock: 2,
          active: true,
          description: '',
          tastingNotes: '',
          imageUrl: null,
        },
      });
      created++;
    }
  }
  console.log(`\nTotal procesados: ${PENDING.length}. Creados: ${created}. ${apply ? '' : '(dry run, usa --apply)'}`);
  await prisma.$disconnect();
}
main();
