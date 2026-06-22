// app/admin/products/new/page.tsx
import Link from "next/link";
import { ProductForm } from "@/components/admin/product-form";
import { requireAdmin } from "@/src/lib/auth/admin";
import { prisma } from "@/src/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  await requireAdmin();

  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-10 text-neutral-950 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-4xl gap-6">
        <div>
          <Link
            href="/admin/products"
            className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
          >
            Back to products
          </Link>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">
            Create product
          </h1>
          {!categories.length ? (
            <p className="mt-2 text-sm text-red-700">
              Create at least one category before adding products.
            </p>
          ) : null}
        </div>

        <ProductForm categories={categories} />
      </div>
    </main>
  );
}
