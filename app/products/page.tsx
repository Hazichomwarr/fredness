// app/products/page.tsx
import Link from "next/link";
import { Prisma } from "@/app/generated/prisma";
import { prisma } from "@/src/lib/prisma";

type ProductsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const pageSize = 24;
const fallbackImage = "/images/fredness-rice.jpeg";

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function money(value: Prisma.Decimal) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value));
}

function productPageHref({
  q,
  category,
  page,
}: {
  q: string;
  category: string;
  page: number;
}) {
  const params = new URLSearchParams();

  if (q) params.set("q", q);
  if (category) params.set("category", category);
  if (page > 1) params.set("page", String(page));

  const query = params.toString();
  return query ? `/products?${query}` : "/products";
}

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = (await searchParams) ?? {};
  const q = firstParam(params.q)?.trim() ?? "";
  const category = firstParam(params.category)?.trim() ?? "";
  const page = Math.max(Number(firstParam(params.page) ?? "1") || 1, 1);

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(category
      ? {
          category: {
            slug: category,
          },
        }
      : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { sku: { contains: q, mode: "insensitive" } },
            { brand: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { category: { name: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
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
      },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        name: true,
        slug: true,
      },
    }),
  ]);

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const activeCategory = categories.find((item) => item.slug === category);

  return (
    <main className="bg-gray-50 text-gray-950">
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
              Frednes Market
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight">
              African and Caribbean groceries
            </h1>
            <p className="mt-3 max-w-2xl text-gray-600">
              Browse retail products, filter by category, or search by name,
              brand, SKU, and ingredients.
            </p>
          </div>

          <form className="flex flex-wrap gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search rice, yam, malt, spices..."
              className="min-w-72 flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
            />
            {category ? (
              <input type="hidden" name="category" value={category} />
            ) : null}
            <button className="rounded-lg bg-green-700 px-5 py-2 text-sm font-semibold text-white hover:bg-green-800">
              Search
            </button>
          </form>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Categories
          </h2>
          <nav className="mt-4 grid gap-1">
            <Link
              href={productPageHref({ q, category: "", page: 1 })}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                category
                  ? "text-gray-700 hover:bg-gray-50"
                  : "bg-green-50 text-green-800"
              }`}
            >
              All products
            </Link>
            {categories.map((item) => (
              <Link
                key={item.slug}
                href={productPageHref({ q, category: item.slug, page: 1 })}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  category === item.slug
                    ? "bg-green-50 text-green-800"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="grid gap-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold">
                {activeCategory ? activeCategory.name : "All products"}
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                {total} {total === 1 ? "product" : "products"} found
                {q ? ` for "${q}"` : ""}
              </p>
            </div>
            {q || category ? (
              <Link
                href="/products"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-white"
              >
                Clear filters
              </Link>
            ) : null}
          </div>

          {products.length ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => {
                const image = product.images[0]?.url ?? fallbackImage;

                return (
                  <article
                    key={product.id}
                    className="group overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md"
                  >
                    <div
                      className="h-52 bg-gray-100 bg-cover bg-center transition duration-300 group-hover:scale-[1.02]"
                      style={{ backgroundImage: `url("${image}")` }}
                      role="img"
                      aria-label={product.images[0]?.altText ?? product.name}
                    />
                    <div className="grid gap-3 p-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                          {product.category.name}
                        </p>
                        <h3 className="mt-1 text-lg font-semibold text-gray-900">
                          {product.name}
                        </h3>
                        {product.brand || product.weight ? (
                          <p className="mt-1 text-sm text-gray-500">
                            {[product.brand, product.weight]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        ) : null}
                      </div>

                      <div className="flex items-end justify-between gap-3">
                        <div>
                          <p className="text-xl font-bold text-green-700">
                            {money(product.retailPrice)}
                          </p>
                          {product.wholesalePrice ? (
                            <p className="text-xs text-gray-500">
                              Wholesale from {money(product.wholesalePrice)}
                            </p>
                          ) : null}
                        </div>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            product.trackInventory && product.inventory <= 0
                              ? "bg-red-50 text-red-700"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {product.trackInventory && product.inventory <= 0
                            ? "Out of stock"
                            : "In stock"}
                        </span>
                      </div>

                      <button className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-800">
                        Add to Cart
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center">
              <h3 className="text-xl font-semibold">No products found</h3>
              <p className="mt-2 text-gray-600">
                Try a different search term or category.
              </p>
            </div>
          )}

          {pageCount > 1 ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
              <span>
                Page {page} of {pageCount}
              </span>
              <div className="flex gap-2">
                <Link
                  href={productPageHref({
                    q,
                    category,
                    page: Math.max(1, page - 1),
                  })}
                  aria-disabled={page <= 1}
                  className={`rounded-lg border border-gray-300 px-3 py-2 font-semibold ${
                    page <= 1
                      ? "pointer-events-none opacity-40"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Previous
                </Link>
                <Link
                  href={productPageHref({
                    q,
                    category,
                    page: Math.min(pageCount, page + 1),
                  })}
                  aria-disabled={page >= pageCount}
                  className={`rounded-lg border border-gray-300 px-3 py-2 font-semibold ${
                    page >= pageCount
                      ? "pointer-events-none opacity-40"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Next
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
