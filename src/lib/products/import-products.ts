import "server-only";

import { parse } from "csv-parse/sync";
import { prisma } from "@/src/lib/prisma";
import {
  ProductImportInvalidRow,
  ProductImportRow,
  ProductImportSummary,
  productImportRowSchema,
} from "@/src/lib/products/import-schema";
import type { Category } from "@/app/generated/prisma";
import { Prisma } from "@/app/generated/prisma";

type ParsedProductRow = {
  rowNumber: number;
  data: ProductImportRow;
};

const headerAliases: Record<string, keyof ProductImportRow> = {
  category: "categoryName",
  category_name: "categoryName",
  categoryname: "categoryName",
  category_slug: "categorySlug",
  categoryslug: "categorySlug",
  image_url: "imageUrls",
  image_urls: "imageUrls",
  imageurls: "imageUrls",
  images: "imageUrls",
  min_wholesale_qty: "minimumWholesaleQty",
  minimum_wholesale_qty: "minimumWholesaleQty",
  minimumwholesaleqty: "minimumWholesaleQty",
  retail_price: "retailPrice",
  retailprice: "retailPrice",
  track_inventory: "trackInventory",
  trackinventory: "trackInventory",
  wholesale_price: "wholesalePrice",
  wholesaleprice: "wholesalePrice",
  active: "isActive",
  is_active: "isActive",
  isactive: "isActive",
};

function normalizeHeader(header: string) {
  const compact = header.trim().replace(/[\s-]+/g, "_");
  const key = compact.replace(/_/g, "").toLowerCase();

  if (key in headerAliases) {
    return headerAliases[key];
  }

  if (compact in headerAliases) {
    return headerAliases[compact];
  }

  return compact;
}

function normalizeRow(row: Record<string, string>) {
  return Object.entries(row).reduce<Record<string, string>>(
    (normalized, [key, value]) => {
      normalized[normalizeHeader(key)] = value;
      return normalized;
    },
    {},
  );
}

export function parseProductCsv(csvText: string) {
  const rows = parse(csvText, {
    bom: true,
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];

  const validRows: ParsedProductRow[] = [];
  const invalidRows: ProductImportInvalidRow[] = [];

  rows.forEach((rawRow, index) => {
    const rowNumber = index + 2;
    const row = normalizeRow(rawRow);
    const result = productImportRowSchema.safeParse(row);

    if (result.success) {
      validRows.push({ rowNumber, data: result.data });
      return;
    }

    invalidRows.push({
      rowNumber,
      row,
      errors: result.error.issues.map((issue) => issue.message),
    });
  });

  return {
    totalRows: rows.length,
    validRows,
    invalidRows,
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}
async function resolveCategory(
  row: ProductImportRow,
  categoryCache: Map<string, Category>,
) {
  const slug = row.categorySlug ?? slugify(row.categoryName ?? "");

  if (!slug) {
    throw new Error("Category is required");
  }

  const cachedCategory = categoryCache.get(slug);

  if (cachedCategory) {
    return cachedCategory;
  }

  let category: Category | null;

  if (row.categoryName) {
    category = await prisma.category.upsert({
      where: { slug },
      update: {},
      create: {
        name: row.categoryName,
        slug,
      },
    });
  } else {
    category = await prisma.category.findUnique({
      where: { slug },
    });
  }

  if (!category) {
    throw new Error(`Category "${slug}" does not exist`);
  }

  categoryCache.set(slug, category);

  return category;
}

export async function importProductsFromCsv(
  csvText: string,
): Promise<ProductImportSummary> {
  const parsed = parseProductCsv(csvText);
  const invalidRows = [...parsed.invalidRows];
  const categoryCache = new Map<string, Category>();
  let created = 0;

  for (const { rowNumber, data } of parsed.validRows) {
    try {
      const category = await resolveCategory(data, categoryCache);
      const productSlug = data.slug ?? slugify(data.name);

      if (!productSlug) {
        throw new Error("Slug could not be generated");
      }

      await prisma.product.create({
        data: {
          name: data.name,
          slug: productSlug,
          sku: data.sku,
          description: data.description,
          brand: data.brand,
          weight: data.weight,
          retailPrice: new Prisma.Decimal(data.retailPrice),
          wholesalePrice: data.wholesalePrice
            ? new Prisma.Decimal(data.wholesalePrice)
            : null,
          minimumWholesaleQty: data.minimumWholesaleQty,
          inventory: data.inventory,
          trackInventory: data.trackInventory ?? true,
          isActive: data.isActive ?? true,
          categoryId: category.id,
          images: {
            create: data.imageUrls.map((url, index) => ({
              url,
              sortOrder: index,
              altText: data.name,
            })),
          },
        },
      });

      created += 1;
    } catch (error) {
      invalidRows.push({
        rowNumber,
        row: data as unknown as Record<string, string>,
        errors: [
          isUniqueConstraintError(error)
            ? "A product with this SKU or slug already exists"
            : error instanceof Error
              ? error.message
              : "Unable to create product",
        ],
      });
    }
  }

  return {
    totalRows: parsed.totalRows,
    created,
    skipped: parsed.totalRows - created,
    invalidRows,
  };
}
