// app/checkout/success/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClearCartOnSuccess } from "@/components/checkout/clear-cart-on-success";
import { prisma } from "@/src/lib/prisma";
import { STORE_SETTINGS } from "@/src/lib/store-settings";
import { getStripe } from "@/src/lib/stripe/server";

type CheckoutSuccessPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({
  searchParams,
}: CheckoutSuccessPageProps) {
  const params = (await searchParams) ?? {};
  const sessionId = firstParam(params.session_id);

  if (!sessionId) {
    return (
      <main className="bg-gray-50 px-6 py-16 text-gray-950">
        <div className="mx-auto max-w-3xl rounded-xl border border-gray-200 bg-white p-8 text-center">
          <h1 className="text-3xl font-bold">Missing checkout session</h1>
          <Link
            href="/cart"
            className="mt-6 inline-flex rounded-lg bg-green-700 px-5 py-3 text-sm font-semibold text-white hover:bg-green-800"
          >
            Return to cart
          </Link>
        </div>
      </main>
    );
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const orderId = session.metadata?.orderId;

  if (!orderId) {
    return (
      <main className="bg-gray-50 px-6 py-16 text-gray-950">
        <div className="mx-auto max-w-3xl rounded-xl border border-gray-200 bg-white p-8 text-center">
          <h1 className="text-3xl font-bold">Order not found</h1>
          <p className="mt-2 text-gray-600">
            We could not match this Stripe session to an order.
          </p>
        </div>
      </main>
    );
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <main className="bg-gray-50 px-6 py-16 text-gray-950">
      <ClearCartOnSuccess />
      <div className="mx-auto grid max-w-3xl gap-6">
        <section className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
            Payment {session.payment_status}
          </p>
          <h1 className="mt-2 text-3xl font-bold">Thanks for your order</h1>
          <p className="mt-3 text-gray-600">
            Order #{order.id.slice(-8).toUpperCase()} has been received.
          </p>
          <div className="mt-6 border-t border-gray-200 pt-6 text-gray-700">
            <p>
              Your order will be ready for pickup in approximately{" "}
              <strong>
                {STORE_SETTINGS.pickupPreparationMinutes} minutes.
              </strong>
            </p>
            <p className="mt-2">
              Please bring your order number when visiting the store.
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Pickup Information</h2>
          <p className="mt-4 font-semibold text-green-700">Store Pickup</p>
          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-medium text-gray-500">
                Estimated preparation
              </dt>
              <dd className="mt-1 font-semibold text-gray-950">
                {STORE_SETTINGS.pickupPreparationMinutes} minutes
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">Store address</dt>
              <dd className="mt-1 text-gray-950">
                <a
                  href={STORE_SETTINGS.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-green-700"
                >
                  {STORE_SETTINGS.address}
                </a>
              </dd>
            </div>
          </dl>
          <p className="mt-5 border-t border-gray-100 pt-4 text-sm text-gray-600">
            If you have questions about your order, please contact the store at{" "}
            <a
              href={STORE_SETTINGS.phone.href}
              className="font-semibold text-green-700 hover:text-green-800"
            >
              {STORE_SETTINGS.phone.display}
            </a>
            .
          </p>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Order summary</h2>
          <div className="mt-4 divide-y divide-gray-100">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between gap-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium">{item.productName}</p>
                  {item.variantLabel ? (
                    <p className="text-gray-600">
                      Pack / Size: {item.variantLabel}
                    </p>
                  ) : null}
                  <p className="text-gray-500">
                    {item.quantity} × {money(Number(item.unitPrice))}
                  </p>
                </div>
                <p className="font-semibold">{money(Number(item.lineTotal))}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between border-t border-gray-200 pt-4">
            <span className="font-semibold">Total</span>
            <span className="text-xl font-bold text-green-700">
              {money(Number(order.total))}
            </span>
          </div>
        </section>

        <Link
          href="/products"
          className="justify-self-center rounded-lg bg-green-700 px-5 py-3 text-sm font-semibold text-white hover:bg-green-800"
        >
          Continue shopping
        </Link>
      </div>
    </main>
  );
}
