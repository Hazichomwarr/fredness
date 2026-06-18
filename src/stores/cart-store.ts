// src/stores/cart-store.ts
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  imageUrl: string;
  price: number;
  inventory: number;
  trackInventory: boolean;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  subtotal: () => number;
};

function clampQuantity(
  quantity: number,
  item: Pick<CartItem, "trackInventory" | "inventory">,
) {
  const safeQuantity = Math.max(1, Math.floor(quantity));

  if (!item.trackInventory) {
    return safeQuantity;
  }

  return Math.min(safeQuantity, Math.max(item.inventory, 0));
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item, quantity = 1) => {
        if (item.trackInventory && item.inventory <= 0) return;

        set((state) => {
          const existingItem = state.items.find(
            (cartItem) => cartItem.productId === item.productId,
          );

          if (!existingItem) {
            return {
              items: [
                ...state.items,
                {
                  ...item,
                  quantity: clampQuantity(quantity, item),
                },
              ],
            };
          }

          return {
            items: state.items.map((cartItem) =>
              cartItem.productId === item.productId
                ? {
                    ...cartItem,
                    ...item,
                    quantity: clampQuantity(cartItem.quantity + quantity, item),
                  }
                : cartItem,
            ),
          };
        });
      },
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },
      updateQuantity: (productId, quantity) => {
        set((state) => ({
          items: state.items.flatMap((item) => {
            if (item.productId !== productId) return [item];
            if (quantity <= 0) return [];

            return [
              {
                ...item,
                quantity: clampQuantity(quantity, item),
              },
            ];
          }),
        }));
      },
      clearCart: () => set({ items: [] }),
      totalItems: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),
      subtotal: () =>
        get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0,
        ),
    }),
    {
      name: "frednes-cart",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
