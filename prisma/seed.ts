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
    imageUrl: "/images/categories/fredness-proteins.jpg",
    sortOrder: 1,
    description:
      "Beans, nuts, seeds, and other protein-rich pantry staples for everyday African cooking.",
  },
  {
    name: "Fish & Seafood",
    slug: "fish-seafood",
    imageUrl: "/images/categories/fredness-fish-seafood.jpg",
    sortOrder: 2,
    description:
      "Smoked, dried, and preserved fish and seafood for soups, stews, sauces, and traditional dishes.",
  },
  {
    name: "Grains & Rice",
    slug: "grains-rice",
    imageUrl: "/images/categories/fredness-bulk-rice.jpg",
    sortOrder: 3,
    description:
      "Rice, grains, legumes, and staple ingredients for family meals and bulk pantry stocking.",
  },
  {
    name: "Fufu",
    slug: "fufu",
    imageUrl: "/images/categories/fredness-fufu.jpg",
    sortOrder: 4,
    description:
      "Flours and mixes for preparing fufu, banku, pounded yam, and other traditional swallows.",
  },
  {
    name: "Vegetables",
    slug: "vegetables",
    imageUrl: "/images/categories/fredness-vegetables.jpg",
    sortOrder: 5,
    description:
      "Fresh, dried, and prepared vegetables for soups, stews, sauces, and everyday cooking.",
  },
  {
    name: "Spices",
    slug: "spices",
    imageUrl: "/images/categories/fredness-spices.jpg",
    sortOrder: 6,
    description:
      "African spices, peppers, soup thickeners, and seasonings for bold traditional flavor.",
  },
  {
    name: "Drinks",
    slug: "drinks",
    imageUrl: "/images/categories/fredness-drinks.jpg",
    sortOrder: 7,
    description:
      "Juices, sodas, malt drinks, and refreshment staples for home, shops, and events.",
  },
  {
    name: "Fruits",
    slug: "fruits",
    imageUrl: "/images/categories/frednes-fruits.jpg",
    sortOrder: 8,
    description:
      "Dried fruits, fruit snacks, and naturally sweet pantry favorites.",
  },
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
    name: "Snacks, Breads & Confectionery",
    slug: "snacks-breads-confectionery",
    imageUrl: "/images/categories/fredness-snacks.jpg",
    sortOrder: 15,
    description:
      "Crunchy snacks, Fresh breads, sweet treats, and grab-and-go favorites for home, shops, and gatherings.",
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
  | "Snacks, Breads & Confectionery"
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

const categorySlugOverrides: Partial<Record<ProductCategory, string>> = {
  "Breakfast & Cereals": "breakfast-and-cereals",
  "Snacks, Breads & Confectionery": "snacks-breads-confectionery",
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

// const products: SeedProduct[] = [
//   {
//     name: "African Best Dry Iru",
//     slug: "african-best-dry-iru",
//     sku: "AFRICAN-BEST-DRY-IRU",
//     brand: "African Best",
//     weight: "1 container",
//     description:
//       "Dried iru, also known as fermented locust beans, for adding deep savory flavor to soups, stews, and sauces.",
//     retailPrice: "6.00",
//     wholesalePrice: "4.80",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXkHSd01HcQCHnKLdWJmD3Z1PFtAusMY7ToxSB",
//     ],
//     category: "Spices",
//   },
//   {
//     name: "Tasty Foods Mbongo Spice",
//     slug: "tasty-foods-mbongo-spice-3oz",
//     sku: "TASTY-FOODS-MBONGO-SPICE-3OZ",
//     brand: "Tasty Foods",
//     weight: "3 oz",
//     description:
//       "Ground mbongo spice blend for preparing Cameroonian mbongo tchobi and richly seasoned black stews.",
//     retailPrice: "4.99",
//     wholesalePrice: "3.75",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXLvwM9pIXoR4QwdV2CKS7E1pDUexhzakf0IHJ",
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXlmLd44F1DeTIj320y6NViZlHOGkKqd4FoxEL",
//     ],
//     category: "Spices",
//   },
//   {
//     name: "White Cloves",
//     slug: "white-cloves",
//     sku: "WHITE-CLOVES",
//     brand: "African Best",
//     weight: "1 container",
//     description:
//       "Whole white cloves with warm aromatic flavor for spice blends, teas, marinades, and traditional cooking.",
//     retailPrice: "5.00",
//     wholesalePrice: "4.00",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXv1ja8YX6CQgPtxMVDopG2H9Wiu8YrbOXL3AJ",
//     ],
//     category: "Spices",
//   },
//   {
//     name: "African Best Ukwa",
//     slug: "african-best-ukwa",
//     sku: "AFRICAN-BEST-UKWA",
//     brand: "African Best",
//     weight: null,
//     description:
//       "Dried African breadfruit seeds for preparing traditional ukwa porridge, soups, and hearty staple dishes.",
//     retailPrice: "0.00",
//     wholesalePrice: "0.00",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNX2B48GeWKNpRGQMoemS15q0TasbWAOw8DtVUY",
//     ],
//     category: "Grains & Rice",
//     variants: [
//       {
//         name: "Small Tub",
//         sku: "AFRICAN-BEST-UKWA-SM",
//         weight: "1 lb",
//         retailPrice: "5.00",
//         wholesalePrice: "4.00",
//       },
//       {
//         name: "Large Tub",
//         sku: "AFRICAN-BEST-UKWA-LG",
//         weight: "1 lb",
//         retailPrice: "8.00",
//         wholesalePrice: "6.40",
//       },
//     ],
//   },
//   {
//     name: "African Best Soya Bean Powder",
//     slug: "african-best-soya-bean-powder",
//     sku: "AFRICAN-BEST-SOYA-BEAN-POWDER",
//     brand: "African Best",
//     weight: "1 lb",
//     description:
//       "Fine soya bean powder for pap, porridge, baking, smoothies, and protein-rich traditional recipes.",
//     retailPrice: "8.00",
//     wholesalePrice: "6.40",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXLNOtqblIXoR4QwdV2CKS7E1pDUexhzakf0IH",
//     ],
//     category: "Proteins",
//   },
//   {
//     name: "African Best Mabuyu Red",
//     slug: "african-best-mabuyu-red",
//     sku: "AFRICAN-BEST-MABUYU-RED",
//     brand: "African Best",
//     weight: "1 container",
//     description:
//       "Red mabuyu baobab candy with a tangy-sweet coating, popular as a nostalgic East African snack.",
//     retailPrice: "5.00",
//     wholesalePrice: "4.00",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXT1Di6b4xANvhWd6lkPZwVCGOImSK9YaDEXfg",
//     ],
//     category: "Fruits",
//   },
//   {
//     name: "Whole Ogbono",
//     slug: "whole-ogbono",
//     sku: "WHOLE-OGBONO",
//     brand: "African Best",
//     weight: null,
//     description:
//       "Whole ogbono seeds used as a natural thickener for rich, glossy African soups and stews.",
//     retailPrice: "0.00",
//     wholesalePrice: "0.00",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXjjyY93FUYqgMeuyhvxCk8rOpNnTw70jzoHbP",
//     ],
//     category: "Spices",
//     variants: [
//       {
//         name: "Small Tub",
//         sku: "WHOLE-OGBONO-SM",
//         weight: "0.410 lb",
//         retailPrice: "9.02",
//         wholesalePrice: "7.20",
//       },
//       {
//         name: "Large Tub",
//         sku: "WHOLE-OGBONO-LG",
//         weight: "0.685 lb",
//         retailPrice: "15.07",
//         wholesalePrice: "12.05",
//       },
//     ],
//   },
//   {
//     name: "Dried Pepper Shombo",
//     slug: "dried-pepper-shombo",
//     sku: "DRIED-PEPPER-SHOMBO",
//     brand: "African Best",
//     weight: null,
//     description:
//       "Dried shombo peppers with bold heat and color for stews, pepper sauces, soups, and seasoning blends.",
//     retailPrice: "0.00",
//     wholesalePrice: "0.00",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXT975smxANvhWd6lkPZwVCGOImSK9YaDEXfgt",
//     ],
//     category: "Spices",
//     variants: [
//       {
//         name: "Tub",
//         sku: "DRIED-PEPPER-SHOMBO-TUB",
//         weight: "1 container",
//         retailPrice: "10.00",
//         wholesalePrice: "8.00",
//       },
//       {
//         name: "Tall Jar",
//         sku: "DRIED-PEPPER-SHOMBO-JAR",
//         weight: "1 container",
//         retailPrice: "15.00",
//         wholesalePrice: "12.00",
//       },
//     ],
//   },
//   {
//     name: "African Best Liberian Beans",
//     slug: "african-best-liberian-beans",
//     sku: "AFRICAN-BEST-LIBERIAN-BEANS",
//     brand: "African Best",
//     weight: "1 container",
//     description:
//       "Mixed Liberian beans for hearty stews, rice dishes, and protein-rich family meals.",
//     retailPrice: "7.50",
//     wholesalePrice: "6.00",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXwv7RUyA2G9mNXOBKC65Pa7porlUtgM1SzkLe",
//     ],
//     category: "Proteins",
//   },
//   {
//     name: "Tasty Foods Njansang Akpi",
//     slug: "tasty-foods-njansang-akpi-3oz",
//     sku: "TASTY-FOODS-NJANSANG-AKPI-3OZ",
//     brand: "Tasty Foods",
//     weight: "3 oz",
//     description:
//       "Whole njansang, also called akpi, used to thicken and flavor pepper soups, sauces, and stews.",
//     retailPrice: "4.99",
//     wholesalePrice: "3.75",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXCZoeUYJGDNTIJPmq7LiCuRpwSEMecbKWQ58O",
//     ],
//     category: "Spices",
//   },
//   {
//     name: "Gonyek Salted Plantain Chips",
//     slug: "gonyek-salted-plantain-chips-2-3oz",
//     sku: "GONYEK-SALTED-PLANTAIN-CHIPS-2-3OZ",
//     brand: "Gonyek",
//     weight: "2.3 oz",
//     description:
//       "Crispy ripe plantain chips with a salted finish for a crunchy vegetarian snack.",
//     retailPrice: "2.49",
//     wholesalePrice: "1.85",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNX6lNj38fTIdoa8APqmKptfzCilvc2yUEW9k3b",
//     ],
//     category: "Snacks & Confectionery",
//   },
//   {
//     name: "African Best Smoked Fish",
//     slug: "african-best-smoked-fish",
//     sku: "AFRICAN-BEST-SMOKED-FISH",
//     brand: "African Best",
//     weight: "1 container",
//     description:
//       "Dried smoked fish for adding savory seafood depth to soups, stews, sauces, and traditional meals.",
//     retailPrice: "8.00",
//     wholesalePrice: "6.40",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXRREJHkUXB0Qm2LsIibVYAJxv6Et8kd3aUqn1",
//     ],
//     category: "Fish & Seafood",
//   },
//   {
//     name: "African Best Tiger Nuts",
//     slug: "african-best-tiger-nuts",
//     sku: "AFRICAN-BEST-TIGER-NUTS",
//     brand: "African Best",
//     weight: "0.455 lb",
//     description:
//       "Whole tiger nuts with a naturally sweet, nutty crunch for snacking or making traditional drinks.",
//     retailPrice: "5.46",
//     wholesalePrice: "4.35",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXgXkoFWnob5x69mSJEQUfGjOz3TDPZqheIC7Y",
//     ],
//     category: "Snacks & Confectionery",
//   },
//   {
//     name: "Tasty Foods Ground Country Onion",
//     slug: "tasty-foods-ground-country-onion-2oz",
//     sku: "TASTY-FOODS-GROUND-COUNTRY-ONION-2OZ",
//     brand: "Tasty Foods",
//     weight: "2 oz",
//     description:
//       "Ground country onion powder for aromatic Cameroon-style soups, sauces, stews, and seasoning blends.",
//     retailPrice: "4.99",
//     wholesalePrice: "3.75",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNX8yDpF7BtpWNA2JcSXHGh9I8YufnPOUkVgz1B",
//     ],
//     category: "Spices",
//   },
//   {
//     name: "Kengerian Kitchen Samosa & Empanada Seasoning",
//     slug: "kengerian-kitchen-samosa-empanada-seasoning",
//     sku: "KENGERIAN-SAMOSA-EMPANADA-SEASONING",
//     brand: "Kengerian Kitchen",
//     weight: "1 pouch",
//     description:
//       "Savory seasoning blend made for samosa and empanada fillings, pastries, snacks, and spiced meats.",
//     retailPrice: "6.99",
//     wholesalePrice: "5.25",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXBOWeYXVUFoSHVOz6iry4PwWQ5KdDR1BxGqnt",
//     ],
//     category: "Spices",
//   },
//   {
//     name: "African Best Grounded Crayfish",
//     slug: "african-best-grounded-crayfish",
//     sku: "AFRICAN-BEST-GROUNDED-CRAYFISH",
//     brand: "African Best",
//     weight: null,
//     description:
//       "Ground dried crayfish for boosting soups, stews, sauces, and greens with concentrated seafood flavor.",
//     retailPrice: "0.00",
//     wholesalePrice: "0.00",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNX1fjmaOD5eMVEqQchlkgbBUPnuW7drwAvzOa3",
//     ],
//     category: "Fish & Seafood",
//     variants: [
//       {
//         name: "Small Jar",
//         sku: "AFRICAN-BEST-GROUNDED-CRAYFISH-SM",
//         weight: "0.455 lb",
//         retailPrice: "9.10",
//         wholesalePrice: "7.25",
//       },
//       {
//         name: "Medium Jar",
//         sku: "AFRICAN-BEST-GROUNDED-CRAYFISH-MD",
//         weight: "0.735 lb",
//         retailPrice: "14.70",
//         wholesalePrice: "11.75",
//       },
//       {
//         name: "Large Jar",
//         sku: "AFRICAN-BEST-GROUNDED-CRAYFISH-LG",
//         weight: "0.990 lb",
//         retailPrice: "19.80",
//         wholesalePrice: "15.85",
//       },
//       {
//         name: "Bulk Jar",
//         sku: "AFRICAN-BEST-GROUNDED-CRAYFISH-BULK",
//         weight: "2.860 lb",
//         retailPrice: "57.20",
//         wholesalePrice: "45.75",
//       },
//     ],
//   },
//   {
//     name: "African Best Uda",
//     slug: "african-best-uda",
//     sku: "AFRICAN-BEST-UDA",
//     brand: "African Best",
//     weight: "0.325 lb",
//     description:
//       "Whole uda pods, also known as negro pepper, for pepper soup, spice blends, marinades, and traditional recipes.",
//     retailPrice: "6.50",
//     wholesalePrice: "5.20",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXDtZifjbmVz6Whf5jJxIZB9EvncekuFaSwCgG",
//     ],
//     category: "Spices",
//   },
//   {
//     name: "African Best Peanut",
//     slug: "african-best-peanut",
//     sku: "AFRICAN-BEST-PEANUT",
//     brand: "African Best",
//     weight: "1.190 lb",
//     description:
//       "Shelled African Best peanuts for snacking, roasting, sauces, and everyday pantry use.",
//     retailPrice: "7.14",
//     wholesalePrice: "5.70",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXdhIqsCtw1fXiQBl8ukhZS63beKEaYUgxJyq2",
//     ],
//     category: "Snacks & Confectionery",
//   },
//   {
//     name: "Grounded Egusi",
//     slug: "grounded-egusi",
//     sku: "GROUNDED-EGUSI",
//     brand: "African Best",
//     weight: null,
//     description:
//       "Ground egusi melon seed for making thick, nutty egusi soup and other West African dishes.",
//     retailPrice: "0.00",
//     wholesalePrice: "0.00",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXLiq8sqIXoR4QwdV2CKS7E1pDUexhzakf0IHJ",
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNX73ldL5F46doexhqBGYfa1ACjRW3IFK9biQkD",
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXbfx4Fco5Op4CRV8ijmIyH2xoatJUT0sgzuX3",
//     ],
//     category: "Spices",
//     variants: [
//       {
//         name: "Small Tub",
//         sku: "GROUNDED-EGUSI-SM",
//         weight: "0.635 lb",
//         retailPrice: "6.35",
//         wholesalePrice: "5.10",
//       },
//       {
//         name: "Large Tub",
//         sku: "GROUNDED-EGUSI-LG",
//         weight: "1.255 lb",
//         retailPrice: "12.55",
//         wholesalePrice: "10.05",
//       },
//       {
//         name: "Medium Jar",
//         sku: "GROUNDED-EGUSI-1-100LB",
//         weight: "1.100 lb",
//         retailPrice: "11.00",
//         wholesalePrice: "8.80",
//       },
//       {
//         name: "Bulk Jar",
//         sku: "GROUNDED-EGUSI-2-470LB",
//         weight: "2.470 lb",
//         retailPrice: "24.70",
//         wholesalePrice: "19.75",
//       },
//     ],
//   },
//   {
//     name: "African Best Dried Okra",
//     slug: "african-best-dried-okra",
//     sku: "AFRICAN-BEST-DRIED-OKRA",
//     brand: "African Best",
//     weight: "1 pack",
//     description:
//       "Dried okra flakes for thickening okra soup, stews, and traditional vegetable dishes.",
//     retailPrice: "3.00",
//     wholesalePrice: "2.40",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXwv3zOVT2G9mNXOBKC65Pa7porlUtgM1SzkLe",
//     ],
//     category: "Vegetables",
//   },
//   {
//     name: "Maggi Star Seasoning Cubes",
//     slug: "maggi-star-seasoning-cubes-100-count",
//     sku: "MAGGI-STAR-SEASONING-CUBES-100CT",
//     brand: "Maggi",
//     weight: "400g",
//     description:
//       "Maggi Star seasoning cubes for adding savory depth to soups, stews, rice, sauces, and everyday meals.",
//     retailPrice: "8.99",
//     wholesalePrice: "6.95",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXClkAnWJGDNTIJPmq7LiCuRpwSEMecbKWQ58O",
//     ],
//     category: "Spices",
//   },
//   {
//     name: "Knorr Chicken Bouillon",
//     slug: "knorr-chicken-bouillon",
//     sku: "KNORR-CHICKEN-BOUILLON",
//     brand: "Knorr",
//     weight: null,
//     description:
//       "Chicken bouillon seasoning for building rich poultry flavor in soups, rice dishes, stews, sauces, and marinades.",
//     retailPrice: "0.00",
//     wholesalePrice: "0.00",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXdMFIzKtw1fXiQBl8ukhZS63beKEaYUgxJyq2",
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXfw4yY1rgMZ4P7hyfznBC9pm5sYerKwijcRlT",
//     ],
//     category: "Spices",
//     variants: [
//       {
//         name: "Chicken Bouillon Cubes",
//         sku: "KNORR-CHICKEN-BOUILLON-CUBES-50CT",
//         weight: "50 x 8g",
//         retailPrice: "8.99",
//         wholesalePrice: "6.95",
//       },
//       {
//         name: "Chicken Bouillon Powder Small Jar",
//         sku: "KNORR-CHICKEN-BOUILLON-POWDER-SM",
//         weight: "Small jar",
//         retailPrice: "5.99",
//         wholesalePrice: "4.50",
//       },
//       {
//         name: "Chicken Bouillon Powder Large Jar",
//         sku: "KNORR-CHICKEN-BOUILLON-POWDER-40-5OZ",
//         weight: "40.5 oz",
//         retailPrice: "18.99",
//         wholesalePrice: "14.75",
//       },
//     ],
//   },
//   {
//     name: "Crown Shrimp Seasoning Cubes",
//     slug: "crown-shrimp-seasoning-cubes",
//     sku: "CROWN-SHRIMP-SEASONING-CUBES",
//     brand: "Crown",
//     weight: "1 box",
//     description:
//       "Shrimp-flavored seasoning cubes for adding seafood taste to soups, stews, rice, sauces, and vegetable dishes.",
//     retailPrice: "7.99",
//     wholesalePrice: "6.20",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXM7TLbkCLMT5qyt9IA2aO3mxFvdXuncP7HriS",
//     ],
//     category: "Spices",
//   },
//   {
//     name: "Jumbo Stock Cubes",
//     slug: "jumbo-stock-cubes",
//     sku: "JUMBO-STOCK-CUBES",
//     brand: "Jumbo",
//     weight: null,
//     description:
//       "Jumbo dehydrated stock cubes for seasoning soups, stews, sauces, rice, beans, and everyday cooking.",
//     retailPrice: "0.00",
//     wholesalePrice: "0.00",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXB54K9DVUFoSHVOz6iry4PwWQ5KdDR1BxGqnt",
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXjyq73gFUYqgMeuyhvxCk8rOpNnTw70jzoHbP",
//     ],
//     category: "Spices",
//     variants: [
//       {
//         name: "Box",
//         sku: "JUMBO-STOCK-CUBES-48CT",
//         weight: "48 cubes",
//         retailPrice: "8.99",
//         wholesalePrice: "6.95",
//       },
//       {
//         name: "Canister",
//         sku: "JUMBO-DEHYDRATED-STOCK-CUBES-120CT",
//         weight: "100 + 20 cubes",
//         retailPrice: "14.99",
//         wholesalePrice: "11.75",
//       },
//     ],
//   },
//   {
//     name: "Maggi Chicken Flavour Seasoning Cubes",
//     slug: "maggi-chicken-flavour-seasoning-cubes",
//     sku: "MAGGI-CHICKEN-FLAVOUR-SEASONING-CUBES",
//     brand: "Maggi",
//     weight: null,
//     description:
//       "Chicken-flavored Maggi seasoning cubes for jollof rice, soups, stews, sauces, and everyday savory dishes.",
//     retailPrice: "0.00",
//     wholesalePrice: "0.00",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXfwak36GgMZ4P7hyfznBC9pm5sYerKwijcRlT",
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXwGutCF2G9mNXOBKC65Pa7porlUtgM1SzkLeH",
//     ],
//     category: "Spices",
//     variants: [
//       {
//         name: "Box Pack",
//         sku: "MAGGI-CHICKEN-FLAVOUR-CUBES-BOX",
//         weight: "1 box",
//         retailPrice: "8.99",
//         wholesalePrice: "6.95",
//       },
//       {
//         name: "Bag Pack",
//         sku: "MAGGI-CHICKEN-FLAVOUR-SEASONING-50CT",
//         weight: "50 x 8g",
//         retailPrice: "8.99",
//         wholesalePrice: "6.95",
//       },
//     ],
//   },
//   {
//     name: "Onga Bouillon Cubes",
//     slug: "onga-bouillon-cubes",
//     sku: "ONGA-BOUILLON-CUBES",
//     brand: "Onga",
//     weight: "1 bag",
//     description:
//       "Onga bouillon cubes for adding savory flavor and aroma to soups, stews, rice dishes, and sauces.",
//     retailPrice: "5.99",
//     wholesalePrice: "4.50",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXqkfnhxHqd2MjsJFtYK70QIOpun8f64gceyki",
//     ],
//     category: "Spices",
//   },
//   {
//     name: "Knorr Tomato Bouillon with Chicken Flavor",
//     slug: "knorr-tomato-bouillon-with-chicken-flavor",
//     sku: "KNORR-TOMATO-BOUILLON-CHICKEN",
//     brand: "Knorr",
//     weight: "40.5 oz",
//     description:
//       "Tomato bouillon with chicken flavor for seasoning rice, stews, soups, sauces, beans, and vegetable dishes.",
//     retailPrice: "18.99",
//     wholesalePrice: "14.75",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXvikxG9X6CQgPtxMVDopG2H9Wiu8YrbOXL3AJ",
//     ],
//     category: "Spices",
//   },
//   {
//     name: "Maggi Crayfish Seasoning Cubes",
//     slug: "maggi-crayfish-seasoning-cubes",
//     sku: "MAGGI-CRAYFISH-SEASONING-CUBES",
//     brand: "Maggi",
//     weight: "600g",
//     description:
//       "Crayfish-flavored Maggi seasoning cubes for soups, stews, seafood dishes, greens, and traditional meals.",
//     retailPrice: "12.99",
//     wholesalePrice: "10.25",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNX5q3cJquEeOQdJY39B8l0cIFUCxvfVwMyLqZR",
//     ],
//     category: "Spices",
//   },
//   {
//     name: "Onga Shrimp Seasoning Tablets",
//     slug: "onga-shrimp-seasoning-tablets",
//     sku: "ONGA-SHRIMP-SEASONING-TABLETS",
//     brand: "Onga",
//     weight: "64 x 11g",
//     description:
//       "Shrimp seasoning tablets for adding seafood aroma and flavor to soups, stews, sauces, and rice dishes.",
//     retailPrice: "13.99",
//     wholesalePrice: "10.95",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXDMEc4rmVz6Whf5jJxIZB9EvncekuFaSwCgGm",
//     ],
//     category: "Spices",
//   },
//   {
//     name: "Grace Caribbean Traditions Vegetable Seasoning",
//     slug: "grace-caribbean-traditions-vegetable-seasoning-4-51oz",
//     sku: "GRACE-CARIBBEAN-VEGETABLE-SEASONING-4-51OZ",
//     brand: "Grace",
//     weight: "4.51 oz",
//     description:
//       "Caribbean-style vegetable seasoning blend for vegetables, soups, rice, stews, marinades, and everyday cooking.",
//     retailPrice: "4.99",
//     wholesalePrice: "3.75",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXFXbot5aMcAOF9rZhD3yjVXvk21HY6iBUNEwm",
//     ],
//     category: "Spices",
//   },
//   {
//     name: "Badia Oregano",
//     slug: "badia-oregano-0-5oz",
//     sku: "BADIA-OREGANO-0-5OZ",
//     brand: "Badia",
//     weight: "0.5 oz",
//     description:
//       "Dried oregano leaves for sauces, soups, stews, meats, vegetables, and Mediterranean-style seasoning.",
//     retailPrice: "2.49",
//     wholesalePrice: "1.85",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXh6Vtlbr6Ctc9jW27oTNiaOIdxk08KQeDGJyM",
//     ],
//     category: "Spices",
//   },
//   {
//     name: "Nirwana Ground Turmeric",
//     slug: "nirwana-ground-turmeric",
//     sku: "NIRWANA-GROUND-TURMERIC",
//     brand: "Nirwana",
//     weight: null,
//     description:
//       "Ground turmeric powder with warm color and earthy flavor for curries, rice, soups, stews, and spice blends.",
//     retailPrice: "0.00",
//     wholesalePrice: "0.00",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXjcBtgwFUYqgMeuyhvxCk8rOpNnTw70jzoHbP",
//     ],
//     category: "Spices",
//     variants: [
//       {
//         name: "Small Jar",
//         sku: "NIRWANA-GROUND-TURMERIC-7OZ",
//         weight: "7 oz",
//         retailPrice: "5.99",
//         wholesalePrice: "4.50",
//       },
//       {
//         name: "Large Jar",
//         sku: "NIRWANA-GROUND-TURMERIC-16OZ",
//         weight: "16 oz",
//         retailPrice: "10.99",
//         wholesalePrice: "8.50",
//       },
//     ],
//   },
//   {
//     name: "Nirwana Black Pepper",
//     slug: "nirwana-black-pepper",
//     sku: "NIRWANA-BLACK-PEPPER",
//     brand: "Nirwana",
//     weight: null,
//     description:
//       "Whole black pepper for grinding fresh over meats, soups, stews, sauces, rice dishes, and marinades.",
//     retailPrice: "0.00",
//     wholesalePrice: "0.00",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXLnkpPQIXoR4QwdV2CKS7E1pDUexhzakf0IHJ",
//     ],
//     category: "Spices",
//     variants: [
//       {
//         name: "Small Jar",
//         sku: "NIRWANA-BLACK-PEPPER-8OZ",
//         weight: "8 oz",
//         retailPrice: "7.99",
//         wholesalePrice: "6.20",
//       },
//       {
//         name: "Large Jar",
//         sku: "NIRWANA-BLACK-PEPPER-14OZ",
//         weight: "14 oz",
//         retailPrice: "12.99",
//         wholesalePrice: "10.25",
//       },
//     ],
//   },
//   {
//     name: "Nirwana Ground Nutmeg",
//     slug: "nirwana-ground-nutmeg",
//     sku: "NIRWANA-GROUND-NUTMEG",
//     brand: "Nirwana",
//     weight: null,
//     description:
//       "Ground nutmeg with warm sweet spice for baking, drinks, stews, sauces, porridges, and seasoning blends.",
//     retailPrice: "0.00",
//     wholesalePrice: "0.00",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXLu7oyUIXoR4QwdV2CKS7E1pDUexhzakf0IHJ",
//     ],
//     category: "Spices",
//     variants: [
//       {
//         name: "Small Jar",
//         sku: "NIRWANA-GROUND-NUTMEG-8OZ",
//         weight: "8 oz",
//         retailPrice: "8.99",
//         wholesalePrice: "6.95",
//       },
//       {
//         name: "Large Jar",
//         sku: "NIRWANA-GROUND-NUTMEG-14OZ",
//         weight: "14 oz",
//         retailPrice: "14.99",
//         wholesalePrice: "11.75",
//       },
//     ],
//   },
//   {
//     name: "Nirwana Thyme Leaves",
//     slug: "nirwana-thyme-leaves",
//     sku: "NIRWANA-THYME-LEAVES",
//     brand: "Nirwana",
//     weight: null,
//     description:
//       "Dried thyme leaves for seasoning soups, stews, meats, vegetables, beans, sauces, and rice dishes.",
//     retailPrice: "0.00",
//     wholesalePrice: "0.00",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXGOEvBJRHPDnWEiT6ajfJtKOvSuomzIVXwc93",
//     ],
//     category: "Spices",
//     variants: [
//       {
//         name: "Small Jar",
//         sku: "NIRWANA-THYME-LEAVES-2OZ",
//         weight: "2 oz",
//         retailPrice: "4.99",
//         wholesalePrice: "3.75",
//       },
//       {
//         name: "Large Jar",
//         sku: "NIRWANA-THYME-LEAVES-4OZ",
//         weight: "4 oz",
//         retailPrice: "7.99",
//         wholesalePrice: "6.20",
//       },
//     ],
//   },
//   {
//     name: "Nirwana Ground Garlic",
//     slug: "nirwana-ground-garlic",
//     sku: "NIRWANA-GROUND-GARLIC",
//     brand: "Nirwana",
//     weight: null,
//     description:
//       "Ground garlic powder for seasoning meats, stews, sauces, soups, marinades, vegetables, and rice dishes.",
//     retailPrice: "0.00",
//     wholesalePrice: "0.00",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXEePkwqzS94HP3TmOkrJIQY0txeCNVcgnBAWR",
//     ],
//     category: "Spices",
//     variants: [
//       {
//         name: "Small Jar",
//         sku: "NIRWANA-GROUND-GARLIC-8OZ",
//         weight: "8 oz",
//         retailPrice: "6.99",
//         wholesalePrice: "5.25",
//       },
//       {
//         name: "Large Jar",
//         sku: "NIRWANA-GROUND-GARLIC-14OZ",
//         weight: "14 oz",
//         retailPrice: "10.99",
//         wholesalePrice: "8.50",
//       },
//     ],
//   },
//   {
//     name: "Nirwana Whole Nutmeg",
//     slug: "nirwana-whole-nutmeg",
//     sku: "NIRWANA-WHOLE-NUTMEG",
//     brand: "Nirwana",
//     weight: null,
//     description:
//       "Whole nutmeg seeds with warm, sweet aroma for grating into drinks, porridges, stews, baked goods, and spice blends.",
//     retailPrice: "0.00",
//     wholesalePrice: "0.00",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXcEfASoZqxTLkfJbVaDEF6wd8mCrq39RzhUic",
//     ],
//     category: "Spices",
//     variants: [
//       {
//         name: "Small Jar",
//         sku: "NIRWANA-WHOLE-NUTMEG-5OZ",
//         weight: "5 oz",
//         retailPrice: "7.99",
//         wholesalePrice: "6.20",
//       },
//       {
//         name: "Large Jar",
//         sku: "NIRWANA-WHOLE-NUTMEG-19OZ",
//         weight: "19 oz",
//         retailPrice: "19.99",
//         wholesalePrice: "15.95",
//       },
//     ],
//   },
//   {
//     name: "Nirwana Cinnamon Sticks",
//     slug: "nirwana-cinnamon-sticks",
//     sku: "NIRWANA-CINNAMON-STICKS",
//     brand: "Nirwana",
//     weight: null,
//     description:
//       "Whole cinnamon sticks for teas, stews, rice dishes, desserts, marinades, and warm spice blends.",
//     retailPrice: "0.00",
//     wholesalePrice: "0.00",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXVgw3PVWSMuDmdnHeOcjLKfVkwIGr1YN2hlsS",
//     ],
//     category: "Spices",
//     variants: [
//       {
//         name: "Small Jar",
//         sku: "NIRWANA-CINNAMON-STICKS-4OZ",
//         weight: "4 oz",
//         retailPrice: "5.99",
//         wholesalePrice: "4.50",
//       },
//       {
//         name: "Large Jar",
//         sku: "NIRWANA-CINNAMON-STICKS-8OZ",
//         weight: "8 oz",
//         retailPrice: "9.99",
//         wholesalePrice: "7.75",
//       },
//     ],
//   },
//   {
//     name: "African Best Locust Beans Iru",
//     slug: "african-best-locust-beans-iru-6oz",
//     sku: "AFRICAN-BEST-LOCUST-BEANS-IRU-6OZ",
//     brand: "African Best",
//     weight: "6 oz",
//     description:
//       "African Best locust beans, also called iru, for adding savory fermented depth to soups, stews, sauces, and traditional dishes.",
//     retailPrice: "7.99",
//     wholesalePrice: "6.20",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNX3dXTmFMGp74HzRqQDLkTwCX0EUNeduW2c5tl",
//     ],
//     category: "Spices",
//   },
//   {
//     name: "African Best Ground Red Pepper",
//     slug: "african-best-ground-red-pepper",
//     sku: "AFRICAN-BEST-GROUND-RED-PEPPER",
//     brand: "African Best",
//     weight: "1 jar",
//     description:
//       "Ground red pepper for bringing heat and color to soups, stews, sauces, marinades, rice, and grilled dishes.",
//     retailPrice: "8.99",
//     wholesalePrice: "6.95",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXudJo3GjNCabhFUH1XVJiWOBK8ytTP3A70qdn",
//     ],
//     category: "Spices",
//   },
//   {
//     name: "African Best Suya Spice",
//     slug: "african-best-suya-spice",
//     sku: "AFRICAN-BEST-SUYA-SPICE",
//     brand: "African Best",
//     weight: "0.585 lb",
//     description:
//       "African Best suya spice blend with nutty pepper flavor for suya skewers, grilled meats, roasted chicken, and marinades.",
//     retailPrice: "7.02",
//     wholesalePrice: "5.60",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXUx1U7SK6zWU8smDVPqlov4bjwie3dKCO7tGL",
//     ],
//     category: "Spices",
//   },
//   {
//     name: "THX Foods Pure Ground Ginger",
//     slug: "thx-foods-pure-ground-ginger-8-46oz",
//     sku: "THX-FOODS-PURE-GROUND-GINGER-8-46OZ",
//     brand: "THX Foods",
//     weight: "8.46 oz",
//     description:
//       "Pure ground ginger for teas, marinades, stews, baked goods, spice blends, and everyday seasoning.",
//     retailPrice: "6.99",
//     wholesalePrice: "5.25",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXY9EpvkhwZPWs3SFLqN69dXt4ankvTHEyKQD1",
//     ],
//     category: "Spices",
//   },
//   {
//     name: "THX Foods African Fried Rice Seasoning",
//     slug: "thx-foods-african-fried-rice-seasoning-12-34oz",
//     sku: "THX-FOODS-AFRICAN-FRIED-RICE-SEASONING-12-34OZ",
//     brand: "THX Foods",
//     weight: "12.34 oz",
//     description:
//       "African fried rice seasoning blend for building savory flavor in fried rice, jollof-style rice, vegetables, and stir-fries.",
//     retailPrice: "7.99",
//     wholesalePrice: "6.20",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXgswiDsnob5x69mSJEQUfGjOz3TDPZqheIC7Y",
//     ],
//     category: "Spices",
//   },
//   {
//     name: "THX Foods Onion Powder",
//     slug: "thx-foods-onion-powder-10-55oz",
//     sku: "THX-FOODS-ONION-POWDER-10-55OZ",
//     brand: "THX Foods",
//     weight: "10.55 oz",
//     description:
//       "Onion powder for seasoning soups, stews, sauces, meats, vegetables, rice dishes, and dry rubs.",
//     retailPrice: "6.99",
//     wholesalePrice: "5.25",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXy04rmxGlH8fEcPQBWqpLDUbioN4JgzFMsYRS",
//     ],
//     category: "Spices",
//   },
//   {
//     name: "THX Foods Garlic Powder",
//     slug: "thx-foods-garlic-powder-10-58oz",
//     sku: "THX-FOODS-GARLIC-POWDER-10-58OZ",
//     brand: "THX Foods",
//     weight: "10.58 oz",
//     description:
//       "Garlic powder for savory depth in soups, stews, marinades, sauces, roasted meats, vegetables, and rice.",
//     retailPrice: "6.99",
//     wholesalePrice: "5.25",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNX3Qp86VMGp74HzRqQDLkTwCX0EUNeduW2c5tl",
//     ],
//     category: "Spices",
//   },
//   {
//     name: "THX Foods African Suya Spice Mix",
//     slug: "thx-foods-african-suya-spice-mix-12-8oz",
//     sku: "THX-FOODS-AFRICAN-SUYA-SPICE-MIX-12-8OZ",
//     brand: "THX Foods",
//     weight: "12.8 oz",
//     description:
//       "African suya spice mix for coating grilled beef, chicken, lamb, roasted vegetables, and skewers with warm peppery flavor.",
//     retailPrice: "8.99",
//     wholesalePrice: "6.95",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNX3UuKWEMGp74HzRqQDLkTwCX0EUNeduW2c5tl",
//     ],
//     category: "Spices",
//   },
//   {
//     name: "THX Foods African Thyme Leaves",
//     slug: "thx-foods-african-thyme-leaves-4-4oz",
//     sku: "THX-FOODS-AFRICAN-THYME-LEAVES-4-4OZ",
//     brand: "THX Foods",
//     weight: "4.4 oz",
//     description:
//       "African thyme leaves for seasoning stews, soups, rice, beans, poultry, meats, and vegetable dishes.",
//     retailPrice: "5.99",
//     wholesalePrice: "4.50",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXjuxp41FUYqgMeuyhvxCk8rOpNnTw70jzoHbP",
//     ],
//     category: "Spices",
//   },
//   {
//     name: "Grace Caribbean Traditions Oxtail Seasoning",
//     slug: "grace-caribbean-traditions-oxtail-seasoning-5-43oz",
//     sku: "GRACE-CARIBBEAN-OXTAIL-SEASONING-5-43OZ",
//     brand: "Grace",
//     weight: "5.43 oz",
//     description:
//       "Caribbean oxtail seasoning blend for oxtail, beef, stews, rice and peas, braises, and rich savory dishes.",
//     retailPrice: "4.99",
//     wholesalePrice: "3.75",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXHP3n9lEXneMU0Gh4lFug5jsq1YarJLdSkKxb",
//     ],
//     category: "Spices",
//   },
//   {
//     name: "Grace Caribbean Traditions Garlic Powder",
//     slug: "grace-caribbean-traditions-garlic-powder-4-06oz",
//     sku: "GRACE-CARIBBEAN-GARLIC-POWDER-4-06OZ",
//     brand: "Grace",
//     weight: "4.06 oz",
//     description:
//       "Caribbean-style garlic powder for soups, stews, meats, vegetables, sauces, rice, and everyday seasoning.",
//     retailPrice: "4.49",
//     wholesalePrice: "3.35",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXnWvCnIqw1ufzt2jEMbVTAiKYeSx75Rnw43Xh",
//     ],
//     category: "Spices",
//   },
//   {
//     name: "Grace Caribbean Traditions Ginger Garlic Pimento",
//     slug: "grace-caribbean-traditions-ginger-garlic-pimento-3-49oz",
//     sku: "GRACE-CARIBBEAN-GINGER-GARLIC-PIMENTO-3-49OZ",
//     brand: "Grace",
//     weight: "3.49 oz",
//     description:
//       "Ginger, garlic, and pimento seasoning blend for Caribbean stews, soups, meats, seafood, vegetables, and marinades.",
//     retailPrice: "4.49",
//     wholesalePrice: "3.35",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXn6z1tlw1ufzt2jEMbVTAiKYeSx75Rnw43Xh6",
//     ],
//     category: "Spices",
//   },
//   {
//     name: "Nirwana Jerk Seasoning",
//     slug: "nirwana-jerk-seasoning-8oz",
//     sku: "NIRWANA-JERK-SEASONING-8OZ",
//     brand: "Nirwana",
//     weight: "8 oz",
//     description:
//       "Jerk seasoning blend with allspice, garlic, thyme, pepper, and warm spices for chicken, meats, seafood, and vegetables.",
//     retailPrice: "7.99",
//     wholesalePrice: "6.20",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXr3uVVzQbDAGT40s36lLoNFnigX1fHUjk2ZRB",
//     ],
//     category: "Spices",
//   },
//   {
//     name: "Nkulenu's Hausa Koko Flour",
//     slug: "nkulenus-hausa-koko-flour-400g",
//     sku: "NKULENUS-HAUSA-KOKO-FLOUR-400G",
//     brand: "Nkulenu's",
//     weight: "400g",
//     description:
//       "Hausa koko flour for preparing spiced millet porridge and warm breakfast cereal.",
//     retailPrice: "6.99",
//     wholesalePrice: "5.25",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXf7bPcKgMZ4P7hyfznBC9pm5sYerKwijcRlTb",
//     ],
//     category: "Breakfast & Cereals",
//   },
//   {
//     name: "Julie's Agushie Whole Melon Seeds",
//     slug: "julies-agushie-whole-melon-seeds",
//     sku: "JULIES-AGUSHIE-WHOLE-MELON-SEEDS",
//     brand: "Julie's",
//     weight: "1 jar",
//     description:
//       "Whole agushie melon seeds for grinding into soups, stews, sauces, and other West African dishes.",
//     retailPrice: "9.99",
//     wholesalePrice: "7.75",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXTTuZFrxANvhWd6lkPZwVCGOImSK9YaDEXfgt",
//     ],
//     category: "Spices",
//   },
//   {
//     name: "African Best Brown Sugar",
//     slug: "african-best-brown-sugar",
//     sku: "AFRICAN-BEST-BROWN-SUGAR",
//     brand: "African Best",
//     weight: "1 container",
//     description:
//       "Coarse brown sugar crystals for sweetening drinks, porridges, baking, desserts, and pantry use.",
//     retailPrice: "7.50",
//     wholesalePrice: "6.00",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNX5mDxGbuEeOQdJY39B8l0cIFUCxvfVwMyLqZR",
//     ],
//     category: "Cooking Oils, Creams & Sauces",
//   },
//   {
//     name: "Onga Classic Bouillon Powder",
//     slug: "onga-classic-bouillon-powder-8g",
//     sku: "ONGA-CLASSIC-BOUILLON-POWDER-8G",
//     brand: "Onga",
//     weight: "8g",
//     description:
//       "Classic bouillon powder for seasoning soups, stews, sauces, rice, beans, and everyday savory dishes.",
//     retailPrice: "0.99",
//     wholesalePrice: "0.70",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXQeFMa8LaQmgxRsrwTlNvnbS3Bpfi7yGF50X9",
//     ],
//     category: "Spices",
//   },
//   {
//     name: "Remie Jollof Rice Seasoning Powder",
//     slug: "remie-jollof-rice-seasoning-powder-10g",
//     sku: "REMIE-JOLLOF-RICE-SEASONING-POWDER-10G",
//     brand: "Remie",
//     weight: "10g",
//     description:
//       "Jollof rice seasoning powder with tomato, onion, and savory spices for quick rice dishes.",
//     retailPrice: "0.99",
//     wholesalePrice: "0.70",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXzBVdVjtsZVwrj91KBMkORPI3zGoSpTLtmaQq",
//     ],
//     category: "Spices",
//   },
//   {
//     name: "SpiCity Fried Rice Seasoning Powder",
//     slug: "spicity-fried-rice-seasoning-powder",
//     sku: "SPICITY-FRIED-RICE-SEASONING-POWDER",
//     brand: "SpiCity",
//     weight: "10g",
//     description:
//       "Fried rice seasoning powder for adding savory vegetable-style flavor to rice and stir-fry dishes.",
//     retailPrice: "0.99",
//     wholesalePrice: "0.70",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXVumeUvSMuDmdnHeOcjLKfVkwIGr1YN2hlsSZ",
//     ],
//     category: "Spices",
//     variants: [
//       {
//         name: "Sachet",
//         weight: "10g",
//         sku: "SPICITY-FRIED-RICE-SEASONING-POWDER-10G",
//         retailPrice: "0.99",
//         wholesalePrice: "0.70",
//       },
//       {
//         name: "Pouch",
//         weight: "Large Pouch",
//         sku: "SPICITY-FRIED-RICE-SEASONING-POWDER-LARGE",
//         retailPrice: "3.99",
//         wholesalePrice: "2.95",
//       },
//     ],
//   },
//   {
//     name: "Aromate Spices Flavor Bouillon Powder",
//     slug: "aromate-spices-flavor-bouillon-powder-10g",
//     sku: "AROMATE-SPICES-FLAVOR-BOUILLON-POWDER-10G",
//     brand: "Aromate",
//     weight: "10g",
//     description:
//       "Spices flavor bouillon powder for seasoning soups, stews, rice, sauces, meat, and vegetables.",
//     retailPrice: "0.99",
//     wholesalePrice: "0.70",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXGaXpasRHPDnWEiT6ajfJtKOvSuomzIVXwc93",
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXjXueVeFUYqgMeuyhvxCk8rOpNnTw70jzoHbP",
//     ],
//     category: "Spices",
//   },
//   {
//     name: "Angel Brand Sorrel",
//     slug: "angel-brand-sorrel-1oz",
//     sku: "ANGEL-BRAND-SORREL-1OZ",
//     brand: "Angel Brand",
//     weight: "1 oz (28g)",
//     description:
//       "Dried sorrel hibiscus petals for brewing Caribbean-style sorrel drinks, teas, and spiced beverages.",
//     retailPrice: "2.99",
//     wholesalePrice: "2.10",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNX4I31lbKTVySKZ3UctQfNzslF5LWmJeGwgBkx",
//     ],
//     category: "Drinks",
//   },
//   {
//     name: "Amen Natural Sweet Plantain Chips",
//     slug: "amen-natural-sweet-plantain-chips-150g",
//     sku: "AMEN-NATURAL-SWEET-PLANTAIN-CHIPS-150G",
//     brand: "Amen",
//     weight: "5.29 oz (150g)",
//     description:
//       "Naturally sweet plantain chips with a crisp texture for snacking, lunchboxes, and party trays.",
//     retailPrice: "3.99",
//     wholesalePrice: "2.75",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXkxUI5UcQCHnKLdWJmD3Z1PFtAusMY7ToxSBE",
//     ],
//     category: "Snacks & Confectionery",
//   },
//   {
//     name: "Remie Fried Rice Seasoning Powder",
//     slug: "remie-fried-rice-seasoning-powder",
//     sku: "REMIE-FRIED-RICE-SEASONING-POWDER",
//     brand: "Remie",
//     weight: "10g",
//     description:
//       "Fried rice seasoning powder for adding savory herb and vegetable flavor to rice dishes.",
//     retailPrice: "0.99",
//     wholesalePrice: "0.70",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXxAr6ubljMJUv6gokLH2K3401lyX9VBtcseFD",
//     ],
//     category: "Spices",
//     variants: [
//       {
//         name: "Sachet",
//         weight: "10g",
//         sku: "REMIE-FRIED-RICE-SEASONING-POWDER-10G",
//         retailPrice: "0.99",
//         wholesalePrice: "0.70",
//       },
//       {
//         name: "Pouch",
//         weight: "50g",
//         sku: "REMIE-FRIED-RICE-SEASONING-POWDER-50G",
//         retailPrice: "2.99",
//         wholesalePrice: "2.20",
//       },
//     ],
//   },
//   {
//     name: "SpiCity Stew & Jollof Seasoning Powder",
//     slug: "spicity-stew-jollof-seasoning-powder-10g",
//     sku: "SPICITY-STEW-JOLLOF-SEASONING-POWDER-10G",
//     brand: "SpiCity",
//     weight: "10g",
//     description:
//       "Seasoning powder for stew and jollof with tomato, pepper, onion, garlic, and savory spices.",
//     retailPrice: "0.99",
//     wholesalePrice: "0.70",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXG6rJs06RHPDnWEiT6ajfJtKOvSuomzIVXwc9",
//     ],
//     category: "Spices",
//   },
//   {
//     name: "Kitchen Glory Chicken Flavor Seasoning Powder",
//     slug: "kitchen-glory-chicken-flavor-seasoning-powder-10g",
//     sku: "KITCHEN-GLORY-CHICKEN-FLAVOR-SEASONING-POWDER-10G",
//     brand: "Kitchen Glory",
//     weight: "10g",
//     description:
//       "Chicken flavor seasoning powder for soups, stews, rice, poultry, sauces, and marinades.",
//     retailPrice: "0.99",
//     wholesalePrice: "0.70",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXyUmlIbYGlH8fEcPQBWqpLDUbioN4JgzFMsYR",
//     ],
//     category: "Spices",
//   },
//   {
//     name: "Adja Tomato Flavour Seasoning",
//     slug: "adja-tomato-flavour-seasoning",
//     sku: "ADJA-TOMATO-FLAVOUR-SEASONING",
//     brand: "Adja",
//     weight: "60g",
//     description:
//       "Tomato flavour seasoning for adding onion, tomato, garlic, and pepper notes to soups, stews, and sauces.",
//     retailPrice: "2.99",
//     wholesalePrice: "2.20",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXTTFKZHxANvhWd6lkPZwVCGOImSK9YaDEXfgt",
//     ],
//     category: "Spices",
//   },
//   {
//     name: "Mr Chef Goat Meat Seasoning Powder",
//     slug: "mr-chef-goat-meat-seasoning-powder-10g",
//     sku: "MR-CHEF-GOAT-MEAT-SEASONING-POWDER-10G",
//     brand: "Mr Chef",
//     weight: "10g",
//     description:
//       "Goat meat seasoning powder for stews, pepper soup, grilled meats, braises, and marinades.",
//     retailPrice: "0.99",
//     wholesalePrice: "0.70",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXHsvSsukEXneMU0Gh4lFug5jsq1YarJLdSkKx",
//     ],
//     category: "Spices",
//   },
//   {
//     name: "Gino Peppe & Onion Tomato Seasoning Mix",
//     slug: "gino-peppe-onion-tomato-seasoning-mix",
//     sku: "GINO-PEPPE-ONION-TOMATO-SEASONING-MIX",
//     brand: "Gino",
//     weight: "Seasoning sachet",
//     description:
//       "Tomato seasoning mix with pepper and onion for soups, stews, jollof, sauces, and tomato bases.",
//     retailPrice: "2.49",
//     wholesalePrice: "1.80",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXJvBW3uyUIcDxWynlGbSNmh0zBPkXAHapLZfj",
//     ],
//     category: "Spices",
//   },
//   {
//     name: "Chef's Quality All Purpose Pan Spray",
//     slug: "chefs-quality-all-purpose-pan-spray-17oz",
//     sku: "CHEFS-QUALITY-ALL-PURPOSE-PAN-SPRAY-17OZ",
//     brand: "Chef's Quality",
//     weight: "17 oz",
//     description:
//       "All-purpose pan spray for coating baking pans, skillets, grills, and food prep surfaces.",
//     retailPrice: "5.99",
//     wholesalePrice: "4.50",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXns2IE3w1ufzt2jEMbVTAiKYeSx75Rnw43Xh6",
//     ],
//     category: "Cooking Oils, Creams & Sauces",
//   },
//   {
//     name: "African Best Topogi Beans",
//     slug: "african-best-topogi-beans",
//     sku: "AFRICAN-BEST-TOPOGI-BEANS",
//     brand: "African Best",
//     weight: "1 container",
//     description:
//       "West African topogi beans for soups, stews, porridges, bean dishes, and traditional cooking.",
//     retailPrice: "7.50",
//     wholesalePrice: "5.75",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXW53STLHvDXU3teM15G20Fg4pdAKNZElnSYsV",
//     ],
//     category: "Proteins",
//   },
//   {
//     name: "Unifresh Snails in Brine",
//     slug: "unifresh-snails-in-brine-400g",
//     sku: "UNIFRESH-SNAILS-IN-BRINE-400G",
//     brand: "Unifresh",
//     weight: "400g",
//     description:
//       "Shelled snails packed in brine for soups, stews, sauces, and West African-style dishes.",
//     retailPrice: "8.99",
//     wholesalePrice: "6.75",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXHSHcl0EXneMU0Gh4lFug5jsq1YarJLdSkKxb",
//     ],
//     category: "Proteins",
//   },
//   {
//     name: "Kings Bakery Kings Bread",
//     slug: "kings-bakery-kings-bread",
//     sku: "KINGS-BAKERY-KINGS-BREAD",
//     brand: "Kings Bakery",
//     weight: null,
//     description:
//       "Soft Kings Bakery sliced bread for sandwiches, breakfast toast, snacks, and everyday family meals.",
//     retailPrice: "0.00",
//     wholesalePrice: "0.00",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXBj3PuwVUFoSHVOz6iry4PwWQ5KdDR1BxGqnt",
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXYcwvfZhwZPWs3SFLqN69dXt4ankvTHEyKQD1",
//     ],
//     category: "Snacks & Confectionery",
//     variants: [
//       {
//         name: "Regular Loaf",
//         sku: "KINGS-BAKERY-KINGS-BREAD-45OZ",
//         weight: "45 oz",
//         retailPrice: "5.99",
//         wholesalePrice: "4.50",
//       },
//       {
//         name: "Large Loaf",
//         sku: "KINGS-BAKERY-KINGS-BREAD-80OZ",
//         weight: "80 oz",
//         retailPrice: "9.99",
//         wholesalePrice: "7.50",
//       },
//     ],
//   },
//   {
//     name: "Royal Enriched Quality Bread",
//     slug: "royal-enriched-quality-bread-2lb",
//     sku: "ROYAL-ENRICHED-QUALITY-BREAD-2LB",
//     brand: "Royal",
//     weight: "2 lb (908g)",
//     description:
//       "Enriched sliced bread with a soft texture for toast, sandwiches, breakfast plates, and quick snacks.",
//     retailPrice: "5.99",
//     wholesalePrice: "4.50",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXUyKagy6zWU8smDVPqlov4bjwie3dKCO7tGL2",
//     ],
//     category: "Snacks & Confectionery",
//   },
//   {
//     name: "Kings Bakery Butter Bread",
//     slug: "kings-bakery-butter-bread-2lb",
//     sku: "KINGS-BAKERY-BUTTER-BREAD-2LB",
//     brand: "Kings Bakery",
//     weight: "2 lb (907g)",
//     description:
//       "Rich butter bread loaf with a tender crumb for breakfast, sandwiches, toast, and bakery-style snacking.",
//     retailPrice: "6.99",
//     wholesalePrice: "5.25",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXJAXsKsyUIcDxWynlGbSNmh0zBPkXAHapLZfj",
//     ],
//     category: "Snacks & Confectionery",
//   },
//   {
//     name: "Lee Cream Crackers",
//     slug: "lee-cream-crackers-360g",
//     sku: "LEE-CREAM-CRACKERS-360G",
//     brand: "Lee",
//     weight: "360g (12.7 oz)",
//     description:
//       "Classic cream crackers with a crisp bite for tea, spreads, lunchboxes, and light snacking.",
//     retailPrice: "3.99",
//     wholesalePrice: "2.95",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXfYEjA1gMZ4P7hyfznBC9pm5sYerKwijcRlTb",
//     ],
//     category: "Snacks & Confectionery",
//   },
//   {
//     name: "Munchy's Vege Crackers",
//     slug: "munchys-vege-crackers-3-pack",
//     sku: "MUNCHYS-VEGE-CRACKERS-3PK",
//     brand: "Munchy's",
//     weight: "3 packs",
//     description:
//       "Savory vegetable crackers with herbs and sesame notes for crunchy snacking and sharing.",
//     retailPrice: "3.49",
//     wholesalePrice: "2.60",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXYZ9ekIhwZPWs3SFLqN69dXt4ankvTHEyKQD1",
//     ],
//     category: "Snacks & Confectionery",
//   },
//   {
//     name: "Cheez-It Original Crackers",
//     slug: "cheez-it-original-crackers-1-5oz",
//     sku: "CHEEZ-IT-ORIGINAL-CRACKERS-1-5OZ",
//     brand: "Cheez-It",
//     weight: "1.5 oz (42g)",
//     description:
//       "Original baked cheese crackers with a crisp texture and cheesy flavor in a grab-and-go snack pack.",
//     retailPrice: "1.49",
//     wholesalePrice: "1.05",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXR8fVwDUXB0Qm2LsIibVYAJxv6Et8kd3aUqn1",
//     ],
//     category: "Snacks & Confectionery",
//   },
//   {
//     name: "Sabor Nuestro Sweet Plantain Strips",
//     slug: "sabor-nuestro-sweet-plantain-strips-340g",
//     sku: "SABOR-NUESTRO-SWEET-PLANTAIN-STRIPS-340G",
//     brand: "Sabor Nuestro",
//     weight: "12 oz (340g)",
//     description:
//       "Sweet plantain strips with a crisp bite and naturally rich plantain flavor for snacking and sharing.",
//     retailPrice: "4.49",
//     wholesalePrice: "3.35",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXgLKkYRnob5x69mSJEQUfGjOz3TDPZqheIC7Y",
//     ],
//     category: "Snacks & Confectionery",
//   },
//   {
//     name: "Tasty Tom Jollof Mix",
//     slug: "tasty-tom-jollof-mix",
//     sku: "TASTY-TOM-JOLLOF-MIX",
//     brand: "Tasty Tom",
//     weight: "1 pouch",
//     description:
//       "Seasoned gravy base for preparing jollof rice with tomato, onion, garlic, ginger, and savory spices.",
//     retailPrice: "2.99",
//     wholesalePrice: "2.20",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXq1RqOHqd2MjsJFtYK70QIOpun8f64gceyki1",
//     ],
//     category: "Spices",
//   },
//   {
//     name: "Gonyek Crunchy Ripe-Spicy Plantain Chips",
//     slug: "gonyek-crunchy-ripe-spicy-plantain-chips-2-8oz",
//     sku: "GONYEK-RIPE-SPICY-PLANTAIN-CHIPS-2-8OZ",
//     brand: "Gonyek",
//     weight: "2.8 oz (80g)",
//     description:
//       "All-natural ripe plantain chips with a spicy crunch for bold, sweet-and-savory snacking.",
//     retailPrice: "2.49",
//     wholesalePrice: "1.85",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXQTgznkLaQmgxRsrwTlNvnbS3Bpfi7yGF50X9",
//     ],
//     category: "Snacks & Confectionery",
//   },
//   {
//     name: "La Fe Premium Soda Crackers",
//     slug: "la-fe-premium-soda-crackers-690g",
//     sku: "LA-FE-PREMIUM-SODA-CRACKERS-690G",
//     brand: "La Fe",
//     weight: "24.3 oz (690g)",
//     description:
//       "Premium soda crackers packed in individual sleeves for soups, spreads, tea, and everyday snacking.",
//     retailPrice: "8.99",
//     wholesalePrice: "6.75",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNX1zLeJkD5eMVEqQchlkgbBUPnuW7drwAvzOa3",
//     ],
//     category: "Snacks & Confectionery",
//   },
//   {
//     name: "Gonyek Vanilla Chin Chin",
//     slug: "gonyek-vanilla-chin-chin",
//     sku: "GONYEK-VANILLA-CHIN-CHIN",
//     brand: "Gonyek",
//     weight: null,
//     description:
//       "Crunchy vanilla chin chin pieces for a sweet West African snack, party trays, and sharing jars.",
//     retailPrice: "0.00",
//     wholesalePrice: "0.00",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXFZAsQ6aMcAOF9rZhD3yjVXvk21HY6iBUNEwm",
//     ],
//     category: "Snacks & Confectionery",
//     variants: [
//       {
//         name: "Small Jar",
//         sku: "GONYEK-VANILLA-CHIN-CHIN-16OZ",
//         weight: "16 oz (453g)",
//         retailPrice: "5.99",
//         wholesalePrice: "4.50",
//       },
//       {
//         name: "Medium Jar",
//         sku: "GONYEK-VANILLA-CHIN-CHIN-2LB",
//         weight: "2 lb (907g)",
//         retailPrice: "10.99",
//         wholesalePrice: "8.25",
//       },
//       {
//         name: "Large Jar",
//         sku: "GONYEK-VANILLA-CHIN-CHIN-3-5LB",
//         weight: "3.5 lb (1587g)",
//         retailPrice: "17.99",
//         wholesalePrice: "13.50",
//       },
//     ],
//   },
//   {
//     name: "LU Bakeri Coconut Biscuits",
//     slug: "lu-bakeri-coconut-biscuits-77g",
//     sku: "LU-BAKERI-COCONUT-BISCUITS-77G",
//     brand: "LU",
//     weight: "2.72 oz (77g)",
//     description:
//       "Coconut biscuits with a crisp texture and tropical coconut flavor for tea, lunchboxes, and snacking.",
//     retailPrice: "2.49",
//     wholesalePrice: "1.80",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNX4IJGiaKTVySKZ3UctQfNzslF5LWmJeGwgBkx",
//     ],
//     category: "Snacks & Confectionery",
//   },
//   {
//     name: "Walker's Shortbread Fingers",
//     slug: "walkers-shortbread-fingers-150g",
//     sku: "WALKERS-SHORTBREAD-FINGERS-150G",
//     brand: "Walker's",
//     weight: "5.3 oz (150g)",
//     description:
//       "Classic Scottish all-butter shortbread fingers with a rich, crumbly texture for tea and gifting.",
//     retailPrice: "4.99",
//     wholesalePrice: "3.75",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXFb9I3ZaMcAOF9rZhD3yjVXvk21HY6iBUNEwm",
//     ],
//     category: "Snacks & Confectionery",
//   },
//   {
//     name: "Mambo Milk Chocolate Bar",
//     slug: "mambo-milk-chocolate-bar",
//     sku: "MAMBO-MILK-CHOCOLATE-BAR",
//     brand: "Mambo",
//     weight: "1 bar",
//     description:
//       "Smooth and creamy milk chocolate bar from Chococam for a sweet grab-and-go treat.",
//     retailPrice: "1.99",
//     wholesalePrice: "1.40",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXu2JpnkjNCabhFUH1XVJiWOBK8ytTP3A70qdn",
//     ],
//     category: "Snacks & Confectionery",
//   },
//   {
//     name: "McVitie's Digestives The Original",
//     slug: "mcvities-digestives-the-original-400g",
//     sku: "MCVITIES-DIGESTIVES-ORIGINAL-400G",
//     brand: "McVitie's",
//     weight: "400g",
//     description:
//       "Original wheat digestive biscuits with a crisp, lightly sweet bite and a source of fibre.",
//     retailPrice: "5.49",
//     wholesalePrice: "4.10",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXGt3WgNRHPDnWEiT6ajfJtKOvSuomzIVXwc93",
//     ],
//     category: "Snacks & Confectionery",
//   },
//   {
//     name: "Ovaltine Cookies Galletas",
//     slug: "ovaltine-cookies-galletas",
//     sku: "OVALTINE-COOKIES-GALLETAS",
//     brand: "Ovaltine",
//     weight: null,
//     description:
//       "Ovaltine malted barley cookies with milk flavor in convenient snack packs for school, work, and tea.",
//     retailPrice: "0.00",
//     wholesalePrice: "0.00",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXR5WvteUXB0Qm2LsIibVYAJxv6Et8kd3aUqn1",
//     ],
//     category: "Snacks & Confectionery",
//     variants: [
//       {
//         name: "Snack Packs",
//         sku: "OVALTINE-COOKIES-GALLETAS-4PK",
//         weight: "4 snack packs",
//         retailPrice: "2.99",
//         wholesalePrice: "2.20",
//       },
//       {
//         name: "Large Pack",
//         sku: "OVALTINE-COOKIES-GALLETAS-150G",
//         weight: "150g",
//         retailPrice: "3.49",
//         wholesalePrice: "2.60",
//       },
//     ],
//   },
//   {
//     name: "Ulker Tea Biscuit",
//     slug: "ulker-tea-biscuit-400g",
//     sku: "ULKER-TEA-BISCUIT-400G",
//     brand: "Ulker",
//     weight: "14.1 oz (400g)",
//     description:
//       "Classic tea biscuits with a mild, crisp sweetness for hot drinks, desserts, and family snacking.",
//     retailPrice: "4.49",
//     wholesalePrice: "3.35",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXSiLMJzfdVulCEw3DZ4MYR9m6LfIat8iFQobW",
//     ],
//     category: "Snacks & Confectionery",
//   },
//   {
//     name: "Kivo 4 in 1 Gari Soaking Mix",
//     slug: "kivo-4-in-1-gari-soaking-mix",
//     sku: "KIVO-4-IN-1-GARI-SOAKING-MIX",
//     brand: "Kivo",
//     weight: "Single pack",
//     description:
//       "Ready gari soaking mix with creamer, roasted groundnut, and sugar for a quick chilled snack.",
//     retailPrice: "2.49",
//     wholesalePrice: "1.75",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXT1PAc8IxANvhWd6lkPZwVCGOImSK9YaDEXfg",
//     ],
//     category: "Snacks & Confectionery",
//   },
//   {
//     name: "Gino Asun Flavoured Seasoning Cubes",
//     slug: "gino-asun-flavoured-seasoning-cubes-48g",
//     sku: "GINO-ASUN-FLAVOURED-SEASONING-CUBES-48G",
//     brand: "Gino",
//     weight: "48g",
//     description:
//       "Asun flavoured seasoning cubes with herbs for goat meat, spicy sauces, stews, soups, and marinades.",
//     retailPrice: "2.99",
//     wholesalePrice: "2.20",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXOcslqAbQYH4d3gWkzAvUyumf5Xsq1r8GD2nS",
//     ],
//     category: "Spices",
//   },
//   {
//     name: "Morton Iodized Salt Food Service",
//     slug: "morton-iodized-salt-food-service-26oz",
//     sku: "MORTON-IODIZED-SALT-FOOD-SERVICE-26OZ",
//     brand: "Morton",
//     weight: "26 oz (737g)",
//     description:
//       "Food service iodized salt for cooking, baking, seasoning, brining, and everyday pantry use.",
//     retailPrice: "2.99",
//     wholesalePrice: "2.10",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXfwv5VZ6gMZ4P7hyfznBC9pm5sYerKwijcRlT",
//     ],
//     category: "Spices",
//   },
// ];

// const products: SeedProduct[] = [
//   {
//     name: "Jacob's Cream Crackers",
//     slug: "jacobs-cream-crackers-200g",
//     sku: "JACOBS-CREAM-CRACKERS-200G",
//     brand: "Jacob's",
//     weight: "200g",
//     description:
//       "Light, crispy cream crackers with no added sugar, great with spreads, tea, soups, and snack plates.",
//     retailPrice: "3.49",
//     wholesalePrice: "2.60",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXJRUZdR7yUIcDxWynlGbSNmh0zBPkXAHapLZf",
//     ],
//     category: "Snacks, Breads & Confectionery",
//   },
//   {
//     name: "McVitie's Digestives Dark Chocolate",
//     slug: "mcvities-digestives-dark-chocolate-300g",
//     sku: "MCVITIES-DIGESTIVES-DARK-CHOCOLATE-300G",
//     brand: "McVitie's",
//     weight: "10.5 oz (300g)",
//     description:
//       "Wheat digestive biscuits with a dark chocolate flavored coating for tea, dessert trays, and sweet snacking.",
//     retailPrice: "5.99",
//     wholesalePrice: "4.50",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXqDSkz7Hqd2MjsJFtYK70QIOpun8f64gceyki",
//     ],
//     category: "Snacks, Breads & Confectionery",
//   },
//   {
//     name: "McVitie's Butter Shortbread",
//     slug: "mcvities-butter-shortbread-200g",
//     sku: "MCVITIES-BUTTER-SHORTBREAD-200G",
//     brand: "McVitie's",
//     weight: "200g",
//     description:
//       "Scottish heritage butter shortbread fingers with a rich, crumbly texture for tea and sharing.",
//     retailPrice: "4.99",
//     wholesalePrice: "3.75",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXUxm4dfM6zWU8smDVPqlov4bjwie3dKCO7tGL",
//     ],
//     category: "Snacks, Breads & Confectionery",
//   },
//   {
//     name: "McVitie's Digestives The Original",
//     slug: "mcvities-digestives-the-original-355g",
//     sku: "MCVITIES-DIGESTIVES-ORIGINAL-355G",
//     brand: "McVitie's",
//     weight: "355g",
//     description:
//       "Original wheat digestive biscuits made with wheat flour and wholemeal for a classic crisp biscuit snack.",
//     retailPrice: "4.99",
//     wholesalePrice: "3.75",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXdYplXujtw1fXiQBl8ukhZS63beKEaYUgxJyq",
//     ],
//     category: "Snacks, Breads & Confectionery",
//   },
//   {
//     name: "Butturkist Ginger Cookies",
//     slug: "butturkist-ginger-cookies-150g",
//     sku: "BUTTURKIST-GINGER-COOKIES-150G",
//     brand: "Butturkist",
//     weight: "5.3 oz (150g)",
//     description:
//       "Ginger flavored cookies with a crisp bite for tea, coffee, lunchboxes, and everyday sweet snacking.",
//     retailPrice: "2.49",
//     wholesalePrice: "1.80",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXCGtDEXLJGDNTIJPmq7LiCuRpwSEMecbKWQ58",
//     ],
//     category: "Snacks, Breads & Confectionery",
//   },
//   {
//     name: "Butturkist Butter Cookies",
//     slug: "butturkist-butter-cookies-150g",
//     sku: "BUTTURKIST-BUTTER-COOKIES-150G",
//     brand: "Butturkist",
//     weight: "5.3 oz (150g)",
//     description:
//       "Butter flavored cookies with a light crunch and sweet bakery-style taste for tea and snack time.",
//     retailPrice: "2.49",
//     wholesalePrice: "1.80",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXgDSBKonob5x69mSJEQUfGjOz3TDPZqheIC7Y",
//     ],
//     category: "Snacks, Breads & Confectionery",
//   },
//   {
//     name: "McVitie's Ginger Nuts",
//     slug: "mcvities-ginger-nuts",
//     sku: "MCVITIES-GINGER-NUTS",
//     brand: "McVitie's",
//     weight: "1 pack",
//     description:
//       "Fiery ginger biscuits with a crunchy texture and warm spice flavor for tea, coffee, and snacking.",
//     retailPrice: "4.49",
//     wholesalePrice: "3.35",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNX1ZeL3vD5eMVEqQchlkgbBUPnuW7drwAvzOa3",
//     ],
//     category: "Snacks, Breads & Confectionery",
//   },
//   {
//     name: "LU Gala Egg Biscuits",
//     slug: "lu-gala-egg-biscuits",
//     sku: "LU-GALA-EGG-BISCUITS",
//     brand: "LU",
//     weight: "1 box",
//     description:
//       "Golden egg biscuits with a crisp, lightly sweet bite for tea, breakfast plates, and family snacking.",
//     retailPrice: "2.99",
//     wholesalePrice: "2.20",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXutUfTGjNCabhFUH1XVJiWOBK8ytTP3A70qdn",
//     ],
//     category: "Snacks, Breads & Confectionery",
//   },
//   {
//     name: "Artiach Chiquilin 0% Added Sugars Biscuits",
//     slug: "artiach-chiquilin-zero-added-sugars-biscuits",
//     sku: "ARTIACH-CHIQUILIN-ZERO-ADDED-SUGARS",
//     brand: "Artiach",
//     weight: "1 pack",
//     description:
//       "Chiquilin biscuits with 0% added sugars, made for a crisp biscuit snack with classic Spanish-style flavor.",
//     retailPrice: "3.99",
//     wholesalePrice: "2.95",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNX5wnji6uEeOQdJY39B8l0cIFUCxvfVwMyLqZR",
//     ],
//     category: "Snacks, Breads & Confectionery",
//   },
//   {
//     name: "McVitie's Digestives The Original",
//     slug: "mcvities-digestives-the-original-400g",
//     sku: "MCVITIES-DIGESTIVES-ORIGINAL-400G",
//     brand: "McVitie's",
//     weight: "400g",
//     description:
//       "Original wheat digestive biscuits with a crisp, lightly sweet bite and a source of fibre.",
//     retailPrice: "5.49",
//     wholesalePrice: "4.10",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXMuaReGCLMT5qyt9IA2aO3mxFvdXuncP7HriS",
//     ],
//     category: "Snacks, Breads & Confectionery",
//   },
//   {
//     name: "Jacob's Krim Kraker Vitamin & Mineral",
//     slug: "jacobs-krim-kraker-vitamin-mineral-14-pack",
//     sku: "JACOBS-KRIM-KRAKER-VITAMIN-MINERAL-14PK",
//     brand: "Jacob's",
//     weight: "14 packs",
//     description:
//       "Nutritious wheat cream crackers with vitamins and minerals in convenient packs for snacking and sharing.",
//     retailPrice: "6.99",
//     wholesalePrice: "5.25",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXOPJZZVbQYH4d3gWkzAvUyumf5Xsq1r8GD2nS",
//     ],
//     category: "Snacks, Breads & Confectionery",
//   },
//   {
//     name: "Oxford Sweetened Cabin Biscuits",
//     slug: "oxford-sweetened-cabin-biscuits",
//     sku: "OXFORD-SWEETENED-CABIN-BISCUITS",
//     brand: "Oxford",
//     weight: "Fresh pack",
//     description:
//       "Sweetened cabin biscuits in a fresh pack for tea, lunchboxes, light snacks, and family pantry stocking.",
//     retailPrice: "7.99",
//     wholesalePrice: "5.99",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXT3JLMRxANvhWd6lkPZwVCGOImSK9YaDEXfgt",
//     ],
//     category: "Snacks, Breads & Confectionery",
//   },
//   {
//     name: "Ulker Tea Biscuit",
//     slug: "ulker-tea-biscuit-1kg",
//     sku: "ULKER-TEA-BISCUIT-1KG",
//     brand: "Ulker",
//     weight: "2.2 lb (1kg)",
//     description:
//       "Large family pack of classic tea biscuits with a mild sweetness for hot drinks, desserts, and sharing.",
//     retailPrice: "8.99",
//     wholesalePrice: "6.75",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXXccHwI5pjE47Cu1KbTeNyMZYcGLSPAn68Wa2",
//     ],
//     category: "Snacks, Breads & Confectionery",
//   },
//   {
//     name: "Weetabix Wholegrain Wheat Biscuits",
//     slug: "weetabix-wholegrain-wheat-biscuits-24-pack",
//     sku: "WEETABIX-WHOLEGRAIN-WHEAT-BISCUITS-24PK",
//     brand: "Weetabix",
//     weight: "24 biscuits",
//     description:
//       "Wholegrain wheat breakfast biscuits packed with fibre and vitamin B1 for breakfast or a hearty snack.",
//     retailPrice: "4.99",
//     wholesalePrice: "3.69",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXUrkyRq6zWU8smDVPqlov4bjwie3dKCO7tGL2",
//     ],
//     category: "Snacks, Breads & Confectionery",
//   },
//   {
//     name: "La Fe Premium Saltine Crackers",
//     slug: "la-fe-premium-saltine-crackers-690g",
//     sku: "LA-FE-PREMIUM-SALTINE-CRACKERS-690G",
//     brand: "La Fe",
//     weight: "24.3 oz (690g)",
//     description:
//       "Premium saltine crackers packed in individual sleeves for soups, spreads, tea, and everyday snacking.",
//     retailPrice: "8.99",
//     wholesalePrice: "6.75",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXmWYCuRdsZwLcdWBKmS3az5oxMIHgQAi4RnD1",
//     ],
//     category: "Snacks, Breads & Confectionery",
//   },
//   {
//     name: "African Best Donkwa",
//     slug: "african-best-donkwa",
//     sku: "AFRICAN-BEST-DONKWA",
//     brand: "African Best",
//     weight: "1 pouch",
//     description:
//       "Traditional donkwa peanut snack made with groundnut, chili pepper, sugar, ground cloves, peanut oil, and spices.",
//     retailPrice: "5.99",
//     wholesalePrice: "4.50",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXXjMgK1U5pjE47Cu1KbTeNyMZYcGLSPAn68Wa",
//     ],
//     category: "Snacks, Breads & Confectionery",
//   },
//   {
//     name: "London Biscuits Digestives",
//     slug: "london-biscuits-digestives-400g",
//     sku: "LONDON-BISCUITS-DIGESTIVES-400G",
//     brand: "London Biscuits",
//     weight: "400g",
//     description:
//       "Classic digestives from London Biscuits with a crisp wheat biscuit texture for tea and snacking.",
//     retailPrice: "4.49",
//     wholesalePrice: "3.35",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXMk567bCLMT5qyt9IA2aO3mxFvdXuncP7HriS",
//     ],
//     category: "Snacks, Breads & Confectionery",
//   },
//   {
//     name: "LU Candi Original Caramelized Biscuits",
//     slug: "lu-candi-original-caramelized-biscuits-104g",
//     sku: "LU-CANDI-ORIGINAL-CARAMELIZED-BISCUITS-104G",
//     brand: "LU",
//     weight: "3.68 oz (104.4g)",
//     description:
//       "Original caramelized biscuits with a crisp texture and warm caramel flavor for coffee, tea, and desserts.",
//     retailPrice: "2.49",
//     wholesalePrice: "1.80",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXsXnfMb8BPgeWNAZFXca6QzOIrykMCwxfuYho",
//     ],
//     category: "Snacks, Breads & Confectionery",
//   },
//   {
//     name: "Jacob's The Selection Crackers",
//     slug: "jacobs-the-selection-crackers-900g",
//     sku: "JACOBS-THE-SELECTION-CRACKERS-900G",
//     brand: "Jacob's",
//     weight: "900g",
//     description:
//       "Assorted cracker selection with eight varieties made for sharing, cheese boards, parties, and snack trays.",
//     retailPrice: "14.99",
//     wholesalePrice: "11.25",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXRT6nrfJUXB0Qm2LsIibVYAJxv6Et8kd3aUqn",
//     ],
//     category: "Snacks, Breads & Confectionery",
//   },
//   {
//     name: "African Best Crunchy Kulikuli Peanut Cake",
//     slug: "african-best-crunchy-kulikuli-peanut-cake",
//     sku: "AFRICAN-BEST-CRUNCHY-KULIKULI-PEANUT-CAKE",
//     brand: "African Best",
//     weight: "1 jar",
//     description:
//       "Crunchy kulikuli peanut cake with bold roasted peanut flavor for traditional snacking and sharing.",
//     retailPrice: "6.99",
//     wholesalePrice: "5.25",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXQSxnmXLaQmgxRsrwTlNvnbS3Bpfi7yGF50X9",
//     ],
//     category: "Snacks, Breads & Confectionery",
//   },
//   {
//     name: "Ulker Finger Biscuits",
//     slug: "ulker-finger-biscuits-5-pack",
//     sku: "ULKER-FINGER-BISCUITS-5PK",
//     brand: "Ulker",
//     weight: "5 packs",
//     description:
//       "Classic finger tea biscuits in a multipack, made for dipping, sharing, and everyday pantry snacking.",
//     retailPrice: "4.99",
//     wholesalePrice: "3.75",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXrVY131QbDAGT40s36lLoNFnigX1fHUjk2ZRB",
//     ],
//     category: "Snacks, Breads & Confectionery",
//   },
//   {
//     name: "LU Prince Chocolate Sandwich Biscuits",
//     slug: "lu-prince-chocolate-sandwich-biscuits",
//     sku: "LU-PRINCE-CHOCOLATE-SANDWICH-BISCUITS",
//     brand: "LU",
//     weight: "1 box",
//     description:
//       "Chocolate cream sandwich biscuits with crisp golden cookies and a smooth cocoa filling.",
//     retailPrice: "3.49",
//     wholesalePrice: "2.60",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXsRKG048BPgeWNAZFXca6QzOIrykMCwxfuYho",
//     ],
//     category: "Snacks, Breads & Confectionery",
//   },
//   {
//     name: "Imperial Nuts Salted Cashew Halves & Pieces",
//     slug: "imperial-nuts-salted-cashew-halves-pieces-7oz",
//     sku: "IMPERIAL-NUTS-SALTED-CASHEWS-7OZ",
//     brand: "Imperial Nuts",
//     weight: "7 oz (198g)",
//     description:
//       "Salted cashew halves and pieces with plant-based protein in a resealable gluten-free snack cup.",
//     retailPrice: "6.99",
//     wholesalePrice: "5.25",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXj94CWwmFUYqgMeuyhvxCk8rOpNnTw70jzoHb",
//     ],
//     category: "Snacks, Breads & Confectionery",
//   },
//   {
//     name: "NutriSnax Oats Digestive Biscuits",
//     slug: "nutrisnax-oats-digestive-biscuits",
//     sku: "NUTRISNAX-OATS-DIGESTIVE-BISCUITS",
//     brand: "NutriSnax",
//     weight: "1 box",
//     description:
//       "High-fibre oats digestive biscuits with a crisp bite for tea, breakfast, and light snacking.",
//     retailPrice: "1.99",
//     wholesalePrice: "1.40",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXxI9kyKljMJUv6gokLH2K3401lyX9VBtcseFD",
//     ],
//     category: "Snacks, Breads & Confectionery",
//   },
//   {
//     name: "Yale Double-Decker Vanilla Sandwich Biscuits",
//     slug: "yale-double-decker-vanilla-sandwich-biscuits",
//     sku: "YALE-DOUBLE-DECKER-VANILLA-SANDWICH-BISCUITS",
//     brand: "Yale",
//     weight: "1 pack",
//     description:
//       "Vanilla sandwich biscuits with a double-decker cookie style for quick sweet snacks and lunchboxes.",
//     retailPrice: "0.99",
//     wholesalePrice: "0.70",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXSmQBHVfdVulCEw3DZ4MYR9m6LfIat8iFQobW",
//     ],
//     category: "Snacks, Breads & Confectionery",
//   },
//   {
//     name: "Cuetara Palmeritas Crisp Palm Leaf Cookies",
//     slug: "cuetara-palmeritas-crisp-palm-leaf-cookies-195g",
//     sku: "CUETARA-PALMERITAS-195G",
//     brand: "Cuetara",
//     weight: "6.9 oz (195g)",
//     description:
//       "Crisp palm leaf cookies with a flaky, lightly sweet texture and a 15% bonus pack.",
//     retailPrice: "3.99",
//     wholesalePrice: "2.95",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXCDsb6RJGDNTIJPmq7LiCuRpwSEMecbKWQ58O",
//     ],
//     category: "Snacks, Breads & Confectionery",
//   },
//   {
//     name: "Bocel Aviva Soda Crackers",
//     slug: "bocel-aviva-soda-crackers-4-pack",
//     sku: "BOCEL-AVIVA-SODA-CRACKERS-4PK",
//     brand: "Bocel",
//     weight: "4 crackers",
//     description:
//       "Light soda crackers packed for simple snacking, soups, spreads, and quick pantry use.",
//     retailPrice: "1.49",
//     wholesalePrice: "1.05",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNX8LmcKcBtpWNA2JcSXHGh9I8YufnPOUkVgz1B",
//     ],
//     category: "Snacks, Breads & Confectionery",
//   },
//   {
//     name: "Famous Amos Chocolate Chip Cookies",
//     slug: "famous-amos-chocolate-chip-cookies",
//     sku: "FAMOUS-AMOS-CHOCOLATE-CHIP-COOKIES",
//     brand: "Famous Amos",
//     weight: "1 bag",
//     description:
//       "Bite-size chocolate chip cookies with rich chocolate pieces and a crunchy cookie texture.",
//     retailPrice: "2.49",
//     wholesalePrice: "1.80",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNX5UvcPUuEeOQdJY39B8l0cIFUCxvfVwMyLqZR",
//     ],
//     category: "Snacks, Breads & Confectionery",
//   },
//   {
//     name: "McVitie's Saklikoy Hazelnut Cream Biscuits",
//     slug: "mcvities-saklikoy-hazelnut-cream-biscuits",
//     sku: "MCVITIES-SAKLIKOY-HAZELNUT-CREAM-BISCUITS",
//     brand: "McVitie's",
//     weight: "1 pack",
//     description:
//       "Wheat biscuit sandwiches filled with hazelnut cream for a sweet, crisp Turkish-style snack.",
//     retailPrice: "2.99",
//     wholesalePrice: "2.20",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXCB8XTIJGDNTIJPmq7LiCuRpwSEMecbKWQ58O",
//     ],
//     category: "Snacks, Breads & Confectionery",
//   },
//   {
//     name: "Nirwana Ginger Candy Coconut Flavour",
//     slug: "nirwana-ginger-candy-coconut-flavour-125g",
//     sku: "NIRWANA-GINGER-CANDY-COCONUT-125G",
//     brand: "Nirwana",
//     weight: "125g (4.02 oz)",
//     description:
//       "Individually wrapped ginger candies with coconut flavour for a sweet, warming treat.",
//     retailPrice: "3.49",
//     wholesalePrice: "2.60",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXRTYYT4LUXB0Qm2LsIibVYAJxv6Et8kd3aUqn",
//     ],
//     category: "Snacks, Breads & Confectionery",
//   },
//   {
//     name: "Nirwana Chewy Ginger Candy Original",
//     slug: "nirwana-chewy-ginger-candy-original-125g",
//     sku: "NIRWANA-CHEWY-GINGER-CANDY-ORIGINAL-125G",
//     brand: "Nirwana",
//     weight: "125g (4.41 oz)",
//     description:
//       "Chewy original ginger candy made with real ginger and packed in individually wrapped pieces.",
//     retailPrice: "3.49",
//     wholesalePrice: "2.60",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXMylFieECLMT5qyt9IA2aO3mxFvdXuncP7Hri",
//     ],
//     category: "Snacks, Breads & Confectionery",
//   },
//   {
//     name: "African Best Chin Chin Coconut Flavour",
//     slug: "african-best-chin-chin-coconut-flavour-950g",
//     sku: "AFRICAN-BEST-CHIN-CHIN-COCONUT-950G",
//     brand: "African Best",
//     weight: "950g",
//     description:
//       "Crunchy coconut-flavoured chin chin pieces in a large tub for sharing and traditional snacking.",
//     retailPrice: "10.99",
//     wholesalePrice: "8.25",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXBsCsyMVUFoSHVOz6iry4PwWQ5KdDR1BxGqnt",
//     ],
//     category: "Snacks, Breads & Confectionery",
//   },
//   {
//     name: "Africa's Finest Chin Chin",
//     slug: "africas-finest-chin-chin",
//     sku: "AFRICAS-FINEST-CHIN-CHIN",
//     brand: "Africa's Finest",
//     weight: "Assorted tubs",
//     description:
//       "Traditional African chin chin with a crisp fried texture, packed in convenient tubs for pantry snacking.",
//     retailPrice: "5.99",
//     wholesalePrice: "4.50",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXwUxjBl2G9mNXOBKC65Pa7porlUtgM1SzkLeH",
//     ],
//     category: "Snacks, Breads & Confectionery",
//     variants: [
//       {
//         name: "Small Tub",
//         sku: "AFRICAS-FINEST-CHIN-CHIN-SMALL-TUB",
//         weight: "Small tub",
//         retailPrice: "5.99",
//         wholesalePrice: "4.50",
//       },
//       {
//         name: "Large Tub",
//         sku: "AFRICAS-FINEST-CHIN-CHIN-LARGE-TUB",
//         weight: "Large tub",
//         retailPrice: "10.99",
//         wholesalePrice: "8.25",
//       },
//     ],
//   },
//   {
//     name: "Martha White Chocolate Chocolate Chip Muffin Mix",
//     slug: "martha-white-chocolate-chocolate-chip-muffin-mix-7-4oz",
//     sku: "MARTHA-WHITE-CHOCOLATE-CHOCOLATE-CHIP-MUFFIN-MIX-7-4OZ",
//     brand: "Martha White",
//     weight: "7.4 oz (209g)",
//     description:
//       "Chocolate chocolate chip muffin mix with real chocolate chips; just add milk for quick baking.",
//     retailPrice: "2.49",
//     wholesalePrice: "1.80",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXCZLzMoJGDNTIJPmq7LiCuRpwSEMecbKWQ58O",
//     ],
//     category: "Snacks, Breads & Confectionery",
//   },
//   {
//     name: "LU Prince Chocolate Sandwich Biscuits Single Pack",
//     slug: "lu-prince-chocolate-sandwich-biscuits-single-pack",
//     sku: "LU-PRINCE-CHOCOLATE-SANDWICH-BISCUITS-SINGLE",
//     brand: "LU",
//     weight: "1 pack",
//     description:
//       "Single pack of Prince chocolate sandwich biscuits with cocoa cream between crisp biscuits.",
//     retailPrice: "1.49",
//     wholesalePrice: "1.05",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNX6lSFY5TIdoa8APqmKptfzCilvc2yUEW9k3bD",
//     ],
//     category: "Snacks, Breads & Confectionery",
//   },
//   {
//     name: "Kings Bakery Butter Rolls",
//     slug: "kings-bakery-butter-rolls-24oz",
//     sku: "KINGS-BAKERY-BUTTER-ROLLS-24OZ",
//     brand: "Kings Bakery",
//     weight: "24 oz (1.5 lb)",
//     description:
//       "Soft buttery bread rolls from Kings Bakery, packed for breakfast, sandwiches, and family meals.",
//     retailPrice: "5.99",
//     wholesalePrice: "4.50",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXtzI3wCphYx5l2n4dkqFK1Ois7TyRZe69ubVI",
//     ],
//     category: "Snacks, Breads & Confectionery",
//   },
//   {
//     name: "Purerise Wholewheat Bread",
//     slug: "purerise-wholewheat-bread-24-6oz",
//     sku: "PURERISE-WHOLEWHEAT-BREAD-24-6OZ",
//     brand: "Purerise",
//     weight: "24.6 oz (1.5 lb)",
//     description:
//       "Sliced wholewheat bread with a hearty texture for sandwiches, toast, and everyday breakfast.",
//     retailPrice: "5.99",
//     wholesalePrice: "4.50",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXBIhuelVUFoSHVOz6iry4PwWQ5KdDR1BxGqnt",
//     ],
//     category: "Snacks, Breads & Confectionery",
//   },
//   {
//     name: "Flows Toasted Corn & Peanut Mix",
//     slug: "flows-toasted-corn-peanut-mix",
//     sku: "FLOWS-TOASTED-CORN-PEANUT-MIX",
//     brand: "Flows",
//     weight: "1 pack",
//     description:
//       "Toasted corn and peanut mix from Ghana with a crunchy texture and savory snack flavor.",
//     retailPrice: "2.49",
//     wholesalePrice: "1.80",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXMy6rM4LCLMT5qyt9IA2aO3mxFvdXuncP7Hri",
//     ],
//     category: "Snacks, Breads & Confectionery",
//   },
//   {
//     name: "James Oat Original Biscuits",
//     slug: "james-oat-original-biscuits-700g",
//     sku: "JAMES-OAT-ORIGINAL-BISCUITS-700G",
//     brand: "James",
//     weight: "700g",
//     description:
//       "Oat original biscuits in a large tin, made for tea, breakfast, and family biscuit tins.",
//     retailPrice: "8.99",
//     wholesalePrice: "6.75",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXJRUeQB9yUIcDxWynlGbSNmh0zBPkXAHapLZf",
//     ],
//     category: "Snacks, Breads & Confectionery",
//   },
//   {
//     name: "Royal Menthol Toffee Tough Candy",
//     slug: "royal-menthol-toffee-tough-candy-400g",
//     sku: "ROYAL-MENTHOL-TOFFEE-TOUGH-CANDY-400G",
//     brand: "Royal",
//     weight: "400g",
//     description:
//       "Individually wrapped menthol toffee tough candy in a bulk bag for sharing and counter sales.",
//     retailPrice: "5.99",
//     wholesalePrice: "4.50",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNX8XlnufBtpWNA2JcSXHGh9I8YufnPOUkVgz1B",
//     ],
//     category: "Snacks, Breads & Confectionery",
//   },
//   {
//     name: "Tasty Foods Njangsang Akpi",
//     slug: "tasty-foods-njangsang-akpi-85g",
//     sku: "TASTY-FOODS-NJANGSANG-AKPI-85G",
//     brand: "Tasty Foods",
//     weight: "85g (3 oz)",
//     description:
//       "Natural njangsang akpi seeds used for traditional soups, stews, sauces, and African cooking.",
//     retailPrice: "3.99",
//     wholesalePrice: "2.95",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXUN8ax56zWU8smDVPqlov4bjwie3dKCO7tGL2",
//     ],
//     category: "Snacks, Breads & Confectionery",
//   },
//   {
//     name: "Gonyek Crispy Ripe Salted Plantain Chips",
//     slug: "gonyek-crispy-ripe-salted-plantain-chips-2-3oz",
//     sku: "GONYEK-CRISPY-RIPE-SALTED-PLANTAIN-CHIPS-2-3OZ",
//     brand: "Gonyek",
//     weight: "2.3 oz",
//     description:
//       "Salted ripe plantain chips with a crisp bite for vegetarian sweet-and-savory snacking.",
//     retailPrice: "1.99",
//     wholesalePrice: "1.40",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXsh6cnt8BPgeWNAZFXca6QzOIrykMCwxfuYho",
//     ],
//     category: "Snacks, Breads & Confectionery",
//   },
//   {
//     name: "Burger Original Peanuts Snack",
//     slug: "burger-original-peanuts-snack-multipack",
//     sku: "BURGER-ORIGINAL-PEANUTS-SNACK-MULTIPACK",
//     brand: "Burger",
//     weight: "Multipack",
//     description:
//       "Original flavour peanut snack in a multipack, with crunchy coated peanuts for quick snacking.",
//     retailPrice: "4.99",
//     wholesalePrice: "3.75",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXWTY9XgvDXU3teM15G20Fg4pdAKNZElnSYsVo",
//     ],
//     category: "Snacks, Breads & Confectionery",
//   },
//   {
//     name: "Newbisco Coasters Quality Biscuits",
//     slug: "newbisco-coasters-quality-biscuits",
//     sku: "NEWBISCO-COASTERS-QUALITY-BISCUITS",
//     brand: "Newbisco",
//     weight: "Bulk wrapped pieces",
//     description:
//       "Individually wrapped round coaster biscuits with a crisp texture for tea, sharing, and counter sales.",
//     retailPrice: "0.50",
//     wholesalePrice: "0.35",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNX1fTkfpD5eMVEqQchlkgbBUPnuW7drwAvzOa3",
//     ],
//     category: "Snacks, Breads & Confectionery",
//   },
//   {
//     name: "Amen Hot Spicy Sweet Plantain Chips",
//     slug: "amen-hot-spicy-sweet-plantain-chips-500g",
//     sku: "AMEN-HOT-SPICY-SWEET-PLANTAIN-CHIPS-500G",
//     brand: "Amen",
//     weight: "17.63 oz (500g)",
//     description:
//       "Sweet and spicy plantain chips in a large jar with a crunchy texture and peppery finish.",
//     retailPrice: "8.99",
//     wholesalePrice: "6.75",
//     imageUrls: [
//       "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXoqSZFDWkq9CV2BFEf851QvjwOU3sI0c7yYt6",
//     ],
//     category: "Snacks, Breads & Confectionery",
//   },
// ];

const grainsRiceProducts: SeedProduct[] = [
  {
    name: "Besler Mutfak Baldo Rice",
    slug: "besler-mutfak-baldo-rice-1kg",
    sku: "BESLER-BALDO-RICE-1KG",
    brand: "Besler Mutfak",
    weight: "1kg",
    description:
      "Premium Turkish Baldo rice with plump grains that cook tender and creamy for pilaf, stuffed dishes, and everyday meals.",
    retailPrice: "5.99",
    wholesalePrice: "4.50",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXrdosjtQbDAGT40s36lLoNFnigX1fHUjk2ZRB",
    ],
    category: "Grains & Rice",
  },
  {
    name: "Riceland Enriched Parboiled Long Grain Rice",
    slug: "riceland-enriched-parboiled-long-grain-rice-10lb",
    sku: "RICELAND-PARBOILED-LONG-GRAIN-RICE-10LB",
    brand: "Riceland",
    weight: "10 lb",
    description:
      "Enriched parboiled long-grain rice with firm, separate grains for rice dishes, sides, meal prep, and family cooking.",
    retailPrice: "14.99",
    wholesalePrice: "11.50",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXM68bneCLMT5qyt9IA2aO3mxFvdXuncP7HriS",
    ],
    category: "Grains & Rice",
  },
  {
    name: "Chandni Chowk Golden Sella Parboiled Basmati Rice",
    slug: "chandni-chowk-golden-sella-parboiled-basmati-rice-20lb",
    sku: "CHANDNI-GOLDEN-SELLA-BASMATI-20LB",
    brand: "Chandni Chowk",
    weight: "20 lb",
    description:
      "Extra-long-grain Golden Sella basmati rice, parboiled for fluffy separate grains in biryani, pilaf, and catered meals.",
    retailPrice: "29.99",
    wholesalePrice: "24.00",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXzRDfF2sZVwrj91KBMkORPI3zGoSpTLtmaQq0",
    ],
    category: "Grains & Rice",
  },
  {
    name: "Clover Jasmine White Scented Rice",
    slug: "clover-jasmine-white-scented-rice",
    sku: "CLOVER-JASMINE-RICE",
    brand: "Clover",
    weight: null,
    description:
      "Fragrant Thai jasmine white rice with a soft texture and floral aroma for curries, stir-fries, and everyday meals.",
    retailPrice: "0.00",
    wholesalePrice: "0.00",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXJRl4ttHyUIcDxWynlGbSNmh0zBPkXAHapLZf",
    ],
    variants: [
      {
        name: "Broken Jasmine Rice",
        sku: "CLOVER-BROKEN-JASMINE-RICE-5LB",
        weight: "5 lb",
        retailPrice: "8.99",
        wholesalePrice: "6.75",
      },
      {
        name: "Jasmine Rice",
        sku: "CLOVER-JASMINE-RICE-10LB",
        weight: "10 lb",
        retailPrice: "17.99",
        wholesalePrice: "13.75",
      },
    ],
    category: "Grains & Rice",
  },
  {
    name: "Sultana Parboiled Basmati Rice",
    slug: "sultana-parboiled-basmati-rice-10lb",
    sku: "SULTANA-PARBOILED-BASMATI-RICE-10LB",
    brand: "Sultana",
    weight: "10 lb",
    description:
      "Aromatic parboiled basmati rice with long grains that stay separate, ideal for biryani, pilaf, jollof, and festive dishes.",
    retailPrice: "19.99",
    wholesalePrice: "15.50",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXbP9zGxo5Op4CRV8ijmIyH2xoatJUT0sgzuX3",
    ],
    category: "Grains & Rice",
  },
  {
    name: "African Best Yam Flour",
    slug: "african-best-yam-flour-20lb",
    sku: "AFRICAN-BEST-YAM-FLOUR-20LB",
    brand: "African Best",
    weight: "20 lb",
    description:
      "Fine yam flour for preparing smooth, hearty amala and other traditional swallow dishes in family or food-service quantities.",
    retailPrice: "39.99",
    wholesalePrice: "32.00",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXXhFxWI5pjE47Cu1KbTeNyMZYcGLSPAn68Wa2",
    ],
    category: "Grains & Rice",
  },
  {
    name: "African Best Plantain Flour",
    slug: "african-best-plantain-flour-10lb",
    sku: "AFRICAN-BEST-PLANTAIN-FLOUR-10LB",
    brand: "African Best",
    weight: "10 lb",
    description:
      "Naturally versatile plantain flour for swallow, porridge, baking blends, and savory traditional recipes.",
    retailPrice: "24.99",
    wholesalePrice: "19.50",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXTeCYXXxANvhWd6lkPZwVCGOImSK9YaDEXfgt",
    ],
    category: "Grains & Rice",
  },
  {
    name: "Bulk Oat Flour",
    slug: "bulk-oat-flour-20lb",
    sku: "BULK-OAT-FLOUR-20LB",
    brand: null,
    weight: "20 lb",
    description:
      "Bulk finely milled oat flour for porridge, baking, thickening, and blending into wholesome flour recipes.",
    retailPrice: "29.99",
    wholesalePrice: "23.50",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXGWPPmlRHPDnWEiT6ajfJtKOvSuomzIVXwc93",
    ],
    category: "Grains & Rice",
  },
  {
    name: "Honeywell Semolina",
    slug: "honeywell-semolina-2kg-5-pack",
    sku: "HONEYWELL-SEMOLINA-2KG-5PK",
    brand: "Honeywell",
    weight: "2kg x 5",
    description:
      "Quality semolina flour in a five-bag case for smooth semolina swallow, porridge, pasta, and food-service preparation.",
    retailPrice: "49.99",
    wholesalePrice: "39.50",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXzxuIUasZVwrj91KBMkORPI3zGoSpTLtmaQq0",
    ],
    category: "Grains & Rice",
  },
  {
    name: "African Best Black-Eyed Beans",
    slug: "african-best-black-eyed-beans",
    sku: "AFRICAN-BEST-BLACK-EYED-BEANS",
    brand: "African Best",
    weight: null,
    description:
      "Natural dried black-eyed beans for akara, moi moi, stews, rice dishes, soups, and everyday protein-rich meals.",
    retailPrice: "0.00",
    wholesalePrice: "0.00",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXCS6u9SJGDNTIJPmq7LiCuRpwSEMecbKWQ58O",
    ],
    variants: [
      {
        name: "Small Bag",
        sku: "AFRICAN-BEST-BLACK-EYED-BEANS-10LB",
        weight: "10 lb",
        retailPrice: "19.99",
        wholesalePrice: "15.50",
      },
      {
        name: "Large Bag",
        sku: "AFRICAN-BEST-BLACK-EYED-BEANS-20LB",
        weight: "20 lb",
        retailPrice: "36.99",
        wholesalePrice: "29.00",
      },
    ],
    category: "Grains & Rice",
  },
  {
    name: "African Best Yellow Garri",
    slug: "african-best-yellow-garri",
    sku: "AFRICAN-BEST-YELLOW-GARRI",
    brand: "African Best",
    weight: null,
    description:
      "Coarse yellow garri made from cassava for eba, soaking, and traditional West African meals.",
    retailPrice: "0.00",
    wholesalePrice: "0.00",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXRA1bdHUXB0Qm2LsIibVYAJxv6Et8kd3aUqn1",
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXxgVJCuljMJUv6gokLH2K3401lyX9VBtcseFD",
    ],
    variants: [
      {
        name: "Small Bag",
        sku: "AFRICAN-BEST-YELLOW-GARRI-10LB",
        weight: "10 lb",
        retailPrice: "18.99",
        wholesalePrice: "14.50",
      },
      {
        name: "Large Bag",
        sku: "AFRICAN-BEST-YELLOW-GARRI-20LB",
        weight: "20 lb",
        retailPrice: "34.99",
        wholesalePrice: "27.50",
      },
    ],
    category: "Grains & Rice",
  },
  {
    name: "African Best Garri Ijebu",
    slug: "african-best-garri-ijebu-10lb",
    sku: "AFRICAN-BEST-GARRI-IJEBU-10LB",
    brand: "African Best",
    weight: "10 lb",
    description:
      "Fine, tangy Ijebu-style white garri for soaking, eba, and traditional Nigerian meals.",
    retailPrice: "19.99",
    wholesalePrice: "15.50",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXWDZt4zvDXU3teM15G20Fg4pdAKNZElnSYsVo",
    ],
    category: "Grains & Rice",
  },
  {
    name: "African Best Ghana Garri",
    slug: "african-best-ghana-garri",
    sku: "AFRICAN-BEST-GHANA-GARRI",
    brand: "African Best",
    weight: null,
    description:
      "Traditional Ghana-style cassava garri with a crisp, granular texture for soaking, gari foto, and side dishes.",
    retailPrice: "0.00",
    wholesalePrice: "0.00",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXEhfRrbzS94HP3TmOkrJIQY0txeCNVcgnBAWR",
    ],
    variants: [
      {
        name: "Small Bag",
        sku: "AFRICAN-BEST-GHANA-GARRI-10LB",
        weight: "10 lb",
        retailPrice: "18.99",
        wholesalePrice: "14.50",
      },
      {
        name: "Large Bag",
        sku: "AFRICAN-BEST-GHANA-GARRI-20LB",
        weight: "20 lb",
        retailPrice: "34.99",
        wholesalePrice: "27.50",
      },
    ],
    category: "Grains & Rice",
  },
  {
    name: "Delta Star Parboiled Long Grain Rice",
    slug: "delta-star-parboiled-long-grain-rice",
    sku: "DELTA-STAR-PARBOILED-RICE",
    brand: "Delta Star",
    weight: null,
    description:
      "Enriched, gluten-free parboiled long-grain rice that cooks fluffy and separate for jollof, sides, and high-volume meals.",
    retailPrice: "0.00",
    wholesalePrice: "0.00",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXUqd5xu6zWU8smDVPqlov4bjwie3dKCO7tGL2",
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXprcHSkZYwKVt8Ir7FQj2oamJ4xRUTi1fA0GZ",
    ],
    variants: [
      {
        name: "Medium Bag",
        sku: "DELTA-STAR-PARBOILED-RICE-25LB",
        weight: "25 lb",
        retailPrice: "27.99",
        wholesalePrice: "22.00",
      },
      {
        name: "Bulk Bag",
        sku: "DELTA-STAR-PARBOILED-RICE-50LB",
        weight: "50 lb",
        retailPrice: "49.99",
        wholesalePrice: "40.00",
      },
    ],
    category: "Grains & Rice",
  },
  {
    name: "CKI Extra Quality Jasmine White Scented Rice",
    slug: "cki-extra-quality-jasmine-white-scented-rice",
    sku: "CKI-JASMINE-WHITE-SCENTED-RICE",
    brand: "CKI",
    weight: null,
    description:
      "Fragrant Thai jasmine white rice with soft, aromatic grains for curries, fried rice, sides, and restaurant service.",
    retailPrice: "0.00",
    wholesalePrice: "0.00",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNX69g67cTIdoa8APqmKptfzCilvc2yUEW9k3bD",
    ],
    variants: [
      {
        name: "Medium Bag",
        sku: "CKI-JASMINE-RICE-20LB",
        weight: "20 lb",
        retailPrice: "31.99",
        wholesalePrice: "25.00",
      },
      {
        name: "Bulk Bag",
        sku: "CKI-JASMINE-RICE-50LB",
        weight: "50 lb",
        retailPrice: "69.99",
        wholesalePrice: "56.00",
      },
    ],
    category: "Grains & Rice",
  },
  {
    name: "Clic Small Red Beans",
    slug: "clic-small-red-beans-25lb",
    sku: "CLIC-SMALL-RED-BEANS-25LB",
    brand: "Clic",
    weight: "25 lb",
    description:
      "Small dried red beans with a creamy texture when cooked, ideal for stews, rice and beans, soups, and bulk kitchens.",
    retailPrice: "39.99",
    wholesalePrice: "31.50",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXtiMxauphYx5l2n4dkqFK1Ois7TyRZe69ubVI",
    ],
    category: "Grains & Rice",
  },
  {
    name: "Golden Penny Semovita",
    slug: "golden-penny-semovita",
    sku: "GOLDEN-PENNY-SEMOVITA",
    brand: "Golden Penny",
    weight: null,
    description:
      "Premium fortified semolina flour for preparing smooth, satisfying semovita swallow with soups, stews, and sauces.",
    retailPrice: "0.00",
    wholesalePrice: "0.00",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXOuPiBWbQYH4d3gWkzAvUyumf5Xsq1r8GD2nS",
    ],
    variants: [
      {
        name: "Five 2kg Sachets",
        sku: "GOLDEN-PENNY-SEMOVITA-2KG-5PK",
        weight: "2kg x 5",
        retailPrice: "54.99",
        wholesalePrice: "43.50",
      },
      {
        name: "Ten 1kg Sachets",
        sku: "GOLDEN-PENNY-SEMOVITA-1KG-10PK",
        weight: "1kg x 10",
        retailPrice: "56.99",
        wholesalePrice: "45.00",
      },
    ],
    category: "Grains & Rice",
  },
  {
    name: "Ben's Original Whole Grain Brown Rice",
    slug: "bens-original-whole-grain-brown-rice-25lb",
    sku: "BENS-ORIGINAL-BROWN-RICE-25LB",
    brand: "Ben's Original",
    weight: "25 lb",
    description:
      "Whole-grain parboiled long-grain brown rice with a nutty flavor and firm texture for bowls, sides, and bulk meal preparation.",
    retailPrice: "39.99",
    wholesalePrice: "31.50",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXLNBiViKIXoR4QwdV2CKS7E1pDUexhzakf0IH",
    ],
    category: "Grains & Rice",
  },
  {
    name: "Par Excellence Premium Parboiled Rice",
    slug: "par-excellence-premium-parboiled-rice",
    sku: "PAR-EXCELLENCE-PARBOILED-RICE",
    brand: "Par Excellence",
    weight: null,
    description:
      "Enriched premium parboiled long-grain rice that cooks separate and fluffy for jollof, pilaf, sides, and food-service meals.",
    retailPrice: "0.00",
    wholesalePrice: "0.00",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXOuwQGBbQYH4d3gWkzAvUyumf5Xsq1r8GD2nS",
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXE8nLn60zS94HP3TmOkrJIQY0txeCNVcgnBAW",
    ],
    variants: [
      {
        name: "Medium Bag",
        sku: "PAR-EXCELLENCE-PARBOILED-RICE-25LB",
        weight: "25 lb",
        retailPrice: "29.99",
        wholesalePrice: "23.50",
      },
      {
        name: "Bulk Box",
        sku: "PAR-EXCELLENCE-PARBOILED-RICE-50LB",
        weight: "50 lb",
        retailPrice: "54.99",
        wholesalePrice: "43.50",
      },
    ],
    category: "Grains & Rice",
  },
  {
    name: "Ola-Ola Authentic Pounded Yam",
    slug: "ola-ola-authentic-pounded-yam-18-5lb",
    sku: "OLA-OLA-POUNDED-YAM-18-5LB",
    brand: "Ola-Ola",
    weight: "18.5 lb (8.4kg)",
    description:
      "Instant authentic pounded yam flour for preparing smooth, stretchy iyan to serve with traditional soups and stews.",
    retailPrice: "49.99",
    wholesalePrice: "39.50",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXcuAJgqxTLkfJbVaDEF6wd8mCrq39RzhUicnI",
    ],
    category: "Grains & Rice",
  },
  {
    name: "Iyan Ado Instant Pounded Yam",
    slug: "iyan-ado-instant-pounded-yam-20lb",
    sku: "IYAN-ADO-POUNDED-YAM-20LB",
    brand: "Iyan Ado",
    weight: "20 lb (9.08kg)",
    description:
      "Instant pounded yam flour made for a smooth, lump-free swallow to pair with egusi, ogbono, vegetable soup, and stews.",
    retailPrice: "52.99",
    wholesalePrice: "42.00",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXRTdyVh3UXB0Qm2LsIibVYAJxv6Et8kd3aUqn",
    ],
    category: "Grains & Rice",
  },
  {
    name: "African Best Honey Beans",
    slug: "african-best-honey-beans-10lb",
    sku: "AFRICAN-BEST-HONEY-BEANS-10LB",
    brand: "African Best",
    weight: "10 lb",
    description:
      "Naturally sweet Nigerian honey beans, also known as oloyin, for porridge, stews, akara, moi moi, and everyday meals.",
    retailPrice: "24.99",
    wholesalePrice: "19.50",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXb1gd3Zo5Op4CRV8ijmIyH2xoatJUT0sgzuX3",
    ],
    category: "Grains & Rice",
  },
  {
    name: "Bulk Brown Beans",
    slug: "bulk-brown-beans-20lb",
    sku: "BULK-BROWN-BEANS-20LB",
    brand: null,
    weight: "20 lb",
    description:
      "Bulk dried brown beans with a creamy texture when cooked, suited to bean porridge, stews, rice dishes, and food service.",
    retailPrice: "39.99",
    wholesalePrice: "31.50",
    imageUrls: [
      "https://wqm5mupjsa.ufs.sh/f/wxknK72G9mNXQbasY9LaQmgxRsrwTlNvnbS3Bpfi7yGF50X9",
    ],
    category: "Grains & Rice",
  },
];

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

function productVariants(product: SeedProduct) {
  return (product.variants ?? []).map((variant, index) => ({
    label: `${variant.name} - ${variant.weight}`,
    sku: variant.sku,
    retailPrice: variant.retailPrice,
    wholesalePrice: variant.wholesalePrice,
    inventory: 100,
    sortOrder: index,
    isActive: true,
  }));
}

async function seedProducts(products: SeedProduct[]) {
  for (const product of products) {
    if (!product.category) {
      throw new Error(`${product.name} has no category.`);
    }

    const categorySlug =
      categorySlugOverrides[product.category] ??
      product.category
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
          variants: {
            deleteMany: {},
            create: productVariants(product),
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
        variants: {
          create: productVariants(product),
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
  await seedProducts(grainsRiceProducts);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
