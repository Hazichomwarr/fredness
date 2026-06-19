// components/cart-link.tsx
"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { useCartStore } from "@/src/stores/cart-store";

function subscribe() {
  return () => {};
}

function clientSnapshot() {
  return true;
}

function serverSnapshot() {
  return false;
}

export function CartLink() {
  const isHydrated = useSyncExternalStore(
    subscribe,
    clientSnapshot,
    serverSnapshot,
  );
  const totalItems = useCartStore((state) => state.totalItems());
  const displayedTotal = isHydrated ? totalItems : 0;

  return (
    <Link
      href="/cart"
      className="relative inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
      aria-label={
        displayedTotal > 0 ? `Cart with ${displayedTotal} items` : "Cart"
      }
    >
      <ShoppingCart aria-hidden="true" className="h-4 w-4" strokeWidth={2.2} />
      <span>Cart</span>
      {displayedTotal > 0 ? (
        <span className="rounded-full bg-green-700 px-2 py-0.5 text-xs font-bold text-white">
          {displayedTotal}
        </span>
      ) : null}
    </Link>
  );
}
