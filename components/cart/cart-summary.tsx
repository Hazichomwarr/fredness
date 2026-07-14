// src/components/cart/cart-summary.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckoutButton } from "@/components/checkout/checkout-button";
import {
  cartItemId,
  type CartItem,
  useCartStore,
} from "@/src/stores/cart-store";

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function CartQuantityControl({ item }: { item: CartItem }) {
  const itemId = cartItemId(item);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const [draftQuantity, setDraftQuantity] = useState<string | null>(null);

  function restoreQuantity() {
    setDraftQuantity(null);
  }

  function commitQuantity(value: string) {
    const normalizedValue = value.trim();

    if (!/^\d+$/.test(normalizedValue)) {
      restoreQuantity();
      return;
    }

    const nextQuantity = Number(normalizedValue);

    if (!Number.isSafeInteger(nextQuantity)) {
      restoreQuantity();
      return;
    }

    if (nextQuantity === 0) {
      removeItem(itemId);
      return;
    }

    updateQuantity(itemId, nextQuantity);
  }

  function decrementQuantity() {
    if (item.quantity === 1) {
      removeItem(itemId);
      return;
    }

    updateQuantity(itemId, item.quantity - 1);
  }

  return (
    <div className="grid gap-1 text-sm font-medium text-gray-700">
      <label htmlFor={`quantity-${itemId}`}>Quantity</label>
      <div className="flex items-center">
        <button
          type="button"
          aria-label={`Decrease quantity of ${item.name}`}
          onClick={decrementQuantity}
          className="h-10 w-10 rounded-l-lg border border-r-0 border-gray-300 text-lg hover:bg-gray-50"
        >
          &minus;
        </button>
        <input
          id={`quantity-${itemId}`}
          type="number"
          inputMode="numeric"
          min="0"
          max={item.trackInventory ? item.inventory : undefined}
          step="1"
          aria-label={`Quantity of ${item.name}`}
          value={draftQuantity ?? String(item.quantity)}
          onFocus={() => setDraftQuantity(String(item.quantity))}
          onChange={(event) => setDraftQuantity(event.target.value)}
          onBlur={(event) => {
            setDraftQuantity(null);
            commitQuantity(event.target.value);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              event.currentTarget.blur();
            }
          }}
          className="h-10 w-16 border border-gray-300 px-2 text-center"
        />
        <button
          type="button"
          aria-label={`Increase quantity of ${item.name}`}
          onClick={() => updateQuantity(itemId, item.quantity + 1)}
          className="h-10 w-10 rounded-r-lg border border-l-0 border-gray-300 text-lg hover:bg-gray-50"
        >
          +
        </button>
      </div>
    </div>
  );
}

export function CartSummary() {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const subtotal = useCartStore((state) => state.subtotal());
  const totalItems = useCartStore((state) => state.totalItems());

  if (!items.length) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-950">Your cart is empty</h2>
        <p className="mt-2 text-gray-600">
          Browse the market and add products when you are ready.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex rounded-lg bg-green-700 px-5 py-3 text-sm font-semibold text-white hover:bg-green-800"
        >
          Shop products
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-4 py-3">
          <h2 className="text-lg font-semibold">Cart items</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {items.map((item) => (
            <div
              key={cartItemId(item)}
              className="grid gap-4 p-4 sm:grid-cols-[112px_1fr_auto]"
            >
              <Link
                href={`/products/${item.slug}`}
                className="h-28 rounded-lg bg-gray-100 bg-cover bg-center"
                style={{ backgroundImage: `url("${item.imageUrl}")` }}
                aria-label={item.name}
              />
              <div>
                <Link
                  href={`/products/${item.slug}`}
                  className="font-semibold text-gray-950 hover:text-green-800"
                >
                  {item.name}
                </Link>
                {item.variantLabel ? (
                  <p className="mt-1 text-sm font-medium text-gray-700">
                    Pack / Size: {item.variantLabel}
                  </p>
                ) : null}
                <p className="mt-1 text-xs text-gray-500">SKU: {item.sku}</p>
                <p className="mt-1 text-sm text-gray-600">
                  {money(item.price)}
                </p>
                {item.trackInventory ? (
                  <p className="mt-1 text-xs text-gray-500">
                    {item.inventory} available
                  </p>
                ) : null}
              </div>
              <div className="grid gap-3 sm:justify-items-end">
                <CartQuantityControl item={item} />
                <button
                  className="text-sm font-semibold text-red-700 hover:text-red-800"
                  onClick={() => removeItem(cartItemId(item))}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <aside className="h-fit rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-lg font-semibold">Summary</h2>
        <dl className="mt-4 grid gap-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-600">Items</dt>
            <dd className="font-medium">{totalItems}</dd>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-3">
            <dt className="font-semibold">Subtotal</dt>
            <dd className="text-xl font-bold text-green-700">
              {money(subtotal)}
            </dd>
          </div>
        </dl>
        <div className="mt-5">
          <CheckoutButton />
        </div>
        <button
          className="mt-3 w-full rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          onClick={clearCart}
        >
          Clear cart
        </button>
      </aside>
    </div>
  );
}
