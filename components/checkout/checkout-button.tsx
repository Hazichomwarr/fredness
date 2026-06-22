// components/checkout/checkout-button.tsx
"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useCartStore } from "@/src/stores/cart-store";

export function CheckoutButton() {
  const items = useCartStore((state) => state.items);
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function checkout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerEmail,
          customerName,
          items: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        }),
      });
      const data = (await response.json()) as {
        url?: string;
        error?: string;
      };

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Unable to start checkout");
      }

      window.location.href = data.url;
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to start checkout",
      );
      setIsLoading(false);
    }
  }

  return (
    <form className="grid gap-3" onSubmit={checkout}>
      <label className="grid gap-1 text-sm font-medium text-gray-700">
        Email for receipt
        <input
          type="email"
          required
          value={customerEmail}
          onChange={(event) => setCustomerEmail(event.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2"
          placeholder="you@example.com"
        />
      </label>
      <label className="grid gap-1 text-sm font-medium text-gray-700">
        Name
        <input
          type="text"
          value={customerName}
          onChange={(event) => setCustomerName(event.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2"
          placeholder="Your name"
        />
      </label>
      <button
        type="submit"
        className="w-full rounded-lg bg-green-700 px-5 py-3 text-sm font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        disabled={!items.length || isLoading}
      >
        {isLoading ? "Redirecting..." : "Continue to Checkout"}
      </button>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </form>
  );
}
