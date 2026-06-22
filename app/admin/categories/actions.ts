"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/src/lib/auth/admin";
import { FALLBACK_IMAGE_URL } from "@/src/lib/images";
import { prisma } from "@/src/lib/prisma";

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : null));

const categorySchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  slug: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? slugify(value) : undefined)),
  description: optionalText,
  imageUrl: optionalText,
  sortOrder: z.coerce.number().int().min(0).default(0),
});

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

export async function createCategoryAction(formData: FormData) {
  await requireAdmin();

  const parsed = parseCategoryForm(formData);

  await prisma.category.create({
    data: parsed,
  });

  revalidatePath("/admin/categories");
}

export async function updateCategoryAction(formData: FormData) {
  await requireAdmin();

  const id = z.string().min(1).parse(formData.get("id"));
  const parsed = parseCategoryForm(formData);

  await prisma.category.update({
    where: { id },
    data: parsed,
  });

  revalidatePath("/admin/categories");
  revalidatePath(`/admin/categories/${id}/edit`);
  redirect("/admin/categories");
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
