// src/lib/products/product-form-schema.ts
import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : null));

const optionalPrice = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : null))
  .pipe(
    z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/)
      .nullable(),
  );

const optionalInteger = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? Number(value) : null))
  .pipe(z.number().int().min(0).nullable());

const publicImagePath = z
  .string()
  .regex(/^\/(?!\/)\S+$/, "Enter a full URL or a public path like /products/product.jpeg");

const imageUrlOrPublicPath = z.union([
  z.string().url("Enter a full URL or a public path like /products/product.jpeg"),
  publicImagePath,
]);

const imageUrls = z
  .string()
  .trim()
  .optional()
  .transform((value) =>
    value
      ? value
          .split(/\r?\n/)
          .map((url) => url.trim())
          .filter(Boolean)
      : [],
  )
  .pipe(z.array(imageUrlOrPublicPath));

export const productFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  slug: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined)),
  sku: z.string().trim().min(1, "SKU is required"),
  categoryId: z.string().min(1, "Category is required"),
  description: optionalText,
  brand: optionalText,
  weight: optionalText,
  retailPrice: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, "Enter a valid price"),
  wholesalePrice: optionalPrice,
  minimumWholesaleQty: optionalInteger,
  inventory: z.coerce.number().int().min(0),
  trackInventory: z.boolean().default(true),
  isActive: z.boolean().default(true),
  imageUrls,
});

export type ProductFormParsedValues = z.output<typeof productFormSchema>;
export type ProductFormValues = z.input<typeof productFormSchema>;
