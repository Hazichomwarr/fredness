// app/quote/page.tsx
import Link from "next/link";
import { Prisma } from "@prisma/client";
import {
  QuoteRequestForm,
  QuoteRequestProduct,
} from "@/components/quote/quote-request-form";
import { prisma } from "@/src/lib/prisma";

type QuotePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const fallbackImage = "/images/fredness-rice.jpeg";
const pageSize = 80;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function quoteHref({
  product,
  q,
  category,
}: {
  product: string;
  q: string;
  category: string;
}) {
  const params = new URLSearchParams();

  if (product) params.set("product", product);
  if (q) params.set("q", q);
  if (category) params.set("category", category);

  const query = params.toString();
  return query ? `/quote?${query}` : "/quote";
}

function productWhere({
  q,
  category,
}: {
  q: string;
  category: string;
}): Prisma.ProductWhereInput {
  return {
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
            { category: { name: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };
}

export const dynamic = "force-dynamic";

export default async function QuotePage({ searchParams }: QuotePageProps) {
  const params = (await searchParams) ?? {};
  const selectedSlug = firstParam(params.product)?.trim() ?? "";
  const q = firstParam(params.q)?.trim() ?? "";
  const category = firstParam(params.category)?.trim() ?? "";
  const error = firstParam(params.error);

  const where = productWhere({ q, category });
  const [products, selectedProduct, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: [{ name: "asc" }],
      take: pageSize,
      include: {
        images: {
          orderBy: {
            sortOrder: "asc",
          },
          take: 1,
          select: {
            url: true,
          },
        },
      },
    }),
    selectedSlug
      ? prisma.product.findFirst({
          where: {
            slug: selectedSlug,
            isActive: true,
          },
          include: {
            images: {
              orderBy: {
                sortOrder: "asc",
              },
              take: 1,
              select: {
                url: true,
              },
            },
          },
        })
      : null,
    prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        name: true,
        slug: true,
      },
    }),
  ]);

  const mergedProducts = selectedProduct
    ? [
        selectedProduct,
        ...products.filter((product) => product.id !== selectedProduct.id),
      ]
    : products;
  const quoteProducts: QuoteRequestProduct[] = mergedProducts.map(
    (product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      slug: product.slug,
      imageUrl: product.images[0]?.url ?? fallbackImage,
      wholesalePrice: product.wholesalePrice
        ? Number(product.wholesalePrice)
        : null,
      minimumWholesaleQty: product.minimumWholesaleQty,
    }),
  );

  return (
    <main className="bg-gray-50 text-gray-950">
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
              Wholesale
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight">
              Request a wholesale quote
            </h1>
            <p className="mt-3 max-w-2xl text-gray-600">
              Send your business details and product quantities. Frednes will
              follow up with pricing, availability, and next steps.
            </p>
          </div>

          <form className="grid gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 md:grid-cols-[1fr_220px_auto]">
            {selectedSlug ? (
              <input type="hidden" name="product" value={selectedSlug} />
            ) : null}
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search products for quote..."
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
            />
            <select
              name="category"
              defaultValue={category}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
            >
              <option value="">All categories</option>
              {categories.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
            <button className="rounded-lg bg-green-700 px-5 py-2 text-sm font-semibold text-white hover:bg-green-800">
              Filter
            </button>
          </form>

          {q || category ? (
            <Link
              href={quoteHref({ product: selectedSlug, q: "", category: "" })}
              className="justify-self-start text-sm font-semibold text-green-700 hover:text-green-800"
            >
              Clear quote filters
            </Link>
          ) : null}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-6 py-10">
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error === "products"
              ? "One or more selected products are no longer available."
              : "Please check the quote form and try again."}
          </div>
        ) : null}

        <QuoteRequestForm
          products={quoteProducts}
          selectedProductId={selectedProduct?.id}
        />
      </section>
    </main>
  );
}
