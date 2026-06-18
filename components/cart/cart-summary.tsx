// src/components/cart/cart-summary.tsx
"use client";

import Link from "next/link";
import { CheckoutButton } from "@/components/checkout/checkout-button";
import { useCartStore } from "@/src/stores/cart-store";

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function CartSummary() {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
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
              key={item.productId}
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
                <label className="grid gap-1 text-sm font-medium text-gray-700">
                  Quantity
                  <input
                    type="number"
                    min="1"
                    max={item.trackInventory ? item.inventory : undefined}
                    value={item.quantity}
                    onChange={(event) =>
                      updateQuantity(item.productId, Number(event.target.value))
                    }
                    className="w-24 rounded-lg border border-gray-300 px-3 py-2"
                  />
                </label>
                <button
                  className="text-sm font-semibold text-red-700 hover:text-red-800"
                  onClick={() => removeItem(item.productId)}
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
