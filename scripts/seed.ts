import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const imageMap: Record<string, string> = {
  Tinto: "https://cdn.abacus.ai/images/15cef13b-cc40-43ce-9117-d36940b46be6.png",
  Blanco: "https://cdn.abacus.ai/images/b6896bfc-a71e-4e46-be0a-de964995cba6.png",
  Rosado: "https://cdn.abacus.ai/images/76e980df-80d0-4668-b62e-9c78cf3ae9e7.png",
  Espumoso: "https://cdn.abacus.ai/images/43a534b0-2a55-412a-8d6f-561c92061bb7.png",
  Dulce: "https://cdn.abacus.ai/images/b6896bfc-a71e-4e46-be0a-de964995cba6.png",
};

function genDescription(name: string, type: string, country: string, region: string, grape: string, classification: string): string {
  const descs: Record<string, string[]> = {
    Tinto: [
      `Vino tinto de ${region}, ${country}. Elaborado con uvas ${grape}, este ${classification || 'vino'} ofrece una expresión elegante del terroir con estructura firme y taninos bien integrados.`,
      `Un ${classification || 'tinto'} excepcional de ${region}. ${grape} en su máxima expresión, con notas profundas y un final persistente que refleja la tradición vitivinícola de ${country}.`,
      `Proveniente de ${region}, ${country}, este vino de ${grape} presenta un carácter distinguido con cuerpo medio-alto y una personalidad que invita a descubrirlo copa a copa.`,
    ],
    Blanco: [
      `Vino blanco fresco y aromático de ${region}, ${country}. Elaborado con ${grape}, presenta una acidez vibrante y notas frutales que lo hacen ideal para acompañar mariscos y platillos ligeros.`,
      `Un blanco elegante de ${region} que expresa la frescura de ${grape} con una mineralidad sutil y un final limpio y refrescante.`,
    ],
    Rosado: [
      `Rosado delicado de ${region}, ${country}. Elaborado con ${grape}, ofrece un color encantador y aromas florales con notas de frutos rojos frescos.`,
    ],
    Espumoso: [
      `Espumoso elegante de ${region}, ${country}. Burbujas finas y persistentes con aromas de pan tostado y frutos blancos. Ideal para celebrar momentos especiales.`,
    ],
  };
  const options = descs[type] ?? descs.Tinto;
  return options[Math.floor(Math.random() * options.length)] ?? options[0];
}

function genTastingNotes(type: string, grape: string): string {
  const notes: Record<string, string[]> = {
    Tinto: [
      `Nariz: Frutos rojos maduros, especias, vainilla. Boca: Taninos sedosos, buena estructura, final largo con notas de chocolate negro.`,
      `Aromas de cereza negra, pimienta y roble tostado. En boca es redondo, con buena acidez y un retrogusto de frutos del bosque.`,
      `Notas de ciruela, tabaco y cuero. Paladar complejo con taninos elegantes y un final especiado y persistente.`,
    ],
    Blanco: [
      `Nariz: Cítricos, manzana verde, flores blancas. Boca: Fresco, mineral, con acidez equilibrada y un final limpio.`,
      `Aromas de durazno, pera y un toque de miel. En boca es untuoso pero fresco, con buena longitud.`,
    ],
    Rosado: [
      `Nariz: Fresa, frambuesa, pétalos de rosa. Boca: Ligero, refrescante, con acidez vibrante y un final frutal.`,
    ],
    Espumoso: [
      `Burbuja fina y persistente. Aromas de pan brioche, manzana y notas cítricas. Paladar cremoso con un final elegante.`,
    ],
  };
  const options = notes[type] ?? notes.Tinto;
  return options[Math.floor(Math.random() * options.length)] ?? options[0];
}

function randomPrice(type: string, classification: string): number {
  let base = 400;
  if (classification?.toLowerCase()?.includes("reserva")) base = 700;
  if (classification?.toLowerCase()?.includes("gran reserva")) base = 1000;
  if (classification?.toLowerCase()?.includes("crianza")) base = 600;
  if (type === "Espumoso") base = 600;
  const variation = Math.floor(Math.random() * 400);
  return Math.round((base + variation) / 10) * 10;
}

function randomStock(): number {
  return Math.floor(Math.random() * 16) + 5;
}

function randomVintage(): string {
  return String(2018 + Math.floor(Math.random() * 6));
}

interface WineData {
  name: string;
  type: string;
  country: string;
  region: string;
  grape: string;
  classification: string;
}

const wines: WineData[] = [
  // Argentina
  { name: "Luigi Bosca Terroir Los Miradores", type: "Tinto", country: "Argentina", region: "Mendoza", grape: "Malbec", classification: "Terroir" },
  { name: "Luigi Bosca Malbec", type: "Tinto", country: "Argentina", region: "Mendoza", grape: "Malbec", classification: "" },
  { name: "Luigi Bosca Cabernet Sauvignon", type: "Tinto", country: "Argentina", region: "Mendoza", grape: "Cabernet Sauvignon", classification: "" },
  { name: "Luigi Bosca Chardonnay", type: "Blanco", country: "Argentina", region: "Mendoza", grape: "Chardonnay", classification: "" },
  { name: "Navarro Correa Colección Privada Cabernet Sauvignon", type: "Tinto", country: "Argentina", region: "Mendoza", grape: "Cabernet Sauvignon", classification: "Colección Privada" },
  { name: "Navarro Correa Colección Privada Malbec", type: "Tinto", country: "Argentina", region: "Mendoza", grape: "Malbec", classification: "Colección Privada" },
  { name: "Amicorum", type: "Tinto", country: "Argentina", region: "Argentina", grape: "Blend", classification: "" },
  { name: "Catena Zapata Reserva Cabernet Sauvignon", type: "Tinto", country: "Argentina", region: "Mendoza", grape: "Cabernet Sauvignon", classification: "Reserva" },
  { name: "Catena Zapata Reserva Malbec", type: "Tinto", country: "Argentina", region: "Mendoza", grape: "Malbec", classification: "Reserva" },
  { name: "Domaine Bousquet Gaia", type: "Tinto", country: "Argentina", region: "Mendoza", grape: "Blend", classification: "Gaia" },
  { name: "Domaine Bousquet Cabernet Sauvignon", type: "Tinto", country: "Argentina", region: "Mendoza", grape: "Cabernet Sauvignon", classification: "" },
  { name: "Domaine Bousquet Reserva", type: "Tinto", country: "Argentina", region: "Mendoza", grape: "Blend", classification: "Reserva" },
  { name: "Estancia Mendoza Bonarda", type: "Tinto", country: "Argentina", region: "Mendoza", grape: "Bonarda", classification: "" },
  { name: "Estancia Mendoza Malbec", type: "Tinto", country: "Argentina", region: "Mendoza", grape: "Malbec", classification: "" },
  { name: "Estancia Mendoza Cabernet Sauvignon", type: "Tinto", country: "Argentina", region: "Mendoza", grape: "Cabernet Sauvignon", classification: "" },
  { name: "Estancia Mendoza Reserva", type: "Tinto", country: "Argentina", region: "Mendoza", grape: "Blend", classification: "Reserva" },
  { name: "Finca Las Moras Malbec", type: "Tinto", country: "Argentina", region: "Mendoza", grape: "Malbec", classification: "" },
  { name: "Finca Las Moras Reserva", type: "Tinto", country: "Argentina", region: "Mendoza", grape: "Blend", classification: "Reserva" },
  { name: "Finca Las Moras Chardonnay", type: "Blanco", country: "Argentina", region: "Mendoza", grape: "Chardonnay", classification: "" },
  { name: "Alma Mora Malbec", type: "Tinto", country: "Argentina", region: "Argentina", grape: "Malbec", classification: "" },
  { name: "Las Moras Reserva Tannat", type: "Tinto", country: "Argentina", region: "Mendoza", grape: "Tannat", classification: "Reserva" },
  { name: "Linda Mora Blend", type: "Tinto", country: "Argentina", region: "Argentina", grape: "Blend", classification: "" },
  { name: "Terrazas de los Andes Malbec", type: "Tinto", country: "Argentina", region: "Mendoza", grape: "Malbec", classification: "" },
  { name: "Terrazas de los Andes Cabernet Sauvignon", type: "Tinto", country: "Argentina", region: "Mendoza", grape: "Cabernet Sauvignon", classification: "" },
  { name: "Hileras del Sol Malbec", type: "Tinto", country: "Argentina", region: "Mendoza", grape: "Malbec", classification: "" },
  { name: "Trivento Golden Reserva Malbec", type: "Tinto", country: "Argentina", region: "Mendoza", grape: "Malbec", classification: "Reserva" },
  { name: "Norton Barrel Select Malbec", type: "Tinto", country: "Argentina", region: "Mendoza", grape: "Malbec", classification: "Barrel Select" },
  { name: "Norton Reserva Malbec", type: "Tinto", country: "Argentina", region: "Mendoza", grape: "Malbec", classification: "Reserva" },
  { name: "Alto Las Hormigas Malbec", type: "Tinto", country: "Argentina", region: "Mendoza", grape: "Malbec", classification: "" },
  { name: "Trapiche Pinot Noir", type: "Tinto", country: "Argentina", region: "Mendoza", grape: "Pinot Noir", classification: "" },
  { name: "Trapiche Vineyards Malbec", type: "Tinto", country: "Argentina", region: "Mendoza", grape: "Malbec", classification: "Vineyards" },
  { name: "Trapiche Vineyards Cabernet Sauvignon", type: "Tinto", country: "Argentina", region: "Mendoza", grape: "Cabernet Sauvignon", classification: "Vineyards" },
  { name: "Portillo Cabernet Sauvignon", type: "Tinto", country: "Argentina", region: "Mendoza", grape: "Cabernet Sauvignon", classification: "" },
  { name: "Portillo Malbec", type: "Tinto", country: "Argentina", region: "Mendoza", grape: "Malbec", classification: "" },
  { name: "Terrazas de los Andes Torrontés", type: "Blanco", country: "Argentina", region: "Mendoza", grape: "Torrontés", classification: "" },
  { name: "Benjamín Malbec", type: "Tinto", country: "Argentina", region: "Mendoza", grape: "Malbec", classification: "" },
  { name: "Benjamín Cabernet Sauvignon", type: "Tinto", country: "Argentina", region: "Mendoza", grape: "Cabernet Sauvignon", classification: "" },
  { name: "Don Nicanor Nieto Senetiner", type: "Tinto", country: "Argentina", region: "Mendoza", grape: "Blend", classification: "" },
  // España
  { name: "Alfonso López Tempranillo", type: "Tinto", country: "España", region: "Rioja", grape: "Tempranillo", classification: "" },
  { name: "Rioja Vega Crianza", type: "Tinto", country: "España", region: "Rioja", grape: "Tempranillo", classification: "Crianza" },
  { name: "Bodega Zerran Reserva", type: "Tinto", country: "España", region: "España", grape: "Tempranillo", classification: "Reserva" },
  { name: "Corrales del Monte", type: "Tinto", country: "España", region: "España", grape: "Tempranillo", classification: "" },
  { name: "Dominio Fournier Reserva", type: "Tinto", country: "España", region: "Ribera del Duero", grape: "Tempranillo", classification: "Reserva" },
  { name: "Emilio Moro", type: "Tinto", country: "España", region: "Ribera del Duero", grape: "Tempranillo", classification: "" },
  { name: "Faustino Rivero Blanco", type: "Blanco", country: "España", region: "España", grape: "Blend", classification: "" },
  { name: "Faustino Rivero Reserva", type: "Tinto", country: "España", region: "Rioja", grape: "Tempranillo", classification: "Reserva" },
  { name: "Faustino Rivero Ulecia", type: "Tinto", country: "España", region: "Rioja", grape: "Tempranillo", classification: "" },
  { name: "Faustino Rivero Ulecia Crianza", type: "Tinto", country: "España", region: "Rioja", grape: "Tempranillo", classification: "Crianza" },
  { name: "Marqués de Cáceres Crianza", type: "Tinto", country: "España", region: "Rioja", grape: "Tempranillo", classification: "Crianza" },
  { name: "Finca Resalso", type: "Tinto", country: "España", region: "Ribera del Duero", grape: "Tempranillo", classification: "" },
  { name: "Hito Cepa 21", type: "Tinto", country: "España", region: "Ribera del Duero", grape: "Tempranillo", classification: "" },
  { name: "López Haro Blanco Viura", type: "Blanco", country: "España", region: "Rioja", grape: "Viura", classification: "" },
  { name: "López Haro Tempranillo", type: "Tinto", country: "España", region: "Rioja", grape: "Tempranillo", classification: "" },
  { name: "Marqués del Riscal", type: "Tinto", country: "España", region: "Rioja", grape: "Tempranillo", classification: "" },
  { name: "Marqués del Silvo Reserva", type: "Tinto", country: "España", region: "España", grape: "Tempranillo", classification: "Reserva" },
  { name: "Acapella Crianza", type: "Tinto", country: "España", region: "España", grape: "Tempranillo", classification: "Crianza" },
  { name: "Ramón Roqueta Reserva", type: "Tinto", country: "España", region: "Cataluña", grape: "Garnacha Blend", classification: "Reserva" },
  { name: "Rioja Vega Tempranillo", type: "Tinto", country: "España", region: "Rioja", grape: "Tempranillo", classification: "" },
  { name: "Gran Sangre de Toro", type: "Tinto", country: "España", region: "Cataluña", grape: "Tempranillo", classification: "" },
  { name: "Gran Sangre de Toro Reserva", type: "Tinto", country: "España", region: "Cataluña", grape: "Tempranillo", classification: "Reserva" },
  { name: "Valderivero Crianza", type: "Tinto", country: "España", region: "España", grape: "Tempranillo", classification: "Crianza" },
  { name: "López Haro Blanco", type: "Blanco", country: "España", region: "Rioja", grape: "Viura", classification: "" },
  { name: "Villa Esmeralda Blanco", type: "Blanco", country: "España", region: "Cataluña", grape: "Moscatel", classification: "" },
  { name: "López Haro Crianza", type: "Tinto", country: "España", region: "Rioja", grape: "Tempranillo", classification: "Crianza" },
  // Chile
  { name: "Casillero del Diablo Red Blend", type: "Tinto", country: "Chile", region: "Valle Central", grape: "Blend", classification: "" },
  { name: "Casillero del Diablo Cabernet Sauvignon", type: "Tinto", country: "Chile", region: "Valle Central", grape: "Cabernet Sauvignon", classification: "" },
  { name: "Casillero del Diablo Blend", type: "Tinto", country: "Chile", region: "Valle Central", grape: "Blend", classification: "" },
  { name: "Colección Privada Cabernet Sauvignon", type: "Tinto", country: "Chile", region: "Valle Central", grape: "Cabernet Sauvignon", classification: "Colección Privada" },
  { name: "Casillero del Diablo Be Light", type: "Tinto", country: "Chile", region: "Chile", grape: "Blend", classification: "Be Light" },
  { name: "Casillero del Diablo Selección Blanco", type: "Blanco", country: "Chile", region: "Valle Central", grape: "Blend", classification: "Selección" },
  { name: "Trisquel Blend Reserva", type: "Tinto", country: "Chile", region: "Chile", grape: "Blend", classification: "Reserva" },
  // Uruguay
  { name: "Pinot Rosé Garzón", type: "Rosado", country: "Uruguay", region: "Maldonado", grape: "Pinot Noir", classification: "" },
  { name: "Alianza Tannat", type: "Tinto", country: "Uruguay", region: "Uruguay", grape: "Tannat", classification: "" },
  // Francia
  { name: "Gewurztraminer Alsacia", type: "Blanco", country: "Francia", region: "Alsacia", grape: "Gewurztraminer", classification: "" },
  { name: "Château Bell Air", type: "Tinto", country: "Francia", region: "Bordeaux", grape: "Blend", classification: "" },
  { name: "Le Petit Arnauds", type: "Tinto", country: "Francia", region: "Bordeaux", grape: "Blend", classification: "" },
  // Australia
  { name: "7 Crimes", type: "Tinto", country: "Australia", region: "Australia", grape: "Blend", classification: "" },
  // Portugal
  { name: "Red Blend Portugal", type: "Tinto", country: "Portugal", region: "Portugal", grape: "Blend", classification: "" },
  // México
  { name: "Casa Madero 3V", type: "Tinto", country: "México", region: "Coahuila", grape: "Blend", classification: "" },
  { name: "Casa Madero 2V", type: "Blanco", country: "México", region: "Coahuila", grape: "Blend", classification: "" },
  { name: "Xolo Nebbiolo", type: "Tinto", country: "México", region: "Baja California", grape: "Nebbiolo", classification: "" },
  { name: "Casa Magoni Nebbiolo", type: "Tinto", country: "México", region: "Baja California", grape: "Nebbiolo", classification: "" },
  { name: "Tierra de Ángeles Nebbiolo", type: "Tinto", country: "México", region: "Baja California", grape: "Nebbiolo", classification: "" },
  { name: "Inspiración Nebbiolo", type: "Tinto", country: "México", region: "Baja California", grape: "Nebbiolo", classification: "" },
  { name: "L.A. Cetto Nebbiolo", type: "Tinto", country: "México", region: "Baja California", grape: "Nebbiolo", classification: "" },
  { name: "El Cielo Cabernet Sauvignon", type: "Tinto", country: "México", region: "Baja California", grape: "Cabernet Sauvignon", classification: "" },
  { name: "Cordus Blend", type: "Tinto", country: "México", region: "Baja California", grape: "Blend", classification: "" },
  { name: "Monte Xanic Cabernet Syrah", type: "Tinto", country: "México", region: "Baja California", grape: "Cabernet Syrah", classification: "" },
  { name: "Calixa Cabernet Sauvignon", type: "Tinto", country: "México", region: "Baja California", grape: "Cabernet Sauvignon", classification: "" },
  { name: "Calixa Ojos Negros Blanco", type: "Blanco", country: "México", region: "Baja California", grape: "Blend", classification: "" },
  { name: "L.A. Cetto Don Luis Terra", type: "Tinto", country: "México", region: "Baja California", grape: "Blend", classification: "" },
  { name: "L.A. Cetto Cabernet Sauvignon", type: "Tinto", country: "México", region: "Baja California", grape: "Cabernet Sauvignon", classification: "" },
  { name: "L.A. Cetto Petit Syrah", type: "Tinto", country: "México", region: "Baja California", grape: "Petit Syrah", classification: "" },
  { name: "L.A. Cetto Tempranillo", type: "Tinto", country: "México", region: "Baja California", grape: "Tempranillo", classification: "" },
  { name: "L.A. Cetto Sierra Blanca", type: "Tinto", country: "México", region: "Baja California", grape: "Tempranillo", classification: "" },
  { name: "L.A. Cetto Rosado Zinfandel", type: "Rosado", country: "México", region: "Baja California", grape: "Zinfandel", classification: "" },
  { name: "Tierra de Ángeles Espumoso", type: "Espumoso", country: "México", region: "Baja California", grape: "Blend", classification: "" },
];

async function main() {
  console.log("Seeding database...");

  // Users
  const hash1 = await bcrypt.hash("johndoe123", 12);
  await prisma.user.upsert({
    where: { email: "john@doe.com" },
    update: {},
    create: { email: "john@doe.com", password: hash1, name: "Admin", role: "admin" },
  });

  const hash2 = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@winelist.com" },
    update: {},
    create: { email: "admin@winelist.com", password: hash2, name: "Administrador", role: "admin" },
  });

  const hash3 = await bcrypt.hash("mesero123", 12);
  await prisma.user.upsert({
    where: { email: "mesero@winelist.com" },
    update: {},
    create: { email: "mesero@winelist.com", password: hash3, name: "Juan Mesero", role: "mesero" },
  });

  // Settings
  await prisma.settings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      restaurantName: "La Vinoteca",
      primaryColor: "#8B6914",
      secondaryColor: "#1A1A2E",
      accentColor: "#D4AF37",
    },
  });

  // Wines
  for (const w of wines) {
    const price = randomPrice(w.type, w.classification);
    const costPrice = Math.round(price * 0.45); // Margen típico: 45% costo, 55% ganancia
    const stock = randomStock();
    const vintage = randomVintage();
    const img = imageMap[w.type] ?? imageMap.Tinto;
    await prisma.wine.upsert({
      where: { id: w.name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase().slice(0, 50) },
      update: {},
      create: {
        id: w.name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase().slice(0, 50),
        name: w.name,
        type: w.type,
        country: w.country,
        region: w.region,
        grape: w.grape,
        classification: w.classification || null,
        vintage,
        price,
        costPrice,
        stock,
        minStock: 3,
        imageUrl: img,
        description: genDescription(w.name, w.type, w.country, w.region, w.grape, w.classification),
        tastingNotes: genTastingNotes(w.type, w.grape),
        active: true,
      },
    });
  }

  console.log(`Seeded ${wines.length} wines successfully.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
