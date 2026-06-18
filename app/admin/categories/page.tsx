import Link from "next/link";
import {
  createCategoryAction,
  deleteCategoryAction,
} from "@/app/admin/categories/actions";
import { CategoryDeleteButton } from "@/components/admin/category-delete-button";
import { prisma } from "@/src/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-10 text-neutral-950 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Admin
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Categories</h1>
        </div>

        <section className="rounded-lg border border-neutral-200 bg-white p-4">
          <h2 className="text-lg font-semibold">Create category</h2>
          <form
            action={createCategoryAction}
            className="mt-4 grid gap-4 md:grid-cols-2"
          >
            <label className="grid gap-1 text-sm font-medium text-neutral-700">
              Name
              <input
                name="name"
                className="rounded-md border border-neutral-300 px-3 py-2 font-normal"
                required
              />
            </label>
            <label className="grid gap-1 text-sm font-medium text-neutral-700">
              Slug
              <input
                name="slug"
                className="rounded-md border border-neutral-300 px-3 py-2 font-normal"
                placeholder="Generated from name if blank"
              />
            </label>
            <label className="grid gap-1 text-sm font-medium text-neutral-700">
              Image URL
              <input
                name="imageUrl"
                className="rounded-md border border-neutral-300 px-3 py-2 font-normal"
              />
            </label>
            <label className="grid gap-1 text-sm font-medium text-neutral-700">
              Sort order
              <input
                name="sortOrder"
                type="number"
                min="0"
                defaultValue="0"
                className="rounded-md border border-neutral-300 px-3 py-2 font-normal"
              />
            </label>
            <label className="grid gap-1 text-sm font-medium text-neutral-700 md:col-span-2">
              Description
              <textarea
                name="description"
                rows={3}
                className="rounded-md border border-neutral-300 px-3 py-2 font-normal"
              />
            </label>
            <div className="md:col-span-2">
              <button className="rounded-md bg-neutral-950 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800">
                Create category
              </button>
            </div>
          </form>
        </section>

        <section className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-215 border-collapse text-left text-sm">
              <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
                <tr>
                  <th className="border-b border-neutral-200 px-4 py-3">
                    Name
                  </th>
                  <th className="border-b border-neutral-200 px-4 py-3">
                    Slug
                  </th>
                  <th className="border-b border-neutral-200 px-4 py-3">
                    Products
                  </th>
                  <th className="border-b border-neutral-200 px-4 py-3">
                    Sort
                  </th>
                  <th className="border-b border-neutral-200 px-4 py-3">
                    Updated
                  </th>
                  <th className="border-b border-neutral-200 px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {categories.length ? (
                  categories.map((category) => (
                    <tr
                      key={category.id}
                      className="border-b border-neutral-100 last:border-0"
                    >
                      <td className="px-4 py-4 align-top">
                        <p className="font-medium text-neutral-950">
                          {category.name}
                        </p>
                        {category.description ? (
                          <p className="mt-1 line-clamp-2 text-xs text-neutral-500">
                            {category.description}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-4 py-4 align-top text-neutral-600">
                        {category.slug}
                      </td>
                      <td className="px-4 py-4 align-top text-neutral-600">
                        {category._count.products}
                      </td>
                      <td className="px-4 py-4 align-top text-neutral-600">
                        {category.sortOrder}
                      </td>
                      <td className="px-4 py-4 align-top text-neutral-600">
                        {category.updatedAt.toLocaleDateString("en-US")}
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/categories/${category.id}/edit`}
                            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
                          >
                            Edit
                          </Link>
                          <form action={deleteCategoryAction}>
                            <input
                              type="hidden"
                              name="id"
                              value={category.id}
                            />
                            <CategoryDeleteButton
                              categoryName={category.name}
                              disabled={category._count.products > 0}
                            />
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      className="px-4 py-10 text-center text-neutral-500"
                      colSpan={6}
                    >
                      No categories yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
