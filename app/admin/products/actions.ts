// app/admin/products/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/src/lib/prisma";
import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/src/lib/auth/admin";
import {
  productImageUrlsSchema,
  productFormSchema,
  productVariantFormSchema,
} from "@/src/lib/products/product-form-schema";

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

function parseVariantRows(formData: FormData) {
  const indexes = new Set<number>();

  for (const key of formData.keys()) {
    const match = key.match(/^variants\.(\d+)\./);

    if (match) {
      indexes.add(Number(match[1]));
    }
  }

  return Array.from(indexes)
    .sort((left, right) => left - right)
    .flatMap((index) => {
      const row = {
        id: String(formData.get(`variants.${index}.id`) ?? "").trim(),
        label: String(formData.get(`variants.${index}.label`) ?? "").trim(),
        sku: String(formData.get(`variants.${index}.sku`) ?? "").trim(),
        retailPrice: String(
          formData.get(`variants.${index}.retailPrice`) ?? "",
        ).trim(),
        wholesalePrice: String(
          formData.get(`variants.${index}.wholesalePrice`) ?? "",
        ).trim(),
        inventory: formData.get(`variants.${index}.inventory`) ?? "0",
        sortOrder: formData.get(`variants.${index}.sortOrder`) ?? "0",
        isActive: parseBoolean(formData.get(`variants.${index}.isActive`)),
      };
      const isEmptyNewRow =
        !row.id &&
        !row.label &&
        !row.sku &&
        !row.retailPrice &&
        !row.wholesalePrice;

      if (isEmptyNewRow) {
        return [];
      }

      return [productVariantFormSchema.parse(row)];
    });
}

function parseProductForm(formData: FormData) {
  const parsed = productFormSchema.parse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    sku: formData.get("sku"),
    categoryId: formData.get("categoryId"),
    description: formData.get("description"),
    brand: formData.get("brand"),
    weight: "",
    retailPrice: formData.get("retailPrice"),
    wholesalePrice: formData.get("wholesalePrice"),
    minimumWholesaleQty: formData.get("minimumWholesaleQty"),
    inventory: formData.get("inventory"),
    trackInventory: parseBoolean(formData.get("trackInventory")),
    isActive: parseBoolean(formData.get("isActive")),
    imageUrls: formData.get("imageUrls"),
    variants: parseVariantRows(formData),
  });

  return {
    ...parsed,
    slug: parsed.slug ? slugify(parsed.slug) : slugify(parsed.name),
  };
}

export async function createProductAction(formData: FormData) {
  await requireAdmin();

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
      variants: {
        create: parsed.variants.map((variant) => ({
          label: variant.label,
          sku: variant.sku,
          retailPrice: new Prisma.Decimal(variant.retailPrice),
          wholesalePrice: variant.wholesalePrice
            ? new Prisma.Decimal(variant.wholesalePrice)
            : null,
          inventory: variant.inventory,
          sortOrder: variant.sortOrder,
          isActive: variant.isActive,
        })),
      },
    },
  });

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateProductAction(formData: FormData) {
  await requireAdmin();
  const variants = parseVariantRows(formData);
  const imageUrls = productImageUrlsSchema.parse(formData.get("imageUrls"));

  const parsed = productUpdateSchema.parse({
    id: formData.get("id"),
    name: formData.get("name"),
    sku: formData.get("sku"),
    retailPrice: formData.get("retailPrice"),
    wholesalePrice: formData.get("wholesalePrice"),
    inventory: formData.get("inventory"),
    isActive: formData.get("isActive"),
  });

  await prisma.$transaction(async (tx) => {
    await tx.product.update({
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

    await tx.productImage.deleteMany({
      where: {
        productId: parsed.id,
      },
    });

    if (imageUrls.length) {
      await tx.productImage.createMany({
        data: imageUrls.map((url, index) => ({
          productId: parsed.id,
          url,
          sortOrder: index,
          altText: parsed.name,
        })),
      });
    }
  });

  const retainedVariantIds: string[] = [];

  for (const variant of variants) {
    const data = {
      label: variant.label,
      sku: variant.sku,
      retailPrice: new Prisma.Decimal(variant.retailPrice),
      wholesalePrice: variant.wholesalePrice
        ? new Prisma.Decimal(variant.wholesalePrice)
        : null,
      inventory: variant.inventory,
      sortOrder: variant.sortOrder,
      isActive: variant.isActive,
    };

    if (variant.id) {
      await prisma.productVariant.updateMany({
        where: {
          id: variant.id,
          productId: parsed.id,
        },
        data,
      });
      retainedVariantIds.push(variant.id);
      continue;
    }

    const createdVariant = await prisma.productVariant.create({
      data: {
        productId: parsed.id,
        ...data,
      },
      select: {
        id: true,
      },
    });
    retainedVariantIds.push(createdVariant.id);
  }

  await prisma.productVariant.updateMany({
    where: {
      productId: parsed.id,
      id: {
        notIn: retainedVariantIds.length ? retainedVariantIds : ["__none__"],
      },
    },
    data: {
      isActive: false,
    },
  });

  revalidatePath("/admin/products");
}

export async function hideProductAction(formData: FormData) {
  await requireAdmin();

  const id = z.string().min(1).parse(formData.get("id"));

  await prisma.product.update({
    where: { id },
    data: {
      isActive: false,
    },
  });

  revalidatePath("/admin/products");
}
