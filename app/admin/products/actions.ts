// app/admin/products/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/src/lib/prisma";
import { Prisma } from "@/app/generated/prisma";

const productUpdateSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, "Name is required"),
  sku: z.string().trim().min(1, "SKU is required"),
  retailPrice: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/),
  wholesalePrice: z
    .string()
    .trim()
    .transform((value) => (value ? value : null))
    .pipe(
      z
        .string()
        .regex(/^\d+(\.\d{1,2})?$/)
        .nullable(),
    ),
  inventory: z.coerce.number().int().min(0),
  isActive: z
    .string()
    .optional()
    .transform((value) => value === "on"),
});

export async function updateProductAction(formData: FormData) {
  const parsed = productUpdateSchema.parse({
    id: formData.get("id"),
    name: formData.get("name"),
    sku: formData.get("sku"),
    retailPrice: formData.get("retailPrice"),
    wholesalePrice: formData.get("wholesalePrice"),
    inventory: formData.get("inventory"),
    isActive: formData.get("isActive"),
  });

  await prisma.product.update({
    where: { id: parsed.id },
    data: {
      name: parsed.name,
      sku: parsed.sku,
      retailPrice: new Prisma.Decimal(parsed.retailPrice),
      wholesalePrice: parsed.wholesalePrice
        ? new Prisma.Decimal(parsed.wholesalePrice)
        : null,
      inventory: parsed.inventory,
      isActive: parsed.isActive,
    },
  });

  revalidatePath("/admin/products");
}

export async function hideProductAction(formData: FormData) {
  const id = z.string().min(1).parse(formData.get("id"));

  await prisma.product.update({
    where: { id },
    data: {
      isActive: false,
    },
  });

  revalidatePath("/admin/products");
}
