// app/checkout/cancel/page.tsx
import Link from "next/link";
import { prisma } from "@/src/lib/prisma";

type CheckoutCancelPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export const dynamic = "force-dynamic";

export default async function CheckoutCancelPage({
  searchParams,
}: CheckoutCancelPageProps) {
  const params = (await searchParams) ?? {};
  const orderId = firstParam(params.order);

  if (orderId) {
    await prisma.order
      .update({
        where: {
          id: orderId,
        },
        data: {
          status: "CANCELLED",
        },
      })
      .catch(() => null);
  }

  return (
    <main className="bg-gray-50 px-6 py-16 text-gray-950">
      <div className="mx-auto max-w-3xl rounded-xl border border-gray-200 bg-white p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">
          Checkout cancelled
        </p>
        <h1 className="mt-2 text-3xl font-bold">No payment was made</h1>
        <p className="mt-3 text-gray-600">
          Your cart is still saved in this browser. You can review it or keep
          shopping.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/cart"
            className="rounded-lg bg-green-700 px-5 py-3 text-sm font-semibold text-white hover:bg-green-800"
          >
            Return to cart
          </Link>
          <Link
            href="/products"
            className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
