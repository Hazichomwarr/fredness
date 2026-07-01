import Link from "next/link";

import { FALLBACK_IMAGE_URL } from "@/src/lib/images";
import { prisma } from "@/src/lib/prisma";

export const dynamic = "force-dynamic";

function categoryDescription(name: string, description: string | null) {
  return (
    description ??
    `Browse ${name.toLowerCase()} products from Frednes International Market.`
  );
}

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      imageUrl: true,
      _count: {
        select: {
          products: {
            where: {
              isActive: true,
            },
          },
        },
      },
    },
  });

  return (
    <main className="bg-gray-50 text-gray-950">
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-6 px-6 py-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
              Frednes Market
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight">
              Shop by category
            </h1>
            <p className="mt-3 max-w-2xl text-gray-600">
              Browse African and Caribbean grocery categories, then jump
              straight into matching products.
            </p>
          </div>
          <Link
            href="/products"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            View all products
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        {categories.length ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="group overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="overflow-hidden">
                  <div
                    role="img"
                    aria-label={category.name}
                    style={{
                      backgroundImage: `url("${category.imageUrl ?? FALLBACK_IMAGE_URL}")`,
                    }}
                    className="h-48 w-full bg-gray-100 bg-cover bg-center transition duration-300 group-hover:scale-105"
                  />
                </div>

                <div className="grid min-h-48 gap-4 p-5">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {category.name}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-gray-600">
                      {categoryDescription(category.name, category.description)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-3 self-end border-t border-gray-100 pt-4">
                    <p className="text-sm font-medium text-gray-500">
                      {category._count.products}{" "}
                      {category._count.products === 1 ? "product" : "products"}
                    </p>
                    <span className="text-sm font-semibold text-green-700 group-hover:text-green-800">
                      View products
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900">
              No categories yet
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Categories will appear here once they are added to the catalog.
            </p>
            <Link
              href="/products"
              className="mt-5 inline-flex rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-800"
            >
              Browse products
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
