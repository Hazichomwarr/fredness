// app/terms/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms and Conditions | Frednes International Market",
  description:
    "Terms and conditions for using Frednes International Market retail and wholesale services.",
};

export default function TermsPage() {
  return (
    <main className="bg-gray-50 px-6 py-14 text-gray-950">
      <article className="mx-auto max-w-4xl rounded-xl border border-gray-200 bg-white p-6 md:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
          Terms and Conditions
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">
          Terms and Conditions
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Last updated: June 19, 2026
        </p>

        <div className="mt-8 grid gap-7 leading-7 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-950">
              Use of the Website
            </h2>
            <p className="mt-3">
              By using this website, placing a retail order, or submitting a
              wholesale quote request, you agree to use the site for lawful
              purposes and provide accurate information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-950">
              Product Information
            </h2>
            <p className="mt-3">
              We work to keep product descriptions, prices, images, inventory,
              and availability accurate. Product packaging, size, availability,
              and pricing may change. If an item becomes unavailable after an
              order is placed, we may contact you about a substitution, refund,
              or cancellation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-950">
              Retail Orders and Payment
            </h2>
            <p className="mt-3">
              Retail orders are paid online through Stripe. An order is not
              final until payment is authorized and accepted. We may cancel or
              refuse an order when needed because of inventory issues, suspected
              fraud, incorrect pricing, or other operational concerns.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-950">
              Wholesale Quotes
            </h2>
            <p className="mt-3">
              Wholesale quote requests are not purchases. Submitted quantities
              and products are reviewed by Frednes International Market, and
              final pricing, availability, delivery, and payment terms are
              confirmed directly with the customer.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-950">
              Refunds and Returns
            </h2>
            <p className="mt-3">
              Refunds and returns are handled according to our{" "}
              <Link
                href="/refund-policy"
                className="font-semibold text-green-700"
              >
                Refund Policy
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-950">Contact</h2>
            <p className="mt-3">
              For questions about these terms, please contact Frednes
              International Market through our{" "}
              <Link href="/contact" className="font-semibold text-green-700">
                contact page
              </Link>
              .
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
