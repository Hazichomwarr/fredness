import Link from "next/link";
import { Prisma } from "@prisma/client";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { FALLBACK_IMAGE_URL } from "@/src/lib/images";
import { prisma } from "@/src/lib/prisma";

function money(value: Prisma.Decimal) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value));
}

export default async function FeaturedProducts() {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 6,
    include: {
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
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
      variants: {
        where: {
          isActive: true,
        },
        orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
        take: 1,
        select: {
          id: true,
          label: true,
          retailPrice: true,
          inventory: true,
          sku: true,
        },
      },
    },
  });

  if (!products.length) {
    return null;
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Featured Products
          </h2>
          <p className="text-gray-600 mt-3">
            Recently added products available from Frednes Market
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 mt-12 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const image = product.images[0];
            const firstVariant = product.variants[0];
            const price = firstVariant?.retailPrice ?? product.retailPrice;
            const imageUrl = image?.url ?? FALLBACK_IMAGE_URL;

            return (
              <article
                key={product.id}
                className="group overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200 transition hover:shadow-md"
              >
                <Link
                  href={`/products/${product.slug}`}
                  aria-label={product.name}
                >
                  <div
                    role="img"
                    aria-label={image?.altText ?? product.name}
                    style={{
                      backgroundImage: `url("${imageUrl}")`,
                    }}
                    className="h-48 bg-gray-100 bg-cover bg-center transition duration-300 group-hover:scale-[1.02]"
                  />
                </Link>
                <div className="grid gap-3 p-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                      {product.category.name}
                    </p>
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="mt-1 text-lg font-semibold text-gray-900 hover:text-green-800">
                        {product.name}
                      </h3>
                    </Link>
                  </div>
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <p className="text-xl font-bold text-green-700">
                      {firstVariant ? "From " : ""}
                      {money(price)}
                    </p>
                    {firstVariant ? (
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                        {firstVariant.label}
                      </span>
                    ) : null}
                  </div>
                  <div className="grid gap-2 pt-1 sm:grid-cols-2">
                    <AddToCartButton
                      item={{
                        productId: product.id,
                        variantId: firstVariant?.id,
                        variantLabel: firstVariant?.label,
                        slug: product.slug,
                        name: product.name,
                        sku: firstVariant?.sku ?? product.sku,
                        imageUrl,
                        price: Number(price),
                        inventory: firstVariant?.inventory ?? product.inventory,
                        trackInventory: product.trackInventory,
                      }}
                      className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                      disabled={
                        product.trackInventory &&
                        (firstVariant?.inventory ?? product.inventory) <= 0
                      }
                    />
                    <Link
                      href={`/products/${product.slug}`}
                      className="rounded-lg border border-green-700 px-4 py-2 text-center text-sm font-semibold text-green-800 transition hover:bg-green-50"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
