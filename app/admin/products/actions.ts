// app/admin/products/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/src/lib/prisma";
import { Prisma } from "@/app/generated/prisma";
import { productFormSchema } from "@/src/lib/products/product-form-schema";

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

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseBoolean(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

function parseProductForm(formData: FormData) {
  const parsed = productFormSchema.parse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    sku: formData.get("sku"),
    categoryId: formData.get("categoryId"),
    description: formData.get("description"),
    brand: formData.get("brand"),
    weight: formData.get("weight"),
    retailPrice: formData.get("retailPrice"),
    wholesalePrice: formData.get("wholesalePrice"),
    minimumWholesaleQty: formData.get("minimumWholesaleQty"),
    inventory: formData.get("inventory"),
    trackInventory: parseBoolean(formData.get("trackInventory")),
    isActive: parseBoolean(formData.get("isActive")),
    imageUrls: formData.get("imageUrls"),
  });

  return {
    ...parsed,
    slug: parsed.slug ? slugify(parsed.slug) : slugify(parsed.name),
  };
}

export async function createProductAction(formData: FormData) {
  const parsed = parseProductForm(formData);

  await prisma.product.create({
    data: {
      name: parsed.name,
      slug: parsed.slug,
      sku: parsed.sku,
      categoryId: parsed.categoryId,
      description: parsed.description,
      brand: parsed.brand,
      weight: parsed.weight,
      retailPrice: new Prisma.Decimal(parsed.retailPrice),
      wholesalePrice: parsed.wholesalePrice
        ? new Prisma.Decimal(parsed.wholesalePrice)
        : null,
      minimumWholesaleQty: parsed.minimumWholesaleQty,
      inventory: parsed.inventory,
      trackInventory: parsed.trackInventory,
      isActive: parsed.isActive,
      images: {
        create: parsed.imageUrls.map((url, index) => ({
          url,
          sortOrder: index,
          altText: parsed.name,
        })),
      },
    },
  });

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

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
