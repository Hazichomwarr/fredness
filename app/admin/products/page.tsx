// app/admin/products/page.tsx
import Link from "next/link";
import { Prisma } from "@prisma/client";
import {
  ProductsTable,
  AdminProductRow,
} from "@/components/admin/products-table";
import { prisma } from "@/src/lib/prisma";

type ProductsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const pageSize = 25;
const sortableFields = new Set([
  "name",
  "sku",
  "retailPrice",
  "inventory",
  "createdAt",
]);

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function toProductRow(product: {
  id: string;
  name: string;
  sku: string;
  retailPrice: Prisma.Decimal;
  wholesalePrice: Prisma.Decimal | null;
  inventory: number;
  isActive: boolean;
  createdAt: Date;
  category: { name: string };
}): AdminProductRow {
  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    categoryName: product.category.name,
    retailPrice: product.retailPrice.toString(),
    wholesalePrice: product.wholesalePrice?.toString() ?? null,
    inventory: product.inventory,
    isActive: product.isActive,
    createdAt: product.createdAt.toISOString(),
  };
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = (await searchParams) ?? {};
  const query = firstParam(params.q)?.trim() ?? "";
  const page = Math.max(Number(firstParam(params.page) ?? "1") || 1, 1);
  const sortParam = firstParam(params.sort) ?? "createdAt";
  const sort = sortableFields.has(sortParam) ? sortParam : "createdAt";
  const direction = firstParam(params.direction) === "asc" ? "asc" : "desc";

  const where: Prisma.ProductWhereInput = query
    ? {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { sku: { contains: query, mode: "insensitive" } },
          { brand: { contains: query, mode: "insensitive" } },
          { category: { name: { contains: query, mode: "insensitive" } } },
        ],
      }
    : {};

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        [sort]: direction,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-10 text-neutral-950 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
              Admin
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Products</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/products/new"
              className="rounded-md bg-neutral-950 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
            >
              Create product
            </Link>
            <form
              action="/api/admin/products/import"
              method="post"
              encType="multipart/form-data"
              className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-200 bg-white p-3"
            >
              <input
                name="file"
                type="file"
                accept=".csv,text/csv"
                className="max-w-64 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-neutral-950 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
                required
              />
              <button className="rounded-md border border-neutral-300 px-3 py-2 text-sm font-semibold hover:bg-neutral-50">
                Import CSV
              </button>
            </form>
          </div>
        </div>

        <form className="flex flex-wrap gap-3 rounded-lg border border-neutral-200 bg-white p-4">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search name, SKU, brand, or category"
            className="min-w-72 flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-950"
          />
          <input type="hidden" name="sort" value={sort} />
          <input type="hidden" name="direction" value={direction} />
          <button className="rounded-md bg-neutral-950 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 cursor-pointer">
            Search
          </button>
        </form>

        <ProductsTable
          products={products.map(toProductRow)}
          page={page}
          pageSize={pageSize}
          total={total}
          sort={sort}
          direction={direction}
        />
      </div>
    </main>
  );
}
