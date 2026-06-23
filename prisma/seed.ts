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
    imageUrl: "/categories/fufu.jpg",
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

async function main() {
  await seedAdmin();
  await seedCategories();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
