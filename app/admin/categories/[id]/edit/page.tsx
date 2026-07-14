import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryEditForm } from "@/components/admin/category-edit-form";
import { requireAdmin } from "@/src/lib/auth/admin";
import { FALLBACK_IMAGE_URL } from "@/src/lib/images";
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

        <CategoryEditForm
          category={{
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description,
            imageUrl: category.imageUrl,
            sortOrder: category.sortOrder,
          }}
          fallbackImageUrl={FALLBACK_IMAGE_URL}
        />
      </div>
    </main>
  );
}
