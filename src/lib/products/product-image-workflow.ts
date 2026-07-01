import "server-only";

import { Prisma } from "@prisma/client";

import { FALLBACK_IMAGE_URL } from "@/src/lib/images";
import { prisma } from "@/src/lib/prisma";

const FALLBACK_IMAGE_MARKER = "african-best-fallback.png";

export const PRODUCT_IMAGE_UPLOAD_PAGE_SIZE = 25;

export function isFallbackProductImageUrl(url: string) {
  return url === FALLBACK_IMAGE_URL || url.includes(FALLBACK_IMAGE_MARKER);
}

function buildMissingImagesWhere(query: string): Prisma.ProductWhereInput {
  const missingImagesWhere: Prisma.ProductWhereInput = {
    OR: [
      { images: { none: {} } },
      {
        AND: [
          { images: { some: {} } },
          { images: { every: { url: { contains: FALLBACK_IMAGE_MARKER } } } },
        ],
      },
    ],
  };

  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return missingImagesWhere;
  }

  return {
    AND: [
      missingImagesWhere,
      {
        OR: [
          { name: { contains: normalizedQuery, mode: "insensitive" } },
          { sku: { contains: normalizedQuery, mode: "insensitive" } },
        ],
      },
    ],
  };
}

type GetProductsMissingImagesOptions = {
  query?: string;
  page?: number;
  pageSize?: number;
};

export async function getProductsMissingImages({
  query = "",
  page = 1,
  pageSize = PRODUCT_IMAGE_UPLOAD_PAGE_SIZE,
}: GetProductsMissingImagesOptions = {}) {
  const safePage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
  const safePageSize = Math.max(1, Math.floor(pageSize));
  const where = buildMissingImagesWhere(query);

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: [{ name: "asc" }],
      skip: (safePage - 1) * safePageSize,
      take: safePageSize,
      select: {
        id: true,
        name: true,
        sku: true,
        slug: true,
        brand: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          select: {
            id: true,
            url: true,
            altText: true,
            sortOrder: true,
          },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    total,
    page: safePage,
    pageSize: safePageSize,
    pageCount: Math.max(1, Math.ceil(total / safePageSize)),
  };
}

type AddUploadedProductImagesOptions = {
  productId: string;
  imageUrls: string[];
};

export async function addUploadedProductImages({
  productId,
  imageUrls,
}: AddUploadedProductImagesOptions) {
  const uniqueUrls = [
    ...new Set(imageUrls.map((url) => url.trim()).filter(Boolean)),
  ];

  if (uniqueUrls.length === 0) {
    throw new Error("No image URLs provided.");
  }

  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        slug: true,
        images: {
          select: {
            id: true,
            url: true,
            sortOrder: true,
          },
        },
      },
    });

    if (!product) {
      throw new Error("Product not found.");
    }

    await tx.productImage.deleteMany({
      where: {
        productId,
        url: { contains: FALLBACK_IMAGE_MARKER },
      },
    });

    const realImages = product.images.filter(
      (image) => !isFallbackProductImageUrl(image.url),
    );
    const existingUrls = new Set(realImages.map((image) => image.url));
    const maxSortOrder = realImages.reduce(
      (max, image) => Math.max(max, image.sortOrder),
      -1,
    );
    const imageRows = uniqueUrls
      .filter((url) => !existingUrls.has(url))
      .map((url, index) => ({
        productId,
        url,
        altText: product.name,
        sortOrder: maxSortOrder + index + 1,
      }));

    if (imageRows.length > 0) {
      await tx.productImage.createMany({
        data: imageRows,
      });
    }

    return {
      id: product.id,
      slug: product.slug,
      addedCount: imageRows.length,
    };
  });
}
