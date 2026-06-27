// prisma/seed.ts
import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "../src/lib/auth/password";

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME?.trim() || "Frednes Owner";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to seed the admin user.");
}

if (!email) {
  throw new Error("ADMIN_EMAIL is required to seed the admin user.");
}

if (!password || password.length < 12) {
  throw new Error("ADMIN_PASSWORD must be at least 12 characters.");
}

const adminEmail = email;
const adminPassword = password;
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const categories = [
  {
    name: "Proteins",
    slug: "proteins",
    imageUrl: "/categories/proteins.jpg",
    description:
      "Fresh and frozen meats, poultry, and protein essentials for African and Caribbean cooking.",
    sortOrder: 1,
  },
  {
    name: "Fish & Seafood",
    slug: "fish-seafood",
    imageUrl: "/categories/fish.jpg",
    description: "Smoked fish, dried fish, frozen fish, and seafood products.",
    sortOrder: 2,
  },
  {
    name: "Grains & Rice",
    slug: "grains-rice",
    imageUrl: "/categories/grains-rice.jpg",
    description: "Rice, beans, grains, and pantry staples for everyday meals.",
    sortOrder: 3,
  },
  {
    name: "Fufu",
    slug: "fufu",
    imageUrl: "/images/categories/fredness-fufu.jpg",
    description:
      "Fufu flours, instant fufu mixes, and swallow products for traditional African meals.",
    sortOrder: 4,
  },
  {
    name: "Vegetables",
    slug: "vegetables",
    imageUrl: "/categories/vegetables.jpg",
    description:
      "Fresh vegetables and produce used in authentic African and Caribbean recipes.",
    sortOrder: 5,
  },
  {
    name: "Spices",
    slug: "spices",
    imageUrl: "/categories/spices.jpg",
    description:
      "Traditional African and Caribbean seasonings, spices, and flavor enhancers.",
    sortOrder: 6,
  },
  {
    name: "Snacks",
    slug: "snacks",
    imageUrl: "/categories/snacks.jpg",
    description:
      "Cookies, crackers, sweets, and popular imported snack favorites.",
    sortOrder: 7,
  },
  {
    name: "Drinks",
    slug: "drinks",
    imageUrl: "/categories/drinks.jpg",
    description:
      "Soft drinks, malt beverages, juices, and refreshments from Africa and the Caribbean.",
    sortOrder: 8,
  },
  {
    name: "Cooking Oils, Creams & Sauces",
    slug: "cooking-oils-creams-sauces",
    imageUrl: "/images/african-best-fallback.png",
    description:
      "Cooking oils, palm creams, shito, soup bases, and flavorful sauces for African and Caribbean meals.",
    sortOrder: 9,
  },
];

const fufuProducts = [
  {
    name: "Iyan Ado Pounded Yam",
    slug: "iyan-ado-pounded-yam-10lb",
    sku: "FUFU-001",
    brand: "Iyan Ado",
    weight: "10 lb",
    description:
      "Pounded yam flour for preparing a smooth, stretchy swallow served with soups and stews.",
    retailPrice: "10.00",
    wholesalePrice: "8.00",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXRTLlgXAUXB0Qm2LsIibVYAJxv6Et8kd3aUqn",
    ],
  },
  {
    name: "Honeywell Semolina",
    slug: "honeywell-semolina-1kg",
    sku: "FUFU-002",
    brand: "Honeywell",
    weight: "1 kg",
    description:
      "Fine semolina flour for making a firm, smooth swallow to pair with African soups.",
    retailPrice: "10.00",
    wholesalePrice: "8.00",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXMOZUUxCLMT5qyt9IA2aO3mxFvdXuncP7HriS",
    ],
  },
  {
    name: "Golden Penny Semovita",
    slug: "golden-penny-semovita",
    sku: "FUFU-003",
    brand: "Golden Penny",
    weight: null,
    description:
      "Premium quality semolina swallow mix fortified with vitamin A for everyday meals.",
    retailPrice: "10.00",
    wholesalePrice: "8.00",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXHYttR1EXneMU0Gh4lFug5jsq1YarJLdSkKxb",
    ],
  },
  {
    name: "Siya Rice Flour",
    slug: "siya-rice-flour-4lb",
    sku: "FUFU-004",
    brand: "Siya",
    weight: "4 lb",
    description:
      "Rice flour for swallow, baking, and thickening soups, sauces, and traditional recipes.",
    retailPrice: "10.00",
    wholesalePrice: "8.00",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXRMyecgUXB0Qm2LsIibVYAJxv6Et8kd3aUqn1",
    ],
  },
  {
    name: "Glorious Poundo Instant Yam Poundo",
    slug: "glorious-poundo-instant-yam-poundo-2lb",
    sku: "FUFU-005",
    brand: "Glorious Poundo",
    weight: "2 lb",
    description:
      "Instant yam poundo flour for quick pounded yam-style swallow with favorite soups.",
    retailPrice: "10.00",
    wholesalePrice: "8.00",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXVXM30LSMuDmdnHeOcjLKfVkwIGr1YN2hlsSZ",
    ],
  },
  {
    name: "African Best Starch Powder",
    slug: "african-best-starch-powder-edible-1lb",
    sku: "FUFU-006",
    brand: "African Best",
    weight: "1 lb",
    description:
      "Edible cassava starch powder for thickening and preparing traditional starch dishes.",
    retailPrice: "10.00",
    wholesalePrice: "8.00",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXvb7wwLX6CQgPtxMVDopG2H9Wiu8YrbOXL3AJ",
    ],
  },
  {
    name: "African Best Plantain Flour",
    slug: "african-best-plantain-flour-3lb-repack",
    sku: "FUFU-007",
    brand: "African Best",
    weight: "3 lb",
    description:
      "Repacked plantain flour for making plantain swallow and traditional African meals.",
    retailPrice: "12.00",
    wholesalePrice: "10.00",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXjWD6hvFUYqgMeuyhvxCk8rOpNnTw70jzoHbP",
    ],
  },
  {
    name: "African Best Yam Flour",
    slug: "african-best-yam-flour-8lb",
    sku: "FUFU-008",
    brand: "African Best",
    weight: "8 lb",
    description:
      "Natural yam flour for preparing amala-style swallow and other yam flour dishes.",
    retailPrice: "10.00",
    wholesalePrice: "8.00",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXHh8803EXneMU0Gh4lFug5jsq1YarJLdSkKxb",
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNX3G2BhNMGp74HzRqQDLkTwCX0EUNeduW2c5tl",
    ],
  },
  {
    name: "African Best Plantain Flour",
    slug: "african-best-plantain-flour-4lb",
    sku: "FUFU-009",
    brand: "African Best",
    weight: "4 lb",
    description:
      "Natural plantain flour for making plantain swallow served with soups and stews.",
    retailPrice: "10.00",
    wholesalePrice: "8.00",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXFVFkTmaMcAOF9rZhD3yjVXvk21HY6iBUNEwm",
    ],
  },
  {
    name: "Tropiway Instant Plantain Fufu",
    slug: "tropiway-instant-plantain-fufu-10lb",
    sku: "FUFU-010",
    brand: "Tropiway",
    weight: "10 lb",
    description:
      "Instant plantain fufu mix with low sodium and no added MSG for easy swallow preparation.",
    retailPrice: "10.00",
    wholesalePrice: "8.00",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXtX87gRphYx5l2n4dkqFK1Ois7TyRZe69ubVI",
    ],
  },
  {
    name: "African Best Wheat Flour",
    slug: "african-best-wheat-flour-1lb-repack",
    sku: "FUFU-011",
    brand: "African Best",
    weight: "1 lb",
    description:
      "Repacked wheat flour for baking, thickening, and everyday pantry cooking.",
    retailPrice: "7.00",
    wholesalePrice: "6.00",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXx8xFftljMJUv6gokLH2K3401lyX9VBtcseFD",
    ],
  },
  {
    name: "Ola-Ola Pounded Yam",
    slug: "ola-ola-pounded-yam-5lb",
    sku: "FUFU-012",
    brand: "Ola-Ola",
    weight: "5 lb",
    description:
      "Instant pounded yam flour for a smooth iyan swallow with traditional soups.",
    retailPrice: "10.00",
    wholesalePrice: "8.00",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXbcEsIeWo5Op4CRV8ijmIyH2xoatJUT0sgzuX",
    ],
  },
  {
    name: "Ulibola Powder Blend",
    slug: "ulibola-powder-blend-1lb",
    sku: "FUFU-013",
    brand: "Ulibola",
    weight: "1 lb",
    description:
      "Seasoned powder blend with popcorn, spices, and herbs for traditional pantry cooking.",
    retailPrice: "16.00",
    wholesalePrice: "14.00",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNX6uPifiTIdoa8APqmKptfzCilvc2yUEW9k3bD",
    ],
  },
  {
    name: "Golden Tropics Plantain Fufu",
    slug: "golden-tropics-plantain-fufu-bulk",
    sku: "FUFU-014",
    brand: "Golden Tropics",
    weight: null,
    description:
      "Bulk plantain fufu flour for preparing smooth plantain swallow in larger quantities.",
    retailPrice: "34.99",
    wholesalePrice: "30.00",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXT1DGargxANvhWd6lkPZwVCGOImSK9YaDEXfg",
    ],
  },
  {
    name: "African Best Yellow Corn Flour",
    slug: "african-best-yellow-corn-flour-1lb-repack",
    sku: "FUFU-015",
    brand: "African Best",
    weight: "1 lb",
    description:
      "Repacked yellow corn flour for porridge, cornmeal dishes, and traditional cooking.",
    retailPrice: "6.00",
    wholesalePrice: "5.00",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXRTrLtPfUXB0Qm2LsIibVYAJxv6Et8kd3aUqn",
    ],
  },
  {
    name: "African Best Djuka",
    slug: "african-best-djuka-1lb",
    sku: "FUFU-016",
    brand: "African Best",
    weight: "1 lb",
    description:
      "Ground djuka grain mix for traditional African meals and pantry cooking.",
    retailPrice: "7.00",
    wholesalePrice: "6.00",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXsGUyrc8BPgeWNAZFXca6QzOIrykMCwxfuYho",
    ],
  },
  {
    name: "African Best Ijebu Gari",
    slug: "african-best-ijebu-gari-1lb",
    sku: "FUFU-017",
    brand: "African Best",
    weight: "1 lb",
    description:
      "Ijebu gari made from cassava for soaking, eba, and everyday traditional meals.",
    retailPrice: "5.00",
    wholesalePrice: "4.00",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXhLobzZFr6Ctc9jW27oTNiaOIdxk08KQeDGJy",
    ],
  },
  {
    name: "African Best Yellow Gari",
    slug: "african-best-yellow-gari-1lb",
    sku: "FUFU-018",
    brand: "African Best",
    weight: "1 lb",
    description:
      "Yellow gari made from cassava for eba, soaking, and classic West African meals.",
    retailPrice: "7.00",
    wholesalePrice: "6.00",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNX6w8hB5TIdoa8APqmKptfzCilvc2yUEW9k3bD",
    ],
  },
  {
    name: "African Best Oat Flour",
    slug: "african-best-oat-flour-1lb",
    sku: "FUFU-019",
    brand: "African Best",
    weight: "1 lb",
    description:
      "Repacked oat flour for baking, porridge, thickening, and everyday pantry recipes.",
    retailPrice: "7.00",
    wholesalePrice: "6.00",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXcEvcbX0qxTLkfJbVaDEF6wd8mCrq39RzhUic",
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXlCCqOa1DeTIj320y6NViZlHOGkKqd4FoxEL7",
    ],
  },
  {
    name: "African Best Okpa Flour",
    slug: "african-best-okpa-flour",
    sku: "FUFU-020",
    brand: "African Best",
    weight: null,
    description:
      "Okpa flour made from Bambara nut for preparing the classic Nigerian steamed okpa dish.",
    retailPrice: "12.76",
    wholesalePrice: "10.00",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXnXyO3Zw1ufzt2jEMbVTAiKYeSx75Rnw43Xh6",
    ],
  },
  {
    name: "African Best Semolina",
    slug: "african-best-semolina-1lb",
    sku: "FUFU-021",
    brand: "African Best",
    weight: "1 lb",
    description:
      "Repacked semolina flour for making a smooth, firm swallow with soups and stews.",
    retailPrice: "6.00",
    wholesalePrice: "5.00",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXMytLoohCLMT5qyt9IA2aO3mxFvdXuncP7Hri",
    ],
  },
  {
    name: "African Best Farinha",
    slug: "african-best-farinha-3lb",
    sku: "FUFU-022",
    brand: "African Best",
    weight: "3 lb",
    description:
      "Coarse cassava farinha for soaking, sprinkling, and traditional West African cooking.",
    retailPrice: "5.00",
    wholesalePrice: "4.00",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXMrXxWYCLMT5qyt9IA2aO3mxFvdXuncP7HriS",
    ],
  },
  {
    name: "African Best Yam Flour",
    slug: "african-best-yam-flour-4lb-repack",
    sku: "FUFU-023",
    brand: "African Best",
    weight: "4 lb",
    description:
      "Repacked yam flour for preparing amala-style swallow and other yam flour dishes.",
    retailPrice: "10.00",
    wholesalePrice: "8.00",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNX3IyD4SMGp74HzRqQDLkTwCX0EUNeduW2c5tl",
    ],
  },
  {
    name: "African Best Cassava Fufu",
    slug: "african-best-cassava-fufu-1lb",
    sku: "FUFU-024",
    brand: "African Best",
    weight: "1 lb",
    description:
      "Cassava fufu flour for preparing a soft, traditional swallow with favorite soups.",
    retailPrice: "10.00",
    wholesalePrice: "8.00",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXM6SAO2CLMT5qyt9IA2aO3mxFvdXuncP7HriS",
    ],
  },
];

const oilsProducts = [
  {
    name: "African Best Palm Oil Regular 1 Litre",
    slug: "african-best-palm-oil-regular-1-litre",
    sku: "AFBEST-PALMOIL-REG-1L",
    brand: "African Best",
    weight: "1 L",
    description:
      "Regular red palm oil made from fresh palm pulp for stews, frying, beans, egusi, and okra.",
    retailPrice: "10.00",
    wholesalePrice: "8.00",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXCR1BaPJGDNTIJPmq7LiCuRpwSEMecbKWQ58O",
    ],
  },

  {
    name: "African Best Palm Oil Zomi",
    slug: "african-best-palm-oil-zomi-2l",
    sku: "AFBEST-PALMOIL-ZOMI",
    brand: "African Best",
    weight: null,
    description:
      "Zomi-style red palm oil with a deeper aroma for soups, stews, and traditional dishes.",
    retailPrice: "10.00",
    wholesalePrice: "8.00",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXb5hltno5Op4CRV8ijmIyH2xoatJUT0sgzuX3",
    ],
  },

  {
    name: "CDC Premium Menau Palm Oil 1 Litre",
    slug: "cdc-premium-menau-palm-oil-1-litre",
    sku: "CDC-PALMOIL-1L",
    brand: "CDC",
    weight: "1 L",
    description:
      "Premium Menau red palm oil from Cameroon for traditional soups, stews, and sauces.",
    retailPrice: "10.00",
    wholesalePrice: "8.00",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXBf0bd0NVUFoSHVOz6iry4PwWQ5KdDR1BxGqn",
    ],
  },

  {
    name: "African Best Palm Oil Premium Quality",
    slug: "african-best-palm-oil-premium-quality",
    sku: "AFBEST-PALMOIL-PREMIUM",
    brand: "African Best",
    weight: null,
    description:
      "Premium quality African Best palm oil for family-size cooking, stews, soups, and frying.",
    retailPrice: "10.00",
    wholesalePrice: "8.00",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXHGcwueEXneMU0Gh4lFug5jsq1YarJLdSkKxb",
    ],
  },

  {
    name: "African Best Palm Oil Regular 2 Litres",
    slug: "african-best-palm-oil-regular-2l",
    sku: "AFBEST-PALMOIL-REG-2L",
    brand: "African Best",
    weight: "2 L",
    description:
      "Two-litre regular red palm oil for authentic African soups, stews, and frying.",
    retailPrice: "10.00",
    wholesalePrice: "8.00",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXyEgrEXGlH8fEcPQBWqpLDUbioN4JgzFMsYRS",
    ],
  },

  {
    name: "Ola-Ola Carotino Cooking Oil 3.3 L",
    slug: "ola-ola-carotino-cooking-oil-3-3l",
    sku: "CAROTINO-3-3L",
    brand: "Ola-Ola Carotino",
    weight: "3.3 L",
    description:
      "Cholesterol-free cooking oil with natural carotenes and vitamin E for everyday meals.",
    retailPrice: "10.00",
    wholesalePrice: "8.00",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXqtKkXiHqd2MjsJFtYK70QIOpun8f64gceyki",
    ],
  },

  {
    name: "Ola-Ola Carotino Cooking Oil 550 ml",
    slug: "ola-ola-carotino-cooking-oil-550ml",
    sku: "CAROTINO-550",
    brand: "Ola-Ola Carotino",
    weight: "550 ml",
    description:
      "Small bottle of cholesterol-free Carotino cooking oil enriched with natural carotenes.",
    retailPrice: "10.00",
    wholesalePrice: "8.00",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXt28k3FphYx5l2n4dkqFK1Ois7TyRZe69ubVI",
    ],
  },

  {
    name: "African Best Palm Oil",
    slug: "african-best-palm-oil-bottle",
    sku: "AFBEST-PALMOIL-BTL",
    brand: "African Best",
    weight: null,
    description:
      "Bottled red palm oil for everyday African soups, stews, beans, and frying.",
    retailPrice: "6.00",
    wholesalePrice: "5.00",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXgidW5Hnob5x69mSJEQUfGjOz3TDPZqheIC7Y",
    ],
  },

  {
    name: "Ola-Ola Carotino Cooking Oil 1.1 L",
    slug: "carotino-cooking-oil-1-1l",
    sku: "CAROTINO-1-1L",
    brand: "Ola-Ola Carotino",
    weight: "1.1 L",
    description:
      "Carotino cooking oil with vitamin E and natural carotenes for soups, stews, and frying.",
    retailPrice: "10.00",
    wholesalePrice: "8.00",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXY1arIyhwZPWs3SFLqN69dXt4ankvTHEyKQD1",
    ],
  },

  {
    name: "Ola-Ola Carotino Cooking Oil 5.5 L",
    slug: "ola-ola-carotino-cooking-oil-5-5l",
    sku: "CAROTINO-5-5L",
    brand: "Ola-Ola Carotino",
    weight: "5.5 L",
    description:
      "Large jug of cholesterol-free Carotino cooking oil for home and food-service use.",
    retailPrice: "10.00",
    wholesalePrice: "8.00",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNX26dwAKWKNpRGQMoemS15q0TasbWAOw8DtVUY",
    ],
  },

  {
    name: "African Best Concentrated Abemuduro Sauce Graine",
    slug: "african-best-concentrated-abemuduro-sauce-graine",
    sku: "AFBEST-ABEMUDURO",
    brand: "African Best",
    weight: null,
    description:
      "Concentrated palm nut sauce base for preparing sauce graine, soups, and stews.",
    retailPrice: "10.00",
    wholesalePrice: "8.00",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNX3TGGu2MGp74HzRqQDLkTwCX0EUNeduW2c5tl",
    ],
  },

  {
    name: "De Rica Double Concentrated Tomato Paste Large Can",
    slug: "de-rica-double-concentrated-tomato-paste-large-can",
    sku: "DERICA-TOMATO-PASTE-LG",
    brand: "De Rica",
    weight: null,
    description:
      "Double concentrated tomato paste for rich stews, sauces, jollof rice, and soups.",
    retailPrice: "10.00",
    wholesalePrice: "8.00",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXBcotqNVUFoSHVOz6iry4PwWQ5KdDR1BxGqnt",
    ],
  },

  {
    name: "De Rica Double Concentrated Tomato Paste 400 g",
    slug: "de-rica-double-concentrated-tomato-paste-400g",
    sku: "DERICA-TOMATO-PASTE-400",
    brand: "De Rica",
    weight: "400 g",
    description:
      "Four-hundred gram can of double concentrated tomato paste for everyday cooking.",
    retailPrice: "10.00",
    wholesalePrice: "8.00",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNX63oVr2TIdoa8APqmKptfzCilvc2yUEW9k3bD",
    ],
  },

  {
    name: "De Rica Double Concentrated Tomato Paste Small Can",
    slug: "de-rica-double-concentrated-tomato-paste-small-can",
    sku: "DERICA-TOMATO-PASTE-SM",
    brand: "De Rica",
    weight: null,
    description:
      "Small can of double concentrated tomato paste for soups, sauces, and quick stews.",
    retailPrice: "10.00",
    wholesalePrice: "8.00",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXJ3K6GfyUIcDxWynlGbSNmh0zBPkXAHapLZfj",
    ],
  },

  {
    name: "Liberian Fresh Palm Cream Concentrate 780 g",
    slug: "liberian-fresh-palm-cream-concentrate-780g",
    sku: "LIBFRESH-PALM-CREAM-780",
    brand: "Liberian Fresh",
    weight: "780 g",
    description:
      "Palm cream concentrate, also called sauce graine or moambe, for soups and stews.",
    retailPrice: "10.00",
    wholesalePrice: "8.00",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXDr0qlqmVz6Whf5jJxIZB9EvncekuFaSwCgGm",
    ],
  },

  {
    name: "Praise Palm Cream Sauce Graine",
    slug: "praise-abemu-dro-palm-cream",
    sku: "PRAISE-PALM-CREAM",
    brand: "Praise",
    weight: null,
    description:
      "Concentrated palm cream sauce graine for preparing hearty West African soups.",
    retailPrice: "10.00",
    wholesalePrice: "8.00",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXQQnt0FLaQmgxRsrwTlNvnbS3Bpfi7yGF50X9",
    ],
  },

  {
    name: "Trofai Spicy Hot Palmnut Concentrate 800 g",
    slug: "trofai-spicy-hot-palmnut-concentrate-800g",
    sku: "TROFAI-SPICY-800",
    brand: "Trofai",
    weight: "800 g",
    description:
      "Spicy palmnut concentrate with hot pepper flavor for moambe, sauce graine, and soups.",
    retailPrice: "10.00",
    wholesalePrice: "8.00",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXVjazPJSMuDmdnHeOcjLKfVkwIGr1YN2hlsSZ",
    ],
  },
];

async function seedAdmin() {
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name,
      passwordHash: hashPassword(adminPassword),
      role: "ADMIN",
    },
    create: {
      name,
      email: adminEmail,
      passwordHash: hashPassword(adminPassword),
      role: "ADMIN",
    },
  });

  console.info(`Seeded ADMIN user: ${adminEmail}`);
}

async function seedCategories() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  console.info(`Seeded ${categories.length} categories`);
}

type SeedProduct = {
  name: string;
  slug: string;
  sku: string;
  brand: string | null;
  weight: string | null;
  description: string;
  retailPrice: string;
  wholesalePrice: string;
  imageUrls: string[];
};

function productData(categorySlug: string, product: SeedProduct) {
  return {
    category: {
      connect: {
        slug: categorySlug,
      },
    },
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    description: product.description,
    brand: product.brand,
    weight: product.weight,
    retailPrice: product.retailPrice,
    wholesalePrice: product.wholesalePrice,
    minimumWholesaleQty: 1,
    inventory: 100,
    trackInventory: true,
    isActive: true,
  };
}

function productImages(product: SeedProduct) {
  return product.imageUrls.map((url, index) => ({
    url,
    altText: product.name,
    sortOrder: index,
  }));
}

async function seedProducts(
  categorySlug: string,
  products: SeedProduct[],
  label: string,
) {
  for (const product of products) {
    const existingProduct = await prisma.product.findFirst({
      where: {
        OR: [{ sku: product.sku }, { slug: product.slug }],
      },
      select: { id: true },
    });

    if (existingProduct) {
      const [productWithSku, productWithSlug] = await Promise.all([
        prisma.product.findUnique({
          where: { sku: product.sku },
          select: { id: true },
        }),
        prisma.product.findUnique({
          where: { slug: product.slug },
          select: { id: true },
        }),
      ]);
      const data: Omit<ReturnType<typeof productData>, "sku" | "slug"> & {
        sku?: string;
        slug?: string;
      } = { ...productData(categorySlug, product) };

      if (productWithSku && productWithSku.id !== existingProduct.id) {
        delete data.sku;
      }

      if (productWithSlug && productWithSlug.id !== existingProduct.id) {
        delete data.slug;
      }

      await prisma.product.update({
        where: { id: existingProduct.id },
        data: {
          ...data,
          images: {
            deleteMany: {},
            create: productImages(product),
          },
        },
      });

      continue;
    }

    await prisma.product.create({
      data: {
        ...productData(categorySlug, product),
        images: {
          create: productImages(product),
        },
      },
    });
  }

  console.info(`Seeded ${products.length} ${label} products`);
}

async function seedFufuProducts() {
  await seedProducts("fufu", fufuProducts, "Fufu");
}

async function seedBulkProducts() {
  await seedProducts(
    "cooking-oils-creams-sauces",
    oilsProducts,
    "Cooking Oils, Sauces & Creams",
  );
}

async function main() {
  await seedAdmin();
  await seedCategories();
  await seedFufuProducts();
  await seedBulkProducts();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
