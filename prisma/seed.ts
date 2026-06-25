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

// const drinksProducts = [
//   {
//     name: "Vinut 100% Red Grape Juice",
//     slug: "vinut-red-grape-juice-500ml",
//     sku: "DRINK-JUICE-GRAPE-VINUT-500",
//     brand: "Vinut",
//     weight: "500 ml",
//     description:
//       "Pure red grape juice with no sugar added for a naturally rich and refreshing taste.",
//   },

//   {
//     name: "AmericanDrop 100% Watermelon Juice",
//     slug: "americandrop-watermelon-juice-490ml",
//     sku: "DRINK-JUICE-WATERMELON-AMERICANDROP-490",
//     brand: "AmericanDrop",
//     weight: "490 ml",
//     description:
//       "Refreshing watermelon juice with pulp and no sugar added for tropical refreshment.",
//   },

//   {
//     name: "AmericanDrop 100% Orange Juice",
//     slug: "americandrop-orange-juice-490ml",
//     sku: "DRINK-JUICE-ORANGE-AMERICANDROP-490",
//     brand: "AmericanDrop",
//     weight: "490 ml",
//     description:
//       "Smooth orange juice with pulp delivering fresh citrus flavor in every sip.",
//   },

//   {
//     name: "Vinut 100% Apple Juice",
//     slug: "vinut-apple-juice-500ml",
//     sku: "DRINK-JUICE-APPLE-VINUT-500",
//     brand: "Vinut",
//     weight: "500 ml",
//     description:
//       "Naturally sweet apple juice made with no sugar added and never from concentrate.",
//   },

//   {
//     name: "AmericanDrop 100% Lychee Juice",
//     slug: "americandrop-lychee-juice-490ml",
//     sku: "DRINK-JUICE-LYCHEE-AMERICANDROP-490",
//     brand: "AmericanDrop",
//     weight: "490 ml",
//     description:
//       "Delicious lychee juice bursting with exotic fruit flavor and natural sweetness.",
//   },

//   {
//     name: "Ensure Original Vanilla Nutrition Shake",
//     slug: "ensure-original-vanilla-shake-237ml",
//     sku: "DRINK-NUTRITION-ENSURE-VANILLA-237",
//     brand: "Ensure",
//     weight: "237 ml",
//     description:
//       "Protein-rich nutrition shake with vitamins and minerals to help fuel your day.",
//   },

//   {
//     name: "Power Malt Extra Energy",
//     slug: "power-malt-extra-energy-330ml",
//     sku: "DRINK-MALT-POWERMALT-330",
//     brand: "Power Malt",
//     weight: "330 ml",
//     description:
//       "Refreshing non-alcoholic malt drink with bold flavor and extra energy.",
//   },

//   {
//     name: "Vimto Fruit Flavor Drink",
//     slug: "vimto-fruit-flavor-drink-330ml",
//     sku: "DRINK-SODA-VIMTO-330",
//     brand: "Vimto",
//     weight: "330 ml",
//     description:
//       "Classic mixed fruit soft drink loved for its rich, sweet, and fruity taste.",
//   },

//   {
//     name: "Vita Malt Ginger",
//     slug: "vita-malt-ginger-330ml",
//     sku: "DRINK-MALT-VITAMALT-GINGER-330",
//     brand: "Vita Malt",
//     weight: "330 ml",
//     description:
//       "Non-alcoholic malt beverage infused with natural ginger for a bold, refreshing finish.",
//   },
// ];

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

// async function seedDrinksProducts() {
//   await seedProducts("drinks", drinksProducts, "Drinks");
// }

async function main() {
  await seedAdmin();
  await seedCategories();
  await seedFufuProducts();
  // await seedDrinksProducts();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
