import Link from "next/link";
import { FALLBACK_IMAGE_URL } from "@/src/lib/images";
import { prisma } from "@/src/lib/prisma";

export default async function CategoryGrid() {
  const activeProductCount = await prisma.product.count({
    where: {
      isActive: true,
    },
  });
  const categories = await prisma.category.findMany({
    where: activeProductCount
      ? {
          products: {
            some: {
              isActive: true,
            },
          },
        }
      : undefined,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
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

  if (!categories.length) {
    return null;
  }

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-gray-900 text-center">
          Shop by Category
        </h2>

        <p className="text-gray-600 text-center mt-3">
          Find what you need quickly and easily
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-12">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="group cursor-pointer bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
            >
              <div className="overflow-hidden">
                <div
                  role="img"
                  aria-label={category.name}
                  style={{
                    backgroundImage: `url("${category.imageUrl ?? FALLBACK_IMAGE_URL}")`,
                  }}
                  className="h-40 w-full bg-gray-100 bg-cover bg-center transition duration-300 group-hover:scale-105"
                />
              </div>

              <div className="p-4 text-center">
                <h3 className="text-lg font-semibold text-gray-800">
                  {category.name}
                </h3>
                {activeProductCount ? (
                  <p className="mt-1 text-sm text-gray-500">
                    {category._count.products}{" "}
                    {category._count.products === 1 ? "product" : "products"}
                  </p>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
