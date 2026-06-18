// components/BundleCard.tsx

import Image from "next/image";

type Bundle = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  items: string[];
};

export default function BundleCard({ bundle }: { bundle: Bundle }) {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden group">
      {/* IMAGE */}
      <div className="relative">
        <Image
          src={bundle.image}
          alt={bundle.name}
          width={200}
          height={50}
          className="h-48 w-full object-cover group-hover:scale-105 transition duration-300"
        />

        <span className="absolute top-2 left-2 bg-yellow-400 text-green-900 text-xs font-semibold px-2 py-1 rounded">
          Meal Kit
        </span>
      </div>

      {/* CONTENT */}
      <div className="p-5">
        <h3 className="text-xl font-semibold text-gray-900">{bundle.name}</h3>

        <p className="text-gray-600 mt-2 text-sm">{bundle.description}</p>

        {/* ITEMS */}
        <ul className="mt-3 text-sm text-gray-500 space-y-1">
          {bundle.items.map((item, index) => (
            <li key={index}>• {item}</li>
          ))}
        </ul>

        {/* PRICE */}
        <p className="mt-4 text-green-700 font-bold text-lg">${bundle.price}</p>

        {/* CTA */}
        <button className="mt-4 w-full bg-green-700 text-white py-2 rounded-lg font-medium hover:bg-green-800 transition">
          Buy Bundle
        </button>
      </div>
    </div>
  );
}
