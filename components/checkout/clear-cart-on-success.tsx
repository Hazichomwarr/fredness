// components/checkout/clear-cart-on-success.tsx
"use client";

import { useEffect } from "react";
import { useCartStore } from "@/src/stores/cart-store";

export function ClearCartOnSuccess() {
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return null;
}
