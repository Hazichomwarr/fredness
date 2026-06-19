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

async function main() {
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

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
