import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Prisma } from "@prisma/client";
import { ProductPurchaseOptions } from "@/components/products/product-purchase-options";
import { prisma } from "@/src/lib/prisma";

type ProductDetailsPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const fallbackImage = "/images/fredness-rice.jpeg";

function money(value: Prisma.Decimal) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value));
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: ProductDetailsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findFirst({
    where: {
      slug,
      isActive: true,
    },
    select: {
      name: true,
      description: true,
    },
  });

  if (!product) {
    return {
      title: "Product not found | Frednes International Market",
    };
  }

  return {
    title: `${product.name} | Frednes International Market`,
    description:
      product.description ??
      `Shop ${product.name} from Frednes International Market.`,
    /* TO ADD later:
    openGraph: {
    title,
    description,
    images: [product.images[0]?.url],
  },

  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [product.images[0]?.url],
  }, */
  };
}

export default async function ProductDetailsPage({
  params,
}: ProductDetailsPageProps) {
  const { slug } = await params;
  const product = await prisma.product.findFirst({
    where: {
      slug,
      isActive: true,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      images: {
        orderBy: {
          sortOrder: "asc",
        },
        select: {
          url: true,
          altText: true,
        },
      },
      variants: {
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
        select: {
          id: true,
          label: true,
          sku: true,
          retailPrice: true,
          wholesalePrice: true,
          inventory: true,
          sortOrder: true,
          isActive: true,
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  const images = product.images.length
    ? product.images
    : [{ url: fallbackImage, altText: product.name }];
  const primaryImage = images[0];
  const relatedProducts = await prisma.product.findMany({
    where: {
      isActive: true,
      categoryId: product.categoryId,
      id: {
        not: product.id,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 4,
    include: {
      images: {
        orderBy: {
          sortOrder: "asc",
        },
        take: 1,
        select: {
          url: true,
          altText: true,
        },
      },
    },
  });

  return (
    <main className="bg-gray-50 text-gray-950">
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-5 text-sm text-gray-600">
          <Link
            href="/products"
            className="font-medium text-green-700 hover:text-green-800"
          >
            Products
          </Link>
          <span className="mx-2">/</span>
          <Link
            href={`/products?category=${product.category.slug}`}
            className="font-medium text-green-700 hover:text-green-800"
          >
            {product.category.name}
          </Link>
          <span className="mx-2">/</span>
          <span>{product.name}</span>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <div className="grid gap-4">
          <div
            className="min-h-105 rounded-2xl border border-gray-200 bg-gray-100 bg-cover bg-center shadow-sm"
            style={{ backgroundImage: `url("${primaryImage.url}")` }}
            role="img"
            aria-label={primaryImage.altText ?? product.name}
          />

          {images.length > 1 ? (
            <div className="grid grid-cols-4 gap-3">
              {images.map((image, index) => (
                <div
                  key={`${image.url}-${index}`}
                  className="aspect-square rounded-xl border border-gray-200 bg-gray-100 bg-cover bg-center"
                  style={{ backgroundImage: `url("${image.url}")` }}
                  role="img"
                  aria-label={
                    image.altText ?? `${product.name} image ${index + 1}`
                  }
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className="h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
            {product.category.name}
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            {product.name}
          </h1>

          {product.brand || product.weight ? (
            <p className="mt-3 text-gray-600">
              {[product.brand, product.weight].filter(Boolean).join(" · ")}
            </p>
          ) : null}

          {product.description ? (
            <p className="mt-6 whitespace-pre-line leading-7 text-gray-700">
              {product.description}
            </p>
          ) : (
            <p className="mt-6 leading-7 text-gray-700">
              Available for retail shopping and wholesale inquiries from Frednes
              International Market.
            </p>
          )}

          <ProductPurchaseOptions
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              sku: product.sku,
              imageUrl: primaryImage.url,
              retailPrice: Number(product.retailPrice),
              wholesalePrice: product.wholesalePrice
                ? Number(product.wholesalePrice)
                : null,
              minimumWholesaleQty: product.minimumWholesaleQty,
              inventory: product.inventory,
              trackInventory: product.trackInventory,
            }}
            variants={product.variants.map((variant) => ({
              id: variant.id,
              label: variant.label,
              sku: variant.sku,
              retailPrice: Number(variant.retailPrice),
              wholesalePrice: variant.wholesalePrice
                ? Number(variant.wholesalePrice)
                : null,
              inventory: variant.inventory,
              sortOrder: variant.sortOrder,
              isActive: variant.isActive,
            }))}
          />
        </div>
      </section>

      {relatedProducts.length ? (
        <section className="mx-auto max-w-7xl px-6 pb-14">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Related products</h2>
              <p className="mt-1 text-sm text-gray-600">
                More from {product.category.name}
              </p>
            </div>
            <Link
              href={`/products?category=${product.category.slug}`}
              className="text-sm font-semibold text-green-700 hover:text-green-800"
            >
              View category
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((related) => {
              const image = related.images[0]?.url ?? fallbackImage;

              return (
                <Link
                  key={related.id}
                  href={`/products/${related.slug}`}
                  className="group overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md"
                >
                  <div
                    className="h-40 bg-gray-100 bg-cover bg-center transition duration-300 group-hover:scale-[1.02]"
                    style={{ backgroundImage: `url("${image}")` }}
                    role="img"
                    aria-label={related.images[0]?.altText ?? related.name}
                  />
                  <div className="grid gap-2 p-4">
                    <h3 className="font-semibold text-gray-900">
                      {related.name}
                    </h3>
                    <p className="font-bold text-green-700">
                      {money(related.retailPrice)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}
    </main>
  );
}
