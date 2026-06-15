// components/BundlesSection.tsx

import BundleCard from "./BundleCard";

const bundles = [
  {
    id: "1",
    name: "Jollof Rice Kit",
    description: "Everything you need to cook authentic jollof rice",
    price: 45,
    image: "/images/bundles/jollof.jpg",
    items: [
      "Long Grain Rice",
      "Tomato Paste",
      "Maggi Seasoning",
      "Vegetable Oil",
    ],
  },
  {
    id: "2",
    name: "Egusi Soup Kit",
    description: "Traditional egusi soup ingredients in one pack",
    price: 50,
    image: "/images/bundles/egusi.jpg",
    items: ["Egusi Seeds", "Palm Oil", "Dry Fish", "Seasoning Cubes"],
  },
  {
    id: "3",
    name: "Fufu & Soup Combo",
    description: "Perfect combo for a full African meal",
    price: 40,
    image: "/images/bundles/fufu.jpg",
    items: ["Fufu Flour", "Soup Ingredients", "Palm Oil", "Spices"],
  },
];

export default function BundlesSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* HEADER */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Cook Tonight 🍲</h2>
          <p className="text-gray-600 mt-3">
            Get everything you need for your favorite meals in one bundle
          </p>
        </div>

        {/* GRID */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {bundles.map((bundle) => (
            <BundleCard key={bundle.id} bundle={bundle} />
          ))}
        </div>
      </div>
    </section>
  );
}
