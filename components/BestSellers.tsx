// components/BestSellers.tsx

import ProductCard from "./ProductCard";

const bestSellers = [
  {
    id: "1",
    name: "Premium Long Grain Rice",
    price: 25,
    unit: "per bag",
    image: "/images/fredness-rice.jpeg",
  },
  {
    id: "2",
    name: "Fresh Yam Tubers",
    price: 8,
    unit: "each",
    image: "/images/fredness-yam.jpg",
  },
  {
    id: "3",
    name: "Smoked Fish",
    price: 15,
    unit: "per pack",
    image: "/images/fredness-fish2.jpg",
  },
  {
    id: "4",
    name: "Vitamalt Drink",
    price: 12,
    unit: "per pack",
    image: "/images/fredness-malt2.jpg",
  },
  {
    id: "5",
    name: "Garri (Cassava Flour)",
    price: 10,
    unit: "per bag",
    image: "/images/fredness-rice.jpeg",
  },
  {
    id: "6",
    name: "Palm Oil",
    price: 18,
    unit: "per bottle",
    image: "/images/fredness-malt2.jpg",
  },
];

export default function BestSellers() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* TITLE */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Best Sellers 🔥</h2>
          <p className="text-gray-600 mt-3">
            Most popular products our customers love
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-12">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
