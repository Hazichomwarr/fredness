// app/cart/page.tsx
import { CartSummary } from "@/components/cart/cart-summary";

export default function CartPage() {
  return (
    <main className="bg-gray-50 px-6 py-10 text-gray-950">
      <div className="mx-auto grid max-w-7xl gap-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
            Shopping cart
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">Your cart</h1>
          <p className="mt-3 max-w-2xl text-gray-600">
            Review quantities and totals before retail checkout.
          </p>
        </div>
        <CartSummary />
      </div>
    </main>
  );
}
