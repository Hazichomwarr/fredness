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

export type CreateProductActionState = {
  error: string | null;
};

export type DeleteProductVariantResult =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      message: string;
      fieldErrors?: Record<string, string[]>;
    };

const deleteProductVariantSchema = z.object({
  productId: z.string().trim().min(1, "Product is required."),
  variantId: z.string().trim().min(1, "Variant is required."),
});

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

function submittedFieldNames(formData: FormData) {
  return Array.from(new Set(Array.from(formData.keys()))).sort();
}

function prismaErrorCode(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError
    ? error.code
    : undefined;
}

function prismaErrorMeta(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError
    ? error.meta
    : undefined;
}

function isDatabaseConnectionError(error: unknown) {
  if (
    error instanceof Prisma.PrismaClientInitializationError ||
    error instanceof Prisma.PrismaClientRustPanicError
  ) {
    return true;
  }

  if (!(error instanceof Error)) {
    return false;
  }

  return /connection|connect|timeout|terminated|closed|unavailable|ECONN|ENOTFOUND|ETIMEDOUT/i.test(
    error.message,
  );
}

function createProductErrorMessage(error: unknown) {
  const code = prismaErrorCode(error);

  if (code === "P2002") {
    return "A product with this slug or SKU already exists.";
  }

  if (code === "P2003" || code === "P2025") {
    return "The selected category no longer exists.";
  }

  if (isDatabaseConnectionError(error)) {
    return "The database is temporarily unavailable. Please try again.";
  }

  if (error instanceof z.ZodError) {
    return "Check the product form for missing or invalid fields.";
  }

  return "Unable to create product. Please review the form and try again.";
}

function logCreateProductError(error: unknown, formData: FormData) {
  console.error("[ADMIN_PRODUCT_CREATE_ERROR]", {
    errorName: error instanceof Error ? error.name : typeof error,
    errorMessage: error instanceof Error ? error.message : String(error),
    prismaCode: prismaErrorCode(error),
    prismaMeta: prismaErrorMeta(error),
    submittedFields: submittedFieldNames(formData),
  });
}

export async function createProductAction(
  _previousState: CreateProductActionState,
  formData: FormData,
): Promise<CreateProductActionState> {
  await requireAdmin();

  try {
    const parsed = parseProductForm(formData);

    const retailPrice = new Prisma.Decimal(parsed.retailPrice);
    const wholesalePrice = parsed.wholesalePrice
      ? new Prisma.Decimal(parsed.wholesalePrice)
      : null;

    await prisma.product.create({
      data: {
        name: parsed.name,
        slug: parsed.slug,
        sku: parsed.sku,
        categoryId: parsed.categoryId,
        description: parsed.description,
        brand: parsed.brand,
        weight: parsed.weight,
        retailPrice,
        wholesalePrice,
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
  } catch (error) {
    logCreateProductError(error, formData);
    return {
      error: createProductErrorMessage(error),
    };
  }

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

export async function deleteProductVariantAction(input: {
  productId: string;
  variantId: string;
}): Promise<DeleteProductVariantResult> {
  await requireAdmin();

  const parsed = deleteProductVariantSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "The variant deletion request is invalid.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  try {
    const variant = await prisma.productVariant.findFirst({
      where: {
        id: parsed.data.variantId,
        productId: parsed.data.productId,
      },
      select: {
        id: true,
        product: {
          select: {
            slug: true,
          },
        },
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
    });

    if (!variant) {
      return {
        success: false,
        message: "Variant not found. It may have already been deleted.",
      };
    }

    if (variant._count.orderItems > 0) {
      return {
        success: false,
        message:
          "This variant is used by historical orders and cannot be deleted. Mark it inactive instead.",
      };
    }

    await prisma.productVariant.delete({
      where: {
        id: variant.id,
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/");
    revalidatePath("/categories");
    revalidatePath("/products");
    revalidatePath(`/products/${variant.product.slug}`);

    return {
      success: true,
      message: "Variant deleted successfully.",
    };
  } catch (error) {
    const code = prismaErrorCode(error);

    if (code === "P2025") {
      return {
        success: false,
        message: "Variant not found. It may have already been deleted.",
      };
    }

    if (code === "P2003") {
      return {
        success: false,
        message:
          "This variant is still referenced by historical data and cannot be deleted. Mark it inactive instead.",
      };
    }

    console.error("[ADMIN_PRODUCT_VARIANT_DELETE_ERROR]", {
      errorName: error instanceof Error ? error.name : typeof error,
      errorMessage: error instanceof Error ? error.message : String(error),
      prismaCode: code,
      productId: parsed.data.productId,
      variantId: parsed.data.variantId,
    });

    return {
      success: false,
      message: isDatabaseConnectionError(error)
        ? "The database is temporarily unavailable. Please try again."
        : "Unable to delete the variant. Please try again.",
    };
  }
}
