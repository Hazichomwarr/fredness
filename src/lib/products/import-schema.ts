import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

const money = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,2})?$/, "Must be a valid price");

const optionalMoney = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined))
  .pipe(money.optional());

const wholeNumber = z
  .string()
  .trim()
  .regex(/^\d+$/, "Must be a whole number")
  .transform((value) => Number(value));

const optionalWholeNumber = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined))
  .pipe(wholeNumber.optional());

const booleanValue = z
  .string()
  .trim()
  .toLowerCase()
  .optional()
  .transform((value) => {
    if (!value) return undefined;
    if (["true", "yes", "1", "active"].includes(value)) return true;
    if (["false", "no", "0", "inactive"].includes(value)) return false;
    return undefined;
  });

const imageUrls = z
  .string()
  .trim()
  .optional()
  .transform((value) =>
    value
      ? value
          .split(/[|,]/)
          .map((url) => url.trim())
          .filter(Boolean)
      : [],
  );

export const productImportRowSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    sku: z.string().trim().min(1, "SKU is required"),
    slug: optionalText,
    categorySlug: optionalText,
    categoryName: optionalText,
    description: optionalText,
    brand: optionalText,
    weight: optionalText,
    retailPrice: money,
    wholesalePrice: optionalMoney,
    minimumWholesaleQty: optionalWholeNumber,
    inventory: wholeNumber.default(0),
    trackInventory: booleanValue.default(true),
    isActive: booleanValue.default(true),
    imageUrls,
  })
  .refine((row) => row.categorySlug || row.categoryName, {
    message: "Either categorySlug or categoryName is required",
    path: ["categorySlug"],
  });

export type ProductImportRow = z.infer<typeof productImportRowSchema>;

export type ProductImportInvalidRow = {
  rowNumber: number;
  row: Record<string, string>;
  errors: string[];
};

export type ProductImportSummary = {
  totalRows: number;
  created: number;
  skipped: number;
  invalidRows: ProductImportInvalidRow[];
};
