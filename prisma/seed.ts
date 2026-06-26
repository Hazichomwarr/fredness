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
    name: "African Best Palm Oil Regular 2L",
    slug: "african-best-palm-oil-regular-2l",
    sku: "ABPR-2L",
    brand: "African Best",
    weight: "2 L",
    description: "Pure red palm oil for authentic African cooking.",
    retailPrice: "13.99",
    wholesalePrice: "11.99",
    imageUrls: [],
  },

  {
    name: "African Best Palm Oil Zomi 2L",
    slug: "african-best-palm-oil-zomi-2l",
    sku: "ABPZ-2L",
    brand: "African Best",
    weight: "2 L",
    description: "Premium Zomi palm oil with rich flavor and aroma.",
    retailPrice: "14.99",
    wholesalePrice: "12.99",
    imageUrls: [],
  },

  {
    name: "African Best Palm Oil 5kg",
    slug: "african-best-palm-oil-5kg",
    sku: "ABP-5KG",
    brand: "African Best",
    weight: "5 kg",
    description: "Bulk family-size palm oil for everyday cooking.",
    retailPrice: "32.99",
    wholesalePrice: "28.99",
    imageUrls: [],
  },

  {
    name: "Carotino Cooking Oil 1.1L",
    slug: "carotino-cooking-oil-1-1l",
    sku: "CAR-1100",
    brand: "Carotino",
    weight: "1.1 L",
    description: "Vitamin E enriched cooking oil for daily meals.",
    retailPrice: "8.99",
    wholesalePrice: "7.49",
    imageUrls: [],
  },

  {
    name: "Kirkland Vegetable Oil",
    slug: "kirkland-vegetable-oil",
    sku: "KS-VO-284",
    brand: "Kirkland Signature",
    weight: "2.84 L",
    description: "Versatile vegetable oil for frying and baking.",
    retailPrice: "11.99",
    wholesalePrice: "9.99",
    imageUrls: [],
  },

  {
    name: "Kirkland Canola Oil",
    slug: "kirkland-canola-oil",
    sku: "KS-CO-284",
    brand: "Kirkland Signature",
    weight: "2.84 L",
    description: "Light canola oil perfect for everyday cooking.",
    retailPrice: "11.99",
    wholesalePrice: "9.99",
    imageUrls: [],
  },

  {
    name: "Kirkland Olive Oil",
    slug: "kirkland-olive-oil",
    sku: "KS-OO-3L",
    brand: "Kirkland Signature",
    weight: "3 L",
    description: "Smooth olive oil blend for cooking and roasting.",
    retailPrice: "22.99",
    wholesalePrice: "19.99",
    imageUrls: [],
  },

  {
    name: "Filippo Berio Extra Virgin Olive Oil",
    slug: "filippo-berio-extra-virgin-olive-oil",
    sku: "FB-EVOO",
    brand: "Filippo Berio",
    weight: "250 ml",
    description: "Premium extra virgin olive oil with rich flavor.",
    retailPrice: "5.99",
    wholesalePrice: "4.79",
    imageUrls: [],
  },

  {
    name: "Mazola Corn Plus Oil",
    slug: "mazola-corn-plus-oil",
    sku: "MAZ-CP",
    brand: "Mazola",
    weight: "2.84 L",
    description: "Corn and canola oil blend for healthy cooking.",
    retailPrice: "12.99",
    wholesalePrice: "10.99",
    imageUrls: [],
  },

  {
    name: "Red & White Vegetable Oil",
    slug: "red-white-vegetable-oil",
    sku: "RW-VO",
    brand: "Red & White",
    weight: "2.84 L",
    description: "All-purpose vegetable oil for everyday recipes.",
    retailPrice: "9.99",
    wholesalePrice: "8.49",
    imageUrls: [],
  },

  {
    name: "CocoDrop Organic Coconut Oil",
    slug: "cocodrop-organic-coconut-oil",
    sku: "CD-CO",
    brand: "CocoDrop",
    weight: "500 ml",
    description: "Organic refined coconut oil for cooking and baking.",
    retailPrice: "10.99",
    wholesalePrice: "8.99",
    imageUrls: [],
  },

  {
    name: "Walkerswood Traditional Jamaican Jerk Seasoning",
    slug: "walkerswood-jerk-seasoning",
    sku: "WW-JERK",
    brand: "Walkerswood",
    weight: "280 g",
    description: "Authentic Jamaican jerk seasoning with bold spice.",
    retailPrice: "6.99",
    wholesalePrice: "5.49",
    imageUrls: [],
  },

  {
    name: "African Best Shito",
    slug: "african-best-shito",
    sku: "ABS-500",
    brand: "African Best",
    weight: "500 g",
    description: "Traditional Ghanaian spicy black pepper sauce.",
    retailPrice: "11.99",
    wholesalePrice: "9.99",
    imageUrls: [],
  },

  {
    name: "Julie's Special Shito",
    slug: "julies-special-shito",
    sku: "JS-SHITO",
    brand: "Julie's Special",
    weight: "500 g",
    description: "Homestyle shrimp pepper sauce with bold flavor.",
    retailPrice: "12.99",
    wholesalePrice: "10.99",
    imageUrls: [],
  },

  {
    name: "Ghana Fresh Palm Nut Cream Concentrate",
    slug: "ghana-fresh-palm-nut-cream",
    sku: "GF-PNC",
    brand: "Ghana Fresh",
    weight: "800 g",
    description: "Rich palm nut concentrate for soups and stews.",
    retailPrice: "6.99",
    wholesalePrice: "5.49",
    imageUrls: [],
  },

  {
    name: "Praise Abemu Dro Palm Cream",
    slug: "praise-abemu-dro-palm-cream",
    sku: "PAD-PC",
    brand: "Praise",
    weight: "800 g",
    description: "Palm cream with herbs for traditional African dishes.",
    retailPrice: "6.99",
    wholesalePrice: "5.49",
    imageUrls: [],
  },

  {
    name: "Nkulenu Palm Soup Base",
    slug: "nkulenu-palm-soup-base",
    sku: "NK-PSB",
    brand: "Nkulenu",
    weight: "780 g",
    description: "Ready-to-use palm soup base with authentic flavor.",
    retailPrice: "7.99",
    wholesalePrice: "6.49",
    imageUrls: [],
  },

  {
    name: "Ghana Fresh Egg Plant",
    slug: "ghana-fresh-egg-plant",
    sku: "GF-EP",
    brand: "Ghana Fresh",
    weight: "800 g",
    description: "Canned African eggplant for soups and sauces.",
    retailPrice: "4.99",
    wholesalePrice: "3.99",
    imageUrls: [],
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
