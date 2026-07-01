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
  {
    name: "Cooking Oils, Creams & Sauces",
    slug: "cooking-oils-creams-sauces",
    imageUrl: "/images/categories/frednes-oils-sauces.jpg",
    sortOrder: 10,
    description:
      "Cooking oils, sauces, creams, condiments, and pantry essentials for everyday meals.",
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
//   // {
//   //   name: "Clabber Girl Baking Soda",
//   //   slug: "clabber-girl-baking-soda-5lb",
//   //   sku: "CG-BS-5LB",
//   //   brand: "Clabber Girl",
//   //   weight: "5 lb",
//   //   description:
//   //     "Multi-purpose baking soda for baking, cleaning and deodorizing.",
//   //   retailPrice: "8.99",
//   //   wholesalePrice: "6.90",
//   //   imageUrls: [],
//   //   category: "Baking",
//   // },

//   // {
//   //   name: "Le Vainqueur Refined Baking Soda",
//   //   slug: "le-vainqueur-refined-baking-soda",
//   //   sku: "LV-BS-125",
//   //   brand: "Le Vainqueur",
//   //   weight: "125g",
//   //   description:
//   //     "Refined baking soda suitable for cooking, baking and household use.",
//   //   retailPrice: "1.99",
//   //   wholesalePrice: "1.35",
//   //   imageUrls: [],
//   //   category: "Baking",
//   // },

//   {
//     name: "Amora Dijon Mustard",
//     slug: "amora-dijon-mustard",
//     sku: "AMO-DIJ-440",
//     brand: "Amora",
//     weight: "440g",
//     description:
//       "Traditional French Dijon mustard with a smooth and strong flavor.",
//     retailPrice: "5.99",
//     wholesalePrice: "4.60",
//     imageUrls: [],
//     category: "Cooking Oils, Creams & Sauces",
//   },

//   {
//     name: "Adum Foods Creamy Peanut Butter",
//     slug: "adum-foods-creamy-peanut-butter-454g",
//     sku: "ADUM-PB-454",
//     brand: "Adum Foods",
//     weight: "454g",
//     description:
//       "Creamy peanut butter with no added salt and naturally rich peanut flavor.",
//     retailPrice: "6.99",
//     wholesalePrice: "5.50",
//     imageUrls: [],
//     category: "Cooking Oils, Creams & Sauces",
//   },
// ];

// const products: SeedProduct[] = [
//   {
//     name: "Nutella Hazelnut Spread with Cocoa",
//     slug: "nutella-hazelnut-spread-with-cocoa",
//     sku: "NUTELLA-HAZELNUT-SPREAD",
//     brand: "Nutella",
//     weight: null,
//     description:
//       "Classic creamy hazelnut spread with cocoa, perfect for bread, pancakes, pastries, and breakfast treats.",
//     retailPrice: "0.00",
//     wholesalePrice: "0.00",
//     imageUrls: [],
//     category: "Breakfast & Cereals",
//     variants: [
//       {
//         name: "Small Jar",
//         sku: "NUTELLA-HAZELNUT-SPREAD-SM",
//         weight: "350g",
//         retailPrice: "6.99",
//         wholesalePrice: "5.40",
//       },
//       {
//         name: "Large Jar",
//         sku: "NUTELLA-HAZELNUT-SPREAD-LG",
//         weight: "750g",
//         retailPrice: "12.99",
//         wholesalePrice: "10.25",
//       },
//     ],
//   },
//   {
//     name: "Heinz Baked Beanz",
//     slug: "heinz-baked-beanz",
//     sku: "HEINZ-BAKED-BEANZ",
//     brand: "Heinz",
//     weight: null,
//     description:
//       "Classic Heinz baked beans in rich tomato sauce, ready to heat and serve.",
//     retailPrice: "0.00",
//     wholesalePrice: "0.00",
//     imageUrls: [],
//     category: "Canned Foods",
//     variants: [
//       {
//         name: "Small Can",
//         sku: "HEINZ-BAKED-BEANZ-SM",
//         weight: "220g",
//         retailPrice: "2.49",
//         wholesalePrice: "1.85",
//       },
//       {
//         name: "Large Can",
//         sku: "HEINZ-BAKED-BEANZ-LG",
//         weight: "415g",
//         retailPrice: "3.99",
//         wholesalePrice: "3.10",
//       },
//     ],
//   },
//   {
//     name: "Amora Dijon Mustard Fine & Forte",
//     slug: "amora-dijon-mustard-fine-forte",
//     sku: "AMORA-DIJON-MUSTARD-440G",
//     brand: "Amora",
//     weight: "440g",
//     description:
//       "Authentic French Dijon mustard with a smooth texture and strong, sharp flavor.",
//     retailPrice: "5.99",
//     wholesalePrice: "4.60",
//     imageUrls: [],
//     category: "Cooking Oils, Creams & Sauces",
//   },
//   {
//     name: "Heinz Salad Cream Original",
//     slug: "heinz-salad-cream-original",
//     sku: "HEINZ-SALAD-CREAM-285G",
//     brand: "Heinz",
//     weight: "285g",
//     description:
//       "Original Heinz salad cream with a creamy, tangy flavor for salads, sandwiches, and sides.",
//     retailPrice: "4.99",
//     wholesalePrice: "3.80",
//     imageUrls: [],
//     category: "Cooking Oils, Creams & Sauces",
//   },
//   {
//     name: "Jesdit Moi Moi Cooking Pouch",
//     slug: "jesdit-moi-moi-cooking-pouch-100-count",
//     sku: "JESDIT-MOI-MOI-POUCH-100CT",
//     brand: "Jesdit",
//     weight: "100 pouches",
//     description:
//       "Convenient moi moi and oleleh cooking pouches designed to make steaming bean pudding easier.",
//     retailPrice: "6.99",
//     wholesalePrice: "5.25",
//     imageUrls: [],
//     category: "Fufu",
//   },
//   {
//     name: "Rosa Margarine",
//     slug: "rosa-premium-quality-margarine",
//     sku: "ROSA-MARGARINE-450G",
//     brand: "Rosa",
//     weight: "450g",
//     description:
//       "Premium quality margarine from Holland, rich in vitamins A and D for cooking, baking, and spreading.",
//     retailPrice: "4.99",
//     wholesalePrice: "3.80",
//     imageUrls: [],
//     category: "Cooking Oils, Creams & Sauces",
//   },
//   {
//     name: "Calvé Mayonnaise",
//     slug: "calve-mayonnaise",
//     sku: "CALVE-MAYONNAISE",
//     brand: "Calvé",
//     weight: null,
//     description:
//       "Creamy mayonnaise for sandwiches, salads, fries, grilled meats, and everyday meals.",
//     retailPrice: "0.00",
//     wholesalePrice: "0.00",
//     imageUrls: [],
//     category: "Cooking Oils, Creams & Sauces",
//     variants: [
//       {
//         name: "225ml",
//         sku: "CALVE-MAYONNAISE-225ML",
//         weight: "225ml",
//         retailPrice: "3.99",
//         wholesalePrice: "2.95",
//       },
//       {
//         name: "450ml",
//         sku: "CALVE-MAYONNAISE-450ML",
//         weight: "450ml",
//         retailPrice: "6.99",
//         wholesalePrice: "5.25",
//       },
//       {
//         name: "825ml",
//         sku: "CALVE-MAYONNAISE-825ML",
//         weight: "825ml",
//         retailPrice: "10.99",
//         wholesalePrice: "8.50",
//       },
//     ],
//   },
//   {
//     name: "Potash Stones Kaun",
//     slug: "potash-stones-kaun",
//     sku: "POTASH-STONES-KAUN",
//     brand: "Royal Star",
//     weight: "Small jar",
//     description:
//       "Traditional potash stones, also known as kaun, used in African cooking for soups, beans, and specialty dishes.",
//     retailPrice: "3.99",
//     wholesalePrice: "2.85",
//     imageUrls: [],
//     category: "Spices",
//   },
//   {
//     name: "Potash Powder Kaun",
//     slug: "potash-powder-kaun",
//     sku: "POTASH-POWDER-KAUN",
//     brand: "Potash",
//     weight: "Small jar",
//     description:
//       "Ground potash powder used in traditional African recipes such as okra soup, beans, and local dishes.",
//     retailPrice: "3.99",
//     wholesalePrice: "2.85",
//     imageUrls: [],
//     category: "Spices",
//   },
//   {
//     name: "African Best Peanut",
//     slug: "african-best-peanut-510g",
//     sku: "AFRICAN-BEST-PEANUT-510G",
//     brand: "African Best",
//     weight: "510g",
//     description:
//       "Roasted peanuts packed in a bottle for snacking, sharing, and pantry use.",
//     retailPrice: "6.99",
//     wholesalePrice: "5.25",
//     imageUrls: [],
//     category: "Snacks & Confectionery",
//   },
//   {
//     name: "Tropical Sun Crunchy Coconut Peanuts",
//     slug: "tropical-sun-crunchy-coconut-peanuts",
//     sku: "TROPICAL-SUN-COCONUT-PEANUTS",
//     brand: "Tropical Sun",
//     weight: "180g",
//     description:
//       "Crunchy peanuts coated with real coconut cream for a sweet tropical snack.",
//     retailPrice: "4.99",
//     wholesalePrice: "3.75",
//     imageUrls: [],
//     category: "Snacks & Confectionery",
//   },
//   {
//     name: "Golden Natural Pitted Deglet Noor Dates",
//     slug: "golden-natural-pitted-deglet-noor-dates-284g",
//     sku: "GOLDEN-DEGLET-NOOR-DATES-284G",
//     brand: "Golden",
//     weight: "284g",
//     description:
//       "Natural Algerian pitted Deglet Noor dates, sweet and rich in fiber for snacking and Ramadan tables.",
//     retailPrice: "5.99",
//     wholesalePrice: "4.50",
//     imageUrls: [],
//     category: "Fruits",
//   },
//   {
//     name: "African Best Roasted Corn & Peanuts",
//     slug: "african-best-roasted-corn-and-peanuts",
//     sku: "AFRICAN-BEST-ROASTED-CORN-PEANUTS",
//     brand: "African Best",
//     weight: "1 container",
//     description:
//       "Traditional roasted corn and peanuts snack mix, crunchy and satisfying.",
//     retailPrice: "6.00",
//     wholesalePrice: "4.75",
//     imageUrls: [],
//     category: "Snacks & Confectionery",
//   },
//   {
//     name: "Gonyek Spicy Yam Chips",
//     slug: "gonyek-spicy-yam-chips-65g",
//     sku: "GONYEK-SPICY-YAM-CHIPS-65G",
//     brand: "Gonyek",
//     weight: "65g",
//     description:
//       "All-natural spicy yam chips with a crisp texture and bold savory flavor.",
//     retailPrice: "2.99",
//     wholesalePrice: "2.10",
//     imageUrls: [],
//     category: "Snacks & Confectionery",
//   },
//   {
//     name: "Checkers Custard Powder Vanilla Flavour",
//     slug: "checkers-custard-powder-vanilla-flavour",
//     sku: "CHECKERS-CUSTARD-VANILLA",
//     brand: "Checkers",
//     weight: "400g",
//     description:
//       "Smooth vanilla custard powder for breakfast, desserts, and family meals.",
//     retailPrice: "4.99",
//     wholesalePrice: "3.75",
//     imageUrls: [],
//     category: "Breakfast & Cereals",
//   },
//   {
//     name: "Checkers Custard Powder Banana Flavour",
//     slug: "checkers-custard-powder-banana-flavour",
//     sku: "CHECKERS-CUSTARD-BANANA",
//     brand: "Checkers",
//     weight: "400g",
//     description:
//       "Creamy banana-flavored custard powder for warm breakfast bowls and desserts.",
//     retailPrice: "4.99",
//     wholesalePrice: "3.75",
//     imageUrls: [],
//     category: "Breakfast & Cereals",
//   },
//   {
//     name: "Kirkland Signature Organic Apple Cider Vinegar",
//     slug: "kirkland-signature-organic-apple-cider-vinegar-32oz",
//     sku: "KIRKLAND-APPLE-CIDER-VINEGAR-32OZ",
//     brand: "Kirkland Signature",
//     weight: "32 fl oz",
//     description:
//       "Raw and unfiltered organic apple cider vinegar, never from concentrate and with the mother.",
//     retailPrice: "7.99",
//     wholesalePrice: "6.25",
//     imageUrls: [],
//     category: "Cooking Oils, Creams & Sauces",
//   },
//   {
//     name: "Magnolia Sweetened Condensed Milk",
//     slug: "magnolia-sweetened-condensed-milk",
//     sku: "MAGNOLIA-CONDENSED-MILK",
//     brand: "Magnolia",
//     weight: "14 oz",
//     description:
//       "Sweetened condensed milk for desserts, drinks, baking, and creamy recipes.",
//     retailPrice: "3.49",
//     wholesalePrice: "2.65",
//     imageUrls: [],
//     category: "Milk & Dairy",
//   },
//   {
//     name: "Red & White Sweetened Condensed Milk",
//     slug: "red-and-white-sweetened-condensed-milk-14oz",
//     sku: "REDWHITE-CONDENSED-MILK-14OZ",
//     brand: "Red & White",
//     weight: "14 oz",
//     description:
//       "Premium sweetened condensed milk for baking, desserts, coffee, and sweet recipes.",
//     retailPrice: "3.29",
//     wholesalePrice: "2.45",
//     imageUrls: [],
//     category: "Milk & Dairy",
//   },
// ];

// const products: SeedProduct[] = [
//   {
//     name: "Indomie Oriental Fried Noodles",
//     slug: "indomie-oriental-fried-noodles",
//     sku: "INDOMIE-ORIENTAL-FRIED-NOODLES",
//     brand: "Indomie",
//     weight: "70g",
//     description:
//       "Instant oriental fried noodles with a savory seasoning blend for a quick and satisfying meal.",
//     retailPrice: "0.99",
//     wholesalePrice: "0.65",
//     imageUrls: [],
//     category: "Grains & Rice",
//   },
//   {
//     name: "Indomie Chicken Peppersoup Noodles",
//     slug: "indomie-chicken-peppersoup-noodles",
//     sku: "INDOMIE-CHICKEN-PEPPERSOUP-NOODLES",
//     brand: "Indomie",
//     weight: "70g",
//     description:
//       "Instant noodles with bold chicken peppersoup flavor and spicy seasoning.",
//     retailPrice: "0.99",
//     wholesalePrice: "0.65",
//     imageUrls: [],
//     category: "Grains & Rice",
//   },
//   {
//     name: "Indomie Onion Chicken Noodles",
//     slug: "indomie-onion-chicken-noodles",
//     sku: "INDOMIE-ONION-CHICKEN-NOODLES",
//     brand: "Indomie",
//     weight: "70g",
//     description:
//       "Instant noodles with onion chicken flavor and seasoning oil for a quick everyday meal.",
//     retailPrice: "0.99",
//     wholesalePrice: "0.65",
//     imageUrls: [],
//     category: "Grains & Rice",
//   },
//   {
//     name: "Indomie Chicken Flavor Noodles",
//     slug: "indomie-chicken-flavor-noodles",
//     sku: "INDOMIE-CHICKEN-FLAVOR-NOODLES",
//     brand: "Indomie",
//     weight: "70g",
//     description:
//       "Classic Indomie chicken flavor instant noodles, easy to prepare and family friendly.",
//     retailPrice: "0.99",
//     wholesalePrice: "0.65",
//     imageUrls: [],
//     category: "Grains & Rice",
//   },
//   {
//     name: "Home Fresh Tuo Zaafi Corn & Rice Flour",
//     slug: "home-fresh-tuo-zaafi-corn-rice-flour",
//     sku: "HOMEFRESH-TUO-ZAAFI-1KG",
//     brand: "Home Fresh",
//     weight: "1kg",
//     description:
//       "Corn and rice flour blend for preparing smooth traditional Tuo Zaafi.",
//     retailPrice: "8.99",
//     wholesalePrice: "6.95",
//     imageUrls: [],
//     category: "Fufu",
//   },
//   {
//     name: "Home Fresh Kokonte Cassava Flour",
//     slug: "home-fresh-kokonte-cassava-flour",
//     sku: "HOMEFRESH-KOKONTE-1KG",
//     brand: "Home Fresh",
//     weight: "1kg",
//     description:
//       "Cassava flour for preparing traditional Kokonte, a popular West African swallow.",
//     retailPrice: "8.99",
//     wholesalePrice: "6.95",
//     imageUrls: [],
//     category: "Fufu",
//   },
//   {
//     name: "Madam Jas Banku Mix Flour",
//     slug: "madam-jas-banku-mix-flour",
//     sku: "MADAM-JAS-BANKU-MIX-1KG",
//     brand: "Madam Jas",
//     weight: "1kg",
//     description:
//       "Ready-to-cook banku flour mix for preparing authentic Ghanaian banku at home.",
//     retailPrice: "8.99",
//     wholesalePrice: "6.95",
//     imageUrls: [],
//     category: "Fufu",
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
      .replace(/&/g, "") // Remove the ampersand entirely
      .replace(/,/g, "") // Remove commas
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Collapse multiple hyphens (e.g., "--") into one "-"
      .replace(/^-+|-+$/g, ""); // Trim hyphens from the start and end

    console.log("Trying:", product.name, "=>", categorySlug);

    const categoryExists = await prisma.category.findUnique({
      where: { slug: categorySlug },
      select: { id: true, name: true, slug: true },
    });

    if (!categoryExists) {
      throw new Error(
        `Missing category for product "${product.name}". Expected slug: "${categorySlug}"`,
      );
    }

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
  //await seedProducts(products);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
