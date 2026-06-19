// app/contact/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | Frednes International Market",
  description:
    "Contact Frednes International Market for retail orders, wholesale quote requests, store questions, and customer support.",
};

export default function ContactPage() {
  return (
    <main className="bg-gray-50 px-6 py-14 text-gray-950">
      <section className="mx-auto grid max-w-5xl gap-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
            Contact
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            Contact Frednes International Market
          </h1>
          <p className="mt-3 max-w-2xl text-gray-600">
            Reach out for order questions, wholesale inquiries, product
            availability, and customer support.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <section className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-xl font-semibold">Store information</h2>
            <dl className="mt-5 grid gap-4 text-sm">
              <div>
                <dt className="font-medium text-gray-500">Address</dt>
                <dd className="mt-1 text-gray-950">51 Park St, Orange, NJ</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 grid gap-1 text-gray-950">
                  <a href="tel:+19736724566" className="hover:text-green-700">
                    (973) 672-4566
                  </a>
                  <a href="tel:+18625203114" className="hover:text-green-700">
                    (862) 520-3114
                  </a>
                </dd>
              </div>
            </dl>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Frednes+International+Market+Orange+NJ"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex rounded-lg bg-green-700 px-5 py-3 text-sm font-semibold text-white hover:bg-green-800"
            >
              View on Google Maps
            </a>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-xl font-semibold">Support</h2>
            <div className="mt-5 grid gap-4 text-sm text-gray-700">
              <p>
                For retail order questions, please include your order number
                when contacting the store.
              </p>
              <p>
                For wholesale requests, use the quote request page and include
                product quantities, business name, and the best phone number to
                reach you.
              </p>
              <p>
                We aim to respond to customer and wholesale inquiries as soon as
                possible during normal business operations.
              </p>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
