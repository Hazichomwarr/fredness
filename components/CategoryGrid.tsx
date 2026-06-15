// _components/CategoryGrid.tsx

import Image from "next/image";

const categories = [
  {
    name: "Proteins",
    image: "/images/categories/fredness-proteins.jpg",
  },
  {
    name: "Grains & Rice",
    image: "/images/categories/fredness-bulk-rice.jpg",
  },
  {
    name: "Spices",
    image: "/images/categories/fredness-spices.jpg",
  },
  {
    name: "Drinks",
    image: "/images/categories/fredness-drinks.jpg",
  },
  {
    name: "Vegetables",
    image: "/images/categories/fredness-vegetables.jpg",
  },
  {
    name: "Snacks",
    image: "/images/categories/fredness-snacks.jpg",
  },
];

export default function CategoryGrid() {
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
          {categories.map((category, index) => (
            <div
              key={index}
              className="group cursor-pointer bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
            >
              <div className="overflow-hidden">
                <Image
                  src={category.image}
                  alt={category.name}
                  className="h-40 w-full object-cover group-hover:scale-105 transition duration-300 bg-linear-to-t from-black/40 to-transparent"
                />
              </div>

              <div className="p-4 text-center">
                <h3 className="text-lg font-semibold text-gray-800">
                  {category.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
