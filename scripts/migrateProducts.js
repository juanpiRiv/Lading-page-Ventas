"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
var firestore_1 = require("firebase/firestore");
var firebase_js_1 = require("../lib/firebase.js"); // Use relative path with .js extension
require("dotenv/config"); // Import dotenv to load environment variables
// Initialize Firebase services
var db = (0, firestore_1.getFirestore)(firebase_js_1.default);
var categoriesToMigrate = [
    { id: "pescado-mar", name: "Pescado de Mar" },
    { id: "pescado-rio", name: "Pescado de Río" },
    { id: "mariscos", name: "Mariscos" },
    { id: "conservas", name: "Conservas" },
    { id: "preparados", name: "Platos Preparados" },
];
var productsToMigrate = [
    {
        name: "Salmón Rosado Fresco",
        category: "Pescado de Mar",
        origin: "Patagonia Argentina",
        description: "Salmón rosado fresco, rico en Omega 3. Ideal para horno o parrilla.",
        price: 1500,
        nutritionalInfo: { protein: 20, fat: 12, calories: 208, omega3: 2.5 },
        stock: 100,
        unit: "kg",
        minOrder: 0.5,
        maxOrder: 5,
        freshness: 5,
        rating: 4.8,
        images: ["/fresh-salmon-fillet.jpg"],
        tags: ["salmón", "fresco", "mar", "premium"],
    },
    {
        name: "Merluza Fresca",
        category: "Pescado de Mar",
        origin: "Atlántico Sur",
        description: "Filetes de merluza fresca, sin espinas. Perfecta para rebozar o cocinar al vapor.",
        price: 800,
        nutritionalInfo: { protein: 18, fat: 2, calories: 89, omega3: 0.3 },
        stock: 200,
        unit: "kg",
        minOrder: 0.5,
        maxOrder: 10,
        freshness: 4,
        rating: 4.5,
        images: ["/fresh-hake-fish.jpg"],
        tags: ["merluza", "fresco", "mar", "económico"],
    },
    {
        name: "Langostinos Patagónicos",
        category: "Mariscos",
        origin: "Patagonia Argentina",
        description: "Langostinos frescos de la Patagonia, tamaño grande. Ideales para paellas o a la plancha.",
        price: 2500,
        nutritionalInfo: { protein: 24, fat: 1, calories: 99, omega3: 0.5 },
        stock: 50,
        unit: "kg",
        minOrder: 0.25,
        maxOrder: 2,
        freshness: 5,
        rating: 4.9,
        images: ["/fresh-prawns-shrimp.jpg"],
        tags: ["langostinos", "mariscos", "patagonia", "gourmet"],
    },
    {
        name: "Corvina Rubia Entera",
        category: "Pescado de Mar",
        origin: "Río de la Plata",
        description: "Corvina rubia entera, fresca. Excelente para cocinar al horno con verduras.",
        price: 950,
        nutritionalInfo: { protein: 19, fat: 3, calories: 105, omega3: 0.4 },
        stock: 80,
        unit: "unidad",
        minOrder: 1,
        maxOrder: 3,
        freshness: 4,
        rating: 4.6,
        images: ["/fresh-corvina-fish.jpg"],
        tags: ["corvina", "fresco", "mar", "entero"],
    },
    {
        name: "Mejillones Patagónicos",
        category: "Mariscos",
        origin: "Patagonia Argentina",
        description: "Mejillones frescos en su valva, listos para cocinar al vapor o en salsa.",
        price: 1200,
        nutritionalInfo: { protein: 12, fat: 2, calories: 86, omega3: 0.2 },
        stock: 70,
        unit: "kg",
        minOrder: 0.5,
        maxOrder: 3,
        freshness: 5,
        rating: 4.7,
        images: ["/fresh-mussels-patagonian.jpg"],
        tags: ["mejillones", "mariscos", "patagonia"],
    },
    {
        name: "Trucha Arcoíris",
        category: "Pescado de Río",
        origin: "Patagonia Argentina",
        description: "Trucha fresca de criadero, ideal para la parrilla o al papillote.",
        price: 1100,
        nutritionalInfo: { protein: 19, fat: 5, calories: 130, omega3: 1.0 },
        stock: 60,
        unit: "unidad",
        minOrder: 1,
        maxOrder: 4,
        freshness: 4,
        rating: 4.7,
        images: ["/premium-salmon-and-trout-fillets--gourmet-presenta.jpg"],
        tags: ["trucha", "río", "fresco"],
    },
    {
        name: "Pez Gallo",
        category: "Pescado de Mar",
        origin: "Atlántico Sur",
        description: "Filetes de pez gallo, carne blanca y firme. Excelente para frituras o guisos.",
        price: 750,
        nutritionalInfo: { protein: 17, fat: 1, calories: 80, omega3: 0.2 },
        stock: 120,
        unit: "kg",
        minOrder: 0.5,
        maxOrder: 8,
        freshness: 3,
        rating: 4.2,
        images: ["/fresh-sea-fish-on-ice-display--professional-photog.jpg"],
        tags: ["pez gallo", "mar", "fresco"],
    },
    {
        name: "Atún Rojo Fresco",
        category: "Pescado de Mar",
        origin: "Atlántico",
        description: "Lomo de atún rojo fresco, calidad sashimi. Perfecto para sellar a la plancha.",
        price: 3000,
        nutritionalInfo: { protein: 23, fat: 10, calories: 230, omega3: 1.8 },
        stock: 30,
        unit: "kg",
        minOrder: 0.25,
        maxOrder: 1,
        freshness: 5,
        rating: 4.9,
        images: ["/fresh-tuna-steak.jpg"],
        tags: ["atún", "rojo", "sashimi", "premium"],
    },
    {
        name: "Calamar Patagónico",
        category: "Mariscos",
        origin: "Patagonia Argentina",
        description: "Tubos de calamar fresco, limpios y listos para rellenar o freír.",
        price: 1800,
        nutritionalInfo: { protein: 18, fat: 1, calories: 92, omega3: 0.3 },
        stock: 40,
        unit: "kg",
        minOrder: 0.5,
        maxOrder: 3,
        freshness: 4,
        rating: 4.6,
        images: ["/placeholder.jpg"], // Placeholder image
        tags: ["calamar", "mariscos", "patagonia"],
    },
    {
        name: "Dorada de Mar",
        category: "Pescado de Mar",
        origin: "Atlántico Sur",
        description: "Dorada fresca entera, ideal para cocinar a la sal o al horno.",
        price: 1300,
        nutritionalInfo: { protein: 18, fat: 4, calories: 115, omega3: 0.6 },
        stock: 75,
        unit: "unidad",
        minOrder: 1,
        maxOrder: 2,
        freshness: 4,
        rating: 4.7,
        images: ["/placeholder.jpg"], // Placeholder image
        tags: ["dorada", "mar", "fresco"],
    },
    {
        name: "Surubí de Río",
        category: "Pescado de Río",
        origin: "Río Paraná",
        description: "Postas de surubí, carne firme y sabrosa. Excelente para la parrilla.",
        price: 1600,
        nutritionalInfo: { protein: 21, fat: 8, calories: 180, omega3: 1.2 },
        stock: 45,
        unit: "kg",
        minOrder: 0.5,
        maxOrder: 3,
        freshness: 4,
        rating: 4.8,
        images: ["/fresh-river-fish-display--market-photography.jpg"],
        tags: ["surubí", "río", "premium"],
    },
    {
        name: "Pulpitos Patagónicos",
        category: "Mariscos",
        origin: "Patagonia Argentina",
        description: "Pulpitos tiernos, ideales para ensaladas o a la gallega.",
        price: 2200,
        nutritionalInfo: { protein: 16, fat: 1, calories: 82, omega3: 0.2 },
        stock: 35,
        unit: "kg",
        minOrder: 0.25,
        maxOrder: 1.5,
        freshness: 5,
        rating: 4.7,
        images: ["/placeholder.jpg"], // Placeholder image
        tags: ["pulpo", "mariscos", "patagonia"],
    },
    {
        name: "Bacalao Desalado",
        category: "Pescado de Mar",
        origin: "Atlántico Norte",
        description: "Bacalao desalado, listo para cocinar. Perfecto para guisos o a la vizcaína.",
        price: 1900,
        nutritionalInfo: { protein: 17, fat: 0.5, calories: 78, omega3: 0.1 },
        stock: 90,
        unit: "kg",
        minOrder: 0.5,
        maxOrder: 4,
        freshness: 3,
        rating: 4.5,
        images: ["/placeholder.jpg"], // Placeholder image
        tags: ["bacalao", "salado", "mar"],
    },
    {
        name: "Sardinas Frescas",
        category: "Pescado de Mar",
        origin: "Atlántico Sur",
        description: "Sardinas frescas, ideales para la parrilla o fritas.",
        price: 600,
        nutritionalInfo: { protein: 25, fat: 11, calories: 208, omega3: 2.0 },
        stock: 150,
        unit: "kg",
        minOrder: 0.5,
        maxOrder: 5,
        freshness: 4,
        rating: 4.3,
        images: ["/placeholder.jpg"], // Placeholder image
        tags: ["sardinas", "fresco", "mar"],
    },
    {
        name: "Pescadilla",
        category: "Pescado de Mar",
        origin: "Atlántico Sur",
        description: "Pescadilla fresca, ideal para los más chicos por su carne suave.",
        price: 700,
        nutritionalInfo: { protein: 16, fat: 1, calories: 75, omega3: 0.2 },
        stock: 180,
        unit: "kg",
        minOrder: 0.5,
        maxOrder: 7,
        freshness: 3,
        rating: 4.1,
        images: ["/placeholder.jpg"], // Placeholder image
        tags: ["pescadilla", "fresco", "mar"],
    },
];
function migrateData() {
    return __awaiter(this, void 0, void 0, function () {
        var _i, categoriesToMigrate_1, categoryData, error_1, _a, productsToMigrate_1, productData, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log("Starting data migration...");
                    // Migrate Categories
                    console.log("Migrating categories...");
                    _i = 0, categoriesToMigrate_1 = categoriesToMigrate;
                    _b.label = 1;
                case 1:
                    if (!(_i < categoriesToMigrate_1.length)) return [3 /*break*/, 6];
                    categoryData = categoriesToMigrate_1[_i];
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, (0, firestore_1.addDoc)((0, firestore_1.collection)(db, "categories"), categoryData)];
                case 3:
                    _b.sent();
                    console.log("Added category: ".concat(categoryData.name));
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _b.sent();
                    console.error("Error adding category ".concat(categoryData.name, ":"), error_1);
                    return [3 /*break*/, 5];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6:
                    console.log("Category migration finished.");
                    // Migrate Products
                    console.log("Migrating products...");
                    _a = 0, productsToMigrate_1 = productsToMigrate;
                    _b.label = 7;
                case 7:
                    if (!(_a < productsToMigrate_1.length)) return [3 /*break*/, 12];
                    productData = productsToMigrate_1[_a];
                    _b.label = 8;
                case 8:
                    _b.trys.push([8, 10, , 11]);
                    return [4 /*yield*/, (0, firestore_1.addDoc)((0, firestore_1.collection)(db, "products"), __assign(__assign({}, productData), { createdAt: (0, firestore_1.serverTimestamp)(), updatedAt: (0, firestore_1.serverTimestamp)() }))];
                case 9:
                    _b.sent();
                    console.log("Added product: ".concat(productData.name));
                    return [3 /*break*/, 11];
                case 10:
                    error_2 = _b.sent();
                    console.error("Error adding product ".concat(productData.name, ":"), error_2);
                    return [3 /*break*/, 11];
                case 11:
                    _a++;
                    return [3 /*break*/, 7];
                case 12:
                    console.log("Product migration finished.");
                    return [2 /*return*/];
            }
        });
    });
}
migrateData()
    .then(function () {
    console.log("Migration script completed successfully.");
    process.exit(0);
})
    .catch(function (error) {
    console.error("Migration script failed:", error);
    process.exit(1);
});
