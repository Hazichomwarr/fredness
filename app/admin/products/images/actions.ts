"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/src/lib/auth/admin";
import { addUploadedProductImages } from "@/src/lib/products/product-image-workflow";

const uploadedImagesSchema = z.object({
  productId: z.string().min(1),
  urls: z.array(z.string().url()).min(1).max(5),
});

export async function saveProductUploadedImagesAction(input: {
  productId: string;
  urls: string[];
}) {
  await requireAdmin();

  const parsed = uploadedImagesSchema.parse(input);
  const result = await addUploadedProductImages({
    productId: parsed.productId,
    imageUrls: parsed.urls,
  });

  revalidatePath("/admin/products/images");
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath(`/products/${result.slug}`);

  return {
    ok: true,
    addedCount: result.addedCount,
  };
}
