"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { requireAdmin } from "@/src/lib/auth/admin";
import { FALLBACK_IMAGE_URL } from "@/src/lib/images";
import { prisma } from "@/src/lib/prisma";
import {
  deleteManagedUploadThingImage,
  deleteVerifiedUploadThingImage,
  uploadThingFileKeyFromUrl,
} from "@/src/lib/uploadthing-files";

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : null));

function isSupportedImageLocation(value: string) {
  if (/^\/(?!\/)\S+$/.test(value)) return true;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const imageUrl = z
  .string()
  .trim()
  .max(2048, "Image URL is too long.")
  .refine(
    (value) => !value || isSupportedImageLocation(value),
    "Enter a valid HTTP(S) image URL or public path.",
  )
  .transform((value) => (value ? value : null));

const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or fewer."),
  slug: z
    .string()
    .trim()
    .max(120, "Slug must be 120 characters or fewer.")
    .optional()
    .transform((value) => (value ? slugify(value) : undefined)),
  description: z
    .string()
    .trim()
    .max(500, "Description must be 500 characters or fewer.")
    .optional()
    .transform((value) => (value ? value : null)),
  imageUrl,
  sortOrder: z.coerce.number().int().min(0).default(0),
});

const updateCategorySchema = categorySchema.extend({
  id: z.string().trim().min(1, "Category is required."),
  removeImage: z.preprocess(
    (value) => value === "true" || value === "on",
    z.boolean(),
  ),
  uploadedImageUrl: optionalText,
  uploadedImageKey: optionalText,
});

export type UpdateCategoryResult =
  | {
      success: true;
      message: string;
      categoryId: string;
      imageUrl: string | null;
    }
  | {
      success: false;
      message: string;
      fieldErrors?: Record<string, string[]>;
    };

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseCategoryForm(formData: FormData) {
  const parsed = categorySchema.parse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    imageUrl: formData.get("imageUrl"),
    sortOrder: formData.get("sortOrder"),
  });

  return {
    ...parsed,
    imageUrl: parsed.imageUrl ?? FALLBACK_IMAGE_URL,
    slug: parsed.slug ?? slugify(parsed.name),
  };
}

function revalidateCategoryPages(id: string) {
  revalidatePath("/admin/categories");
  revalidatePath(`/admin/categories/${id}/edit`);
  revalidatePath("/");
  revalidatePath("/categories");
  revalidatePath("/products");
  revalidatePath("/quote");
}

async function cleanupUploadedImage(imageUrlValue: string, key: string) {
  try {
    await deleteVerifiedUploadThingImage(imageUrlValue, key);
  } catch (error) {
    console.error("[CATEGORY_IMAGE_UPLOAD_CLEANUP_ERROR]", {
      errorMessage: error instanceof Error ? error.message : String(error),
      key,
    });
  }
}

export async function createCategoryAction(formData: FormData) {
  await requireAdmin();

  const parsed = parseCategoryForm(formData);

  await prisma.category.create({
    data: parsed,
  });

  revalidatePath("/admin/categories");
  revalidatePath("/");
  revalidatePath("/categories");
}

export async function updateCategoryAction(
  formData: FormData,
): Promise<UpdateCategoryResult> {
  await requireAdmin();

  const rawUploadedImageUrl = String(
    formData.get("uploadedImageUrl") ?? "",
  ).trim();
  const rawUploadedImageKey = String(
    formData.get("uploadedImageKey") ?? "",
  ).trim();
  const parsed = updateCategorySchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    imageUrl: formData.get("imageUrl"),
    sortOrder: formData.get("sortOrder"),
    removeImage: formData.get("removeImage"),
    uploadedImageUrl: rawUploadedImageUrl,
    uploadedImageKey: rawUploadedImageKey,
  });

  if (!parsed.success) {
    if (rawUploadedImageUrl && rawUploadedImageKey) {
      await cleanupUploadedImage(rawUploadedImageUrl, rawUploadedImageKey);
    }

    return {
      success: false,
      message: "Check the category form for invalid fields.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const { uploadedImageUrl, uploadedImageKey } = parsed.data;
  const hasUploadedImage = Boolean(uploadedImageUrl && uploadedImageKey);

  if (Boolean(uploadedImageUrl) !== Boolean(uploadedImageKey)) {
    return {
      success: false,
      message: "The uploaded image information is incomplete. Upload it again.",
      fieldErrors: {
        imageUrl: ["Upload the replacement image again."],
      },
    };
  }

  if (
    uploadedImageUrl &&
    uploadedImageKey &&
    uploadThingFileKeyFromUrl(uploadedImageUrl) !== uploadedImageKey
  ) {
    return {
      success: false,
      message: "The uploaded image could not be verified.",
      fieldErrors: {
        imageUrl: ["Upload the replacement image again."],
      },
    };
  }

  if (hasUploadedImage && parsed.data.removeImage) {
    await cleanupUploadedImage(uploadedImageUrl!, uploadedImageKey!);
    return {
      success: false,
      message: "Choose either a replacement image or image removal.",
      fieldErrors: {
        imageUrl: ["Cancel the replacement or undo image removal."],
      },
    };
  }

  const category = await prisma.category.findUnique({
    where: { id: parsed.data.id },
    select: {
      id: true,
      imageUrl: true,
    },
  });

  if (!category) {
    if (uploadedImageUrl && uploadedImageKey) {
      await cleanupUploadedImage(uploadedImageUrl, uploadedImageKey);
    }

    return {
      success: false,
      message: "Category not found.",
    };
  }

  // Image precedence is: uploaded replacement, explicit removal, URL field.
  // The client keeps the existing URL in the field until the admin changes it.
  const finalImageUrl = uploadedImageUrl
    ? uploadedImageUrl
    : parsed.data.removeImage
      ? null
      : parsed.data.imageUrl;

  try {
    await prisma.category.update({
      where: { id: category.id },
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug ?? slugify(parsed.data.name),
        description: parsed.data.description,
        imageUrl: finalImageUrl,
        sortOrder: parsed.data.sortOrder,
      },
    });
  } catch (error) {
    if (uploadedImageUrl && uploadedImageKey) {
      await cleanupUploadedImage(uploadedImageUrl, uploadedImageKey);
    }

    const code =
      error instanceof Prisma.PrismaClientKnownRequestError
        ? error.code
        : undefined;

    return {
      success: false,
      message:
        code === "P2002"
          ? "A category with this slug already exists."
          : code === "P2025"
            ? "Category not found."
            : "Unable to save the category. Please try again.",
      fieldErrors:
        code === "P2002"
          ? { slug: ["Choose a unique category slug."] }
          : undefined,
    };
  }

  if (category.imageUrl && category.imageUrl !== finalImageUrl) {
    try {
      await deleteManagedUploadThingImage(category.imageUrl);
    } catch (error) {
      console.error("[CATEGORY_OLD_IMAGE_DELETE_ERROR]", {
        categoryId: category.id,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
    }
  }

  revalidateCategoryPages(category.id);

  return {
    success: true,
    message: "Category saved successfully.",
    categoryId: category.id,
    imageUrl: finalImageUrl,
  };
}

export async function discardCategoryImageUploadAction(input: {
  imageUrl: string;
  key: string;
}) {
  await requireAdmin();
  await cleanupUploadedImage(input.imageUrl, input.key);
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAdmin();

  const id = z.string().min(1).parse(formData.get("id"));

  const productCount = await prisma.product.count({
    where: { categoryId: id },
  });

  if (productCount > 0) {
    throw new Error("Cannot delete category with products.");
  }

  await prisma.category.delete({
    where: { id },
  });

  revalidatePath("/admin/categories");
}

export async function mergeCategoryAction(formData: FormData) {
  await requireAdmin();

  const sourceCategoryId = z
    .string()
    .min(1)
    .parse(formData.get("sourceCategoryId"));
  const targetCategoryId = z
    .string()
    .min(1)
    .parse(formData.get("targetCategoryId"));

  if (sourceCategoryId === targetCategoryId) {
    throw new Error("Choose a different target category.");
  }

  await prisma.$transaction(async (tx) => {
    const [source, target] = await Promise.all([
      tx.category.findUnique({ where: { id: sourceCategoryId } }),
      tx.category.findUnique({ where: { id: targetCategoryId } }),
    ]);

    if (!source || !target) {
      throw new Error("Category not found.");
    }

    await tx.product.updateMany({
      where: { categoryId: sourceCategoryId },
      data: { categoryId: targetCategoryId },
    });

    await tx.category.delete({
      where: { id: sourceCategoryId },
    });
  });

  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
}
