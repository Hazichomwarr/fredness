import Link from "next/link";
import { notFound } from "next/navigation";
import { updateCategoryAction } from "@/app/admin/categories/actions";
import { requireAdmin } from "@/src/lib/auth/admin";
import { prisma } from "@/src/lib/prisma";

type EditCategoryPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  await requireAdmin();

  const { id } = await params;
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  if (!category) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-10 text-neutral-950 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-3xl gap-6">
        <div>
          <Link
            href="/admin/categories"
            className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
          >
            Back to categories
          </Link>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">
            Edit {category.name}
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            {category._count.products} products currently use this category.
          </p>
        </div>

        <form
          action={updateCategoryAction}
          className="grid gap-4 rounded-lg border border-neutral-200 bg-white p-4"
        >
          <input type="hidden" name="id" value={category.id} />
          <label className="grid gap-1 text-sm font-medium text-neutral-700">
            Name
            <input
              name="name"
              defaultValue={category.name}
              className="rounded-md border border-neutral-300 px-3 py-2 font-normal"
              required
            />
          </label>
          <label className="grid gap-1 text-sm font-medium text-neutral-700">
            Slug
            <input
              name="slug"
              defaultValue={category.slug}
              className="rounded-md border border-neutral-300 px-3 py-2 font-normal"
              required
            />
          </label>
          <label className="grid gap-1 text-sm font-medium text-neutral-700">
            Image URL
            <input
              name="imageUrl"
              defaultValue={category.imageUrl ?? ""}
              className="rounded-md border border-neutral-300 px-3 py-2 font-normal"
            />
          </label>
          <label className="grid gap-1 text-sm font-medium text-neutral-700">
            Sort order
            <input
              name="sortOrder"
              type="number"
              min="0"
              defaultValue={category.sortOrder}
              className="rounded-md border border-neutral-300 px-3 py-2 font-normal"
            />
          </label>
          <label className="grid gap-1 text-sm font-medium text-neutral-700">
            Description
            <textarea
              name="description"
              rows={4}
              defaultValue={category.description ?? ""}
              className="rounded-md border border-neutral-300 px-3 py-2 font-normal"
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-md bg-neutral-950 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800">
              Save changes
            </button>
            <Link
              href="/admin/categories"
              className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
