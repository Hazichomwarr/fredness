// _components/ProductCard.tsx

import Image from "next/image";

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  unit?: string; // e.g. "per bag", "per lb"
};

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden group">
      {/* IMAGE */}
      <div className="overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          className="h-44 w-full object-cover group-hover:scale-105 transition duration-300"
        />
      </div>

      {/* CONTENT */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>

        <p className="text-green-700 font-bold mt-2">
          ${product.price}{" "}
          <span className="text-sm text-gray-500 font-normal">
            {product.unit}
          </span>
        </p>

        <button className="mt-4 w-full bg-green-700 text-white py-2 rounded-lg font-medium hover:bg-green-800 transition">
          Add to Cart
        </button>
      </div>
    </div>
  );
}
