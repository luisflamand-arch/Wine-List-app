"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var bcryptjs_1 = require("bcryptjs");
var prisma = new client_1.PrismaClient();
var imageMap = {
    Tinto: "https://cdn.abacus.ai/images/15cef13b-cc40-43ce-9117-d36940b46be6.png",
    Blanco: "https://cdn.abacus.ai/images/b6896bfc-a71e-4e46-be0a-de964995cba6.png",
    Rosado: "https://cdn.abacus.ai/images/76e980df-80d0-4668-b62e-9c78cf3ae9e7.png",
    Espumoso: "https://cdn.abacus.ai/images/43a534b0-2a55-412a-8d6f-561c92061bb7.png",
    Dulce: "https://cdn.abacus.ai/images/b6896bfc-a71e-4e46-be0a-de964995cba6.png",
};
function genDescription(name, type, country, region, grape, classification) {
    var _a, _b;
    var descs = {
        Tinto: [
            "Vino tinto de ".concat(region, ", ").concat(country, ". Elaborado con uvas ").concat(grape, ", este ").concat(classification || 'vino', " ofrece una expresi\u00F3n elegante del terroir con estructura firme y taninos bien integrados."),
            "Un ".concat(classification || 'tinto', " excepcional de ").concat(region, ". ").concat(grape, " en su m\u00E1xima expresi\u00F3n, con notas profundas y un final persistente que refleja la tradici\u00F3n vitivin\u00EDcola de ").concat(country, "."),
            "Proveniente de ".concat(region, ", ").concat(country, ", este vino de ").concat(grape, " presenta un car\u00E1cter distinguido con cuerpo medio-alto y una personalidad que invita a descubrirlo copa a copa."),
        ],
        Blanco: [
            "Vino blanco fresco y arom\u00E1tico de ".concat(region, ", ").concat(country, ". Elaborado con ").concat(grape, ", presenta una acidez vibrante y notas frutales que lo hacen ideal para acompa\u00F1ar mariscos y platillos ligeros."),
            "Un blanco elegante de ".concat(region, " que expresa la frescura de ").concat(grape, " con una mineralidad sutil y un final limpio y refrescante."),
        ],
        Rosado: [
            "Rosado delicado de ".concat(region, ", ").concat(country, ". Elaborado con ").concat(grape, ", ofrece un color encantador y aromas florales con notas de frutos rojos frescos."),
        ],
        Espumoso: [
            "Espumoso elegante de ".concat(region, ", ").concat(country, ". Burbujas finas y persistentes con aromas de pan tostado y frutos blancos. Ideal para celebrar momentos especiales."),
        ],
    };
    var options = (_a = descs[type]) !== null && _a !== void 0 ? _a : descs.Tinto;
    return (_b = options[Math.floor(Math.random() * options.length)]) !== null && _b !== void 0 ? _b : options[0];
}
function genTastingNotes(type, grape) {
    var _a, _b;
    var notes = {
        Tinto: [
            "Nariz: Frutos rojos maduros, especias, vainilla. Boca: Taninos sedosos, buena estructura, final largo con notas de chocolate negro.",
            "Aromas de cereza negra, pimienta y roble tostado. En boca es redondo, con buena acidez y un retrogusto de frutos del bosque.",
            "Notas de ciruela, tabaco y cuero. Paladar complejo con taninos elegantes y un final especiado y persistente.",
        ],
        Blanco: [
            "Nariz: C\u00EDtricos, manzana verde, flores blancas. Boca: Fresco, mineral, con acidez equilibrada y un final limpio.",
            "Aromas de durazno, pera y un toque de miel. En boca es untuoso pero fresco, con buena longitud.",
        ],
        Rosado: [
            "Nariz: Fresa, frambuesa, p\u00E9talos de rosa. Boca: Ligero, refrescante, con acidez vibrante y un final frutal.",
        ],
        Espumoso: [
            "Burbuja fina y persistente. Aromas de pan brioche, manzana y notas c\u00EDtricas. Paladar cremoso con un final elegante.",
        ],
    };
    var options = (_a = notes[type]) !== null && _a !== void 0 ? _a : notes.Tinto;
    return (_b = options[Math.floor(Math.random() * options.length)]) !== null && _b !== void 0 ? _b : options[0];
}
function randomPrice(type, classification) {
    var _a, _b, _c;
    var base = 400;
    if ((_a = classification === null || classification === void 0 ? void 0 : classification.toLowerCase()) === null || _a === void 0 ? void 0 : _a.includes("reserva"))
        base = 700;
    if ((_b = classification === null || classification === void 0 ? void 0 : classification.toLowerCase()) === null || _b === void 0 ? void 0 : _b.includes("gran reserva"))
        base = 1000;
    if ((_c = classification === null || classification === void 0 ? void 0 : classification.toLowerCase()) === null || _c === void 0 ? void 0 : _c.includes("crianza"))
        base = 600;
    if (type === "Espumoso")
        base = 600;
    var variation = Math.floor(Math.random() * 400);
    return Math.round((base + variation) / 10) * 10;
}
function randomStock() {
    return Math.floor(Math.random() * 16) + 5;
}
function randomVintage() {
    return String(2018 + Math.floor(Math.random() * 6));
}
var wines = [
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
function main() {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var hash1, hash2, _i, wines_1, w, price, stock, vintage, img;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log("Seeding database...");
                    return [4 /*yield*/, bcryptjs_1.default.hash("johndoe123", 12)];
                case 1:
                    hash1 = _b.sent();
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: "john@doe.com" },
                            update: {},
                            create: { email: "john@doe.com", password: hash1, name: "Admin", role: "admin" },
                        })];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, bcryptjs_1.default.hash("admin123", 12)];
                case 3:
                    hash2 = _b.sent();
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: "admin@winelist.com" },
                            update: {},
                            create: { email: "admin@winelist.com", password: hash2, name: "Administrador", role: "admin" },
                        })];
                case 4:
                    _b.sent();
                    // Settings
                    return [4 /*yield*/, prisma.settings.upsert({
                            where: { id: "default" },
                            update: {},
                            create: {
                                id: "default",
                                restaurantName: "La Vinoteca",
                                primaryColor: "#8B6914",
                                secondaryColor: "#1A1A2E",
                                accentColor: "#D4AF37",
                            },
                        })];
                case 5:
                    // Settings
                    _b.sent();
                    _i = 0, wines_1 = wines;
                    _b.label = 6;
                case 6:
                    if (!(_i < wines_1.length)) return [3 /*break*/, 9];
                    w = wines_1[_i];
                    price = randomPrice(w.type, w.classification);
                    stock = randomStock();
                    vintage = randomVintage();
                    img = (_a = imageMap[w.type]) !== null && _a !== void 0 ? _a : imageMap.Tinto;
                    return [4 /*yield*/, prisma.wine.upsert({
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
                                vintage: vintage,
                                price: price,
                                stock: stock,
                                minStock: 3,
                                imageUrl: img,
                                description: genDescription(w.name, w.type, w.country, w.region, w.grape, w.classification),
                                tastingNotes: genTastingNotes(w.type, w.grape),
                                active: true,
                            },
                        })];
                case 7:
                    _b.sent();
                    _b.label = 8;
                case 8:
                    _i++;
                    return [3 /*break*/, 6];
                case 9:
                    console.log("Seeded ".concat(wines.length, " wines successfully."));
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error(e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
