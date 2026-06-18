// components/cart-link.tsx
"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/src/stores/cart-store";

export function CartLink() {
  const totalItems = useCartStore((state) => state.totalItems());

  return (
    <Link
      href="/cart"
      className="relative inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
      aria-label={totalItems > 0 ? `Cart with ${totalItems} items` : "Cart"}
    >
      <ShoppingCart aria-hidden="true" className="h-4 w-4" strokeWidth={2.2} />
      <span>Cart</span>
      {totalItems > 0 ? (
        <span className="rounded-full bg-green-700 px-2 py-0.5 text-xs font-bold text-white">
          {totalItems}
        </span>
      ) : null}
    </Link>
  );
}
