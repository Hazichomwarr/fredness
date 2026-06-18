//
"use client";

import { useState } from "react";
import { CartItem, useCartStore } from "@/src/stores/cart-store";

type AddToCartButtonProps = {
  item: Omit<CartItem, "quantity">;
  disabled?: boolean;
  className?: string;
};

export function AddToCartButton({
  item,
  disabled = false,
  className,
}: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [added, setAdded] = useState(false);

  return (
    <button
      className={
        className ??
        "rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
      }
      disabled={disabled}
      onClick={() => {
        addItem(item);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1400);
      }}
    >
      {added ? "Added" : "Add to Cart"}
    </button>
  );
}
