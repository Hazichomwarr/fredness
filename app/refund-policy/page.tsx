// app/refund-policy/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Refund Policy | Frednes International Market",
  description:
    "Refund and return policy for Frednes International Market retail orders and wholesale purchases.",
};

export default function RefundPolicyPage() {
  return (
    <main className="bg-gray-50 px-6 py-14 text-gray-950">
      <article className="mx-auto max-w-4xl rounded-xl border border-gray-200 bg-white p-6 md:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
          Refund Policy
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">
          Refund Policy
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Last updated: June 19, 2026
        </p>

        <div className="mt-8 grid gap-7 leading-7 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-950">
              Order Issues
            </h2>
            <p className="mt-3">
              If there is a problem with your retail order, contact Frednes
              International Market as soon as possible with your order number,
              contact information, and a description of the issue.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-950">
              Perishable and Food Items
            </h2>
            <p className="mt-3">
              Because many grocery and food items are perishable or sensitive to
              handling, opened, used, damaged-after-pickup, or improperly stored
              food products may not be eligible for return. Refund eligibility
              is reviewed case by case.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-950">
              Damaged, Missing, or Incorrect Items
            </h2>
            <p className="mt-3">
              If your order is missing an item, includes the wrong item, or has
              a damaged product, please contact us promptly. We may request
              photos, packaging details, or other information to review the
              claim.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-950">
              Approved Refunds
            </h2>
            <p className="mt-3">
              Approved refunds are generally returned to the original payment
              method. Processing times may vary depending on the payment
              provider and your bank.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-950">
              Wholesale Orders
            </h2>
            <p className="mt-3">
              Wholesale returns, credits, substitutions, and refunds are handled
              according to the terms confirmed with the customer before the
              wholesale order is finalized.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-950">Contact</h2>
            <p className="mt-3">
              To request help with an order, use our{" "}
              <Link href="/contact" className="font-semibold text-green-700">
                contact page
              </Link>{" "}
              or call the store.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
