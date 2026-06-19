// app/privacy-policy/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Frednes International Market",
  description:
    "Privacy policy for Frednes International Market retail checkout, wholesale quote requests, and customer support.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-gray-50 px-6 py-14 text-gray-950">
      <article className="mx-auto max-w-4xl rounded-xl border border-gray-200 bg-white p-6 md:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
          Privacy Policy
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Last updated: June 19, 2026
        </p>

        <div className="mt-8 grid gap-7 leading-7 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-950">
              Information We Collect
            </h2>
            <p className="mt-3">
              Frednes International Market collects information needed to
              process retail orders, respond to wholesale quote requests, and
              provide customer support. This may include your name, email
              address, phone number, business name, shipping details, order
              details, quote request details, and messages you send to us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-950">
              Payment Information
            </h2>
            <p className="mt-3">
              Retail payments are processed by Stripe. We do not store full
              credit card numbers on our servers. Stripe may collect and process
              payment information according to its own privacy and security
              practices.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-950">
              How We Use Information
            </h2>
            <p className="mt-3">
              We use customer information to fulfill orders, confirm payments,
              manage inventory, respond to quote requests, communicate about
              purchases or wholesale leads, prevent fraud, and improve our store
              operations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-950">
              Sharing Information
            </h2>
            <p className="mt-3">
              We share information only when needed to operate the business,
              such as with payment processors, shipping or delivery providers,
              email service providers, technology vendors, or when required by
              law. We do not sell customer personal information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-950">
              Data Security
            </h2>
            <p className="mt-3">
              We use reasonable safeguards to protect customer information.
              However, no online system is completely secure, and customers
              should contact us promptly if they believe their information has
              been used without authorization.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-950">Contact Us</h2>
            <p className="mt-3">
              Questions about this policy can be sent through our{" "}
              <Link href="/contact" className="font-semibold text-green-700">
                contact page
              </Link>{" "}
              or by calling the store.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
