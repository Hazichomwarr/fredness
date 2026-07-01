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
    name: "Breakfast & Cereals",
    slug: "breakfast-and-cereals",
    imageUrl: "/images/categories/frednes-breakfast.jpg",
    sortOrder: 11,
    description:
      "Morning staples, cereals, oats, and family breakfast favorites for everyday nourishment.",
  },
  {
    name: "Milk & Dairy",
    slug: "milk-and-dairy",
    imageUrl: "/images/categories/frednes-milk-dairy.jpg",
    sortOrder: 12,
    description:
      "Powdered milk, evaporated milk, and creamy dairy essentials for drinks, cooking, and family use.",
  },
  {
    name: "Malted & Chocolate Drinks",
    slug: "malted-and-chocolate-drinks",
    imageUrl: "/images/categories/frednes-malted-choco-drinks.jpg",
    sortOrder: 13,
    description:
      "Rich chocolate and malt drink mixes loved by families for breakfast, energy, and daily refreshment.",
  },
  {
    name: "Coffee & Creamers",
    slug: "coffee-and-creamers",
    imageUrl: "/images/categories/frednes-coffee-creamer.jpg",
    sortOrder: 14,
    description:
      "Instant coffee and smooth creamers for a warm, rich, and satisfying cup any time of day.",
  },
  {
    name: "Snacks & Confectionery",
    slug: "snacks-and-confectionery",
    imageUrl: "/images/categories/fredness-snacks.jpg",
    sortOrder: 15,
    description:
      "Crunchy snacks, sweet treats, and grab-and-go favorites for home, shops, and gatherings.",
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

type SeedProductVariant = {
  name: string;
  sku: string;
  weight: string;
  retailPrice: string;
  wholesalePrice: string;
};

type ProductCategory =
  | "Proteins"
  | "Canned Foods"
  | "Fish & Seafood"
  | "Grains & Rice"
  | "Fufu"
  | "Vegetables"
  | "Spices"
  | "Snacks & Confectionery"
  | "Drinks"
  | "Cooking Oils, Creams & Sauces"
  | "Fruits"
  | "Ustensils & Accessories"
  | "Breakfast & Cereals"
  | "Milk & Dairy"
  | "Malted & Chocolate Drinks"
  | "Coffee & Creamers";

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
  variants?: SeedProductVariant[];
  category?: ProductCategory;
};

// const products: SeedProduct[] = [
//   {
//     name: "Tropical Sun Crunchy Coconut Peanuts",
//     slug: "tropical-sun-crunchy-coconut-peanuts",
//     sku: "TS-COCONUT-PEANUTS",
//     brand: "Tropical Sun",
//     weight: "180g",
//     description: "Crunchy roasted peanuts coated with real coconut cream.",
//     retailPrice: "4.99",
//     wholesalePrice: "3.75",
//     imageUrls: [],
//     category: "Snacks & Confectionery",
//   },

//   {
//     name: "Nestlé Nido Instant Full Cream Milk Powder",
//     slug: "nestle-nido-instant-full-cream-milk-powder",
//     sku: "NIDO-MILK-POWDER",
//     brand: "Nestlé Nido",
//     weight: null,
//     description:
//       "Rich full cream milk powder for tea, cereal, and family meals.",
//     retailPrice: "8.99",
//     wholesalePrice: "7.25",
//     imageUrls: [],
//     category: "Milk & Dairy",
//     variants: [
//       {
//         name: "400g",
//         sku: "NIDO-MILK-400G",
//         weight: "400g",
//         retailPrice: "8.99",
//         wholesalePrice: "7.25",
//       },
//       {
//         name: "1.8kg",
//         sku: "NIDO-MILK-1800G",
//         weight: "1.8kg",
//         retailPrice: "31.99",
//         wholesalePrice: "27.50",
//       },
//       {
//         name: "2.5kg",
//         sku: "NIDO-MILK-2500G",
//         weight: "2.5kg",
//         retailPrice: "43.99",
//         wholesalePrice: "38.00",
//       },
//     ],
//   },

//   {
//     name: "Nestlé Milo Powder",
//     slug: "nestle-milo-powder",
//     sku: "MILO-POWDER",
//     brand: "Nestlé Milo",
//     weight: null,
//     description: "Chocolate malt drink powder with nourishing energy.",
//     retailPrice: "8.49",
//     wholesalePrice: "6.95",
//     imageUrls: [],
//     category: "Malted & Chocolate Drinks",
//     variants: [
//       {
//         name: "400g",
//         sku: "MILO-POWDER-400G",
//         weight: "400g",
//         retailPrice: "8.49",
//         wholesalePrice: "6.95",
//       },
//       {
//         name: "1.3kg",
//         sku: "MILO-POWDER-1300G",
//         weight: "1.3kg",
//         retailPrice: "22.99",
//         wholesalePrice: "19.25",
//       },
//       {
//         name: "1.8kg",
//         sku: "MILO-POWDER-1800G",
//         weight: "1.8kg",
//         retailPrice: "29.99",
//         wholesalePrice: "25.50",
//       },
//     ],
//   },

//   {
//     name: "Nestlé Milo Energy Food Drink",
//     slug: "nestle-milo-energy-food-drink",
//     sku: "MILO-ENERGY-FOOD",
//     brand: "Nestlé Milo",
//     weight: null,
//     description:
//       "Classic Milo energy drink mix for a rich chocolate malt taste.",
//     retailPrice: "6.99",
//     wholesalePrice: "5.50",
//     imageUrls: [],
//     category: "Malted & Chocolate Drinks",
//     variants: [
//       {
//         name: "400g",
//         sku: "MILO-ENERGY-400G",
//         weight: "400g",
//         retailPrice: "6.99",
//         wholesalePrice: "5.50",
//       },
//       {
//         name: "500g",
//         sku: "MILO-ENERGY-500G",
//         weight: "500g",
//         retailPrice: "8.49",
//         wholesalePrice: "6.95",
//       },
//     ],
//   },

//   {
//     name: "Nestlé Milo Energy Cubes",
//     slug: "nestle-milo-energy-cubes",
//     sku: "MILO-ENERGY-CUBES-100CT",
//     brand: "Nestlé Milo",
//     weight: "100 cubes",
//     description: "Individually wrapped chocolate malt cubes for quick energy.",
//     retailPrice: "9.99",
//     wholesalePrice: "7.95",
//     imageUrls: [],
//     category: "Snacks & Confectionery",
//   },

//   {
//     name: "Peak Instant Whole Milk Powder",
//     slug: "peak-instant-whole-milk-powder",
//     sku: "PEAK-MILK-POWDER",
//     brand: "Peak",
//     weight: null,
//     description: "Creamy instant whole milk powder with a rich dairy taste.",
//     retailPrice: "8.49",
//     wholesalePrice: "6.95",
//     imageUrls: [],
//     category: "Milk & Dairy",
//     variants: [
//       {
//         name: "400g",
//         sku: "PEAK-MILK-400G",
//         weight: "400g",
//         retailPrice: "8.49",
//         wholesalePrice: "6.95",
//       },
//       {
//         name: "900g",
//         sku: "PEAK-MILK-900G",
//         weight: "900g",
//         retailPrice: "17.49",
//         wholesalePrice: "14.95",
//       },
//     ],
//   },

//   {
//     name: "Peak Evaporated Milk",
//     slug: "peak-evaporated-milk",
//     sku: "PEAK-EVAP-MILK",
//     brand: "Peak",
//     weight: null,
//     description:
//       "Rich and creamy evaporated milk for tea, porridge, and baking.",
//     retailPrice: "2.29",
//     wholesalePrice: "1.75",
//     imageUrls: [],
//     category: "Milk & Dairy",
//     variants: [
//       {
//         name: "170ml",
//         sku: "PEAK-EVAP-170ML",
//         weight: "170ml",
//         retailPrice: "2.29",
//         wholesalePrice: "1.75",
//       },
//       {
//         name: "360ml",
//         sku: "PEAK-EVAP-360ML",
//         weight: "360ml",
//         retailPrice: "3.99",
//         wholesalePrice: "3.10",
//       },
//     ],
//   },

//   {
//     name: "Cowbell Our Milk Instant Filled Milk Powder",
//     slug: "cowbell-our-milk-instant-filled-milk-powder",
//     sku: "COWBELL-MILK-POWDER",
//     brand: "Cowbell",
//     weight: "900g",
//     description:
//       "Smooth instant milk powder enriched with vitamins and minerals.",
//     retailPrice: "12.99",
//     wholesalePrice: "10.75",
//     imageUrls: [],
//     category: "Milk & Dairy",
//   },

//   {
//     name: "Nestlé Cerelac Wheat Infant Cereal With Milk",
//     slug: "nestle-cerelac-wheat-infant-cereal-with-milk",
//     sku: "CERELAC-WHEAT-1KG",
//     brand: "Nestlé Cerelac",
//     weight: "1kg",
//     description: "Smooth wheat cereal with milk crafted for growing babies.",
//     retailPrice: "14.99",
//     wholesalePrice: "12.25",
//     imageUrls: [],
//     category: "Breakfast & Cereals",
//   },

//   {
//     name: "Nestlé Cerelac Maize With Milk",
//     slug: "nestle-cerelac-maize-with-milk",
//     sku: "CERELAC-MAIZE-400G",
//     brand: "Nestlé Cerelac",
//     weight: "400g",
//     description: "Gentle maize cereal with milk for a smooth baby meal.",
//     retailPrice: "7.99",
//     wholesalePrice: "6.25",
//     imageUrls: [],
//     category: "Breakfast & Cereals",
//   },

//   {
//     name: "Nestlé Cerelac Wheat & Honey",
//     slug: "nestle-cerelac-wheat-and-honey",
//     sku: "CERELAC-WHEAT-HONEY-1KG",
//     brand: "Nestlé Cerelac",
//     weight: "1kg",
//     description: "Nutritious wheat cereal blended with honey and milk.",
//     retailPrice: "15.99",
//     wholesalePrice: "13.25",
//     imageUrls: [],
//     category: "Breakfast & Cereals",
//   },

//   {
//     name: "Cadbury Bournvita Food Drink",
//     slug: "cadbury-bournvita-food-drink",
//     sku: "BOURNVITA-800G",
//     brand: "Cadbury Bournvita",
//     weight: "800g",
//     description:
//       "Creamy chocolate food drink packed with classic Bournvita flavor.",
//     retailPrice: "14.99",
//     wholesalePrice: "12.50",
//     imageUrls: [],
//     category: "Malted & Chocolate Drinks",
//   },

//   {
//     name: "Ovaltine Malted Drink",
//     slug: "ovaltine-malted-drink",
//     sku: "OVALTINE-MALTED-DRINK",
//     brand: "Ovaltine",
//     weight: null,
//     description:
//       "Chocolatey malt drink mix enriched with vitamins and minerals.",
//     retailPrice: "7.49",
//     wholesalePrice: "5.95",
//     imageUrls: [],
//     category: "Malted & Chocolate Drinks",
//     variants: [
//       {
//         name: "400g",
//         sku: "OVALTINE-400G",
//         weight: "400g",
//         retailPrice: "7.49",
//         wholesalePrice: "5.95",
//       },
//       {
//         name: "800g",
//         sku: "OVALTINE-800G",
//         weight: "800g",
//         retailPrice: "13.99",
//         wholesalePrice: "11.50",
//       },
//       {
//         name: "1.2kg",
//         sku: "OVALTINE-1200G",
//         weight: "1.2kg",
//         retailPrice: "19.99",
//         wholesalePrice: "16.75",
//       },
//     ],
//   },

//   {
//     name: "Ovaltine Nutri 10 Jar",
//     slug: "ovaltine-nutri-10-jar",
//     sku: "OVALTINE-NUTRI10-JAR",
//     brand: "Ovaltine",
//     weight: "400g",
//     description:
//       "Rich chocolate malt drink with Nutri 10 vitamins and minerals.",
//     retailPrice: "8.99",
//     wholesalePrice: "7.25",
//     imageUrls: [],
//     category: "Malted & Chocolate Drinks",
//   },

//   {
//     name: "Horlicks Original Malted Drink",
//     slug: "horlicks-original-malted-drink",
//     sku: "HORLICKS-ORIGINAL",
//     brand: "Horlicks",
//     weight: null,
//     description: "Original hot malty goodness for a comforting cup anytime.",
//     retailPrice: "6.99",
//     wholesalePrice: "5.50",
//     imageUrls: [],
//     category: "Malted & Chocolate Drinks",
//     variants: [
//       {
//         name: "270g",
//         sku: "HORLICKS-270G",
//         weight: "270g",
//         retailPrice: "6.99",
//         wholesalePrice: "5.50",
//       },
//       {
//         name: "400g",
//         sku: "HORLICKS-400G",
//         weight: "400g",
//         retailPrice: "8.99",
//         wholesalePrice: "7.25",
//       },
//     ],
//   },

//   {
//     name: "Nescafé Classic Instant Coffee",
//     slug: "nescafe-classic-instant-coffee",
//     sku: "NESCAFE-CLASSIC-50G",
//     brand: "Nescafé",
//     weight: "50g",
//     description: "Classic instant coffee with bold aroma and smooth taste.",
//     retailPrice: "5.99",
//     wholesalePrice: "4.75",
//     imageUrls: [],
//     category: "Coffee & Creamers",
//   },

//   {
//     name: "Nestlé Coffee Mate Original Creamer",
//     slug: "nestle-coffee-mate-original-creamer",
//     sku: "COFFEEMATE-ORIGINAL-1KG",
//     brand: "Coffee Mate",
//     weight: "1kg",
//     description: "Rich and smooth creamer for a better morning cup.",
//     retailPrice: "11.99",
//     wholesalePrice: "9.75",
//     imageUrls: [],
//     category: "Coffee & Creamers",
//   },

//   {
//     name: "Quaker White Oats",
//     slug: "quaker-white-oats",
//     sku: "QUAKER-WHITE-OATS-500G",
//     brand: "Quaker",
//     weight: "500g",
//     description: "Classic white oats for warm breakfasts and healthy recipes.",
//     retailPrice: "5.99",
//     wholesalePrice: "4.50",
//     imageUrls: [],
//     category: "Breakfast & Cereals",
//   },
// ];

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

async function seedProducts(products: SeedProduct[]) {
  for (const product of products) {
    if (!product.category) {
      throw new Error(`${product.name} has no category.`);
    }

    const categorySlug = product.category
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/,/g, "")
      .replace(/\s+/g, "-");

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
      } = {
        ...productData(categorySlug, product),
      };

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

  console.info(`Seeded ${products.length} products`);
}

async function main() {
  await seedAdmin();
  await seedCategories();
  // await seedProducts(products);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
