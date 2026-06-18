// app/quote/success/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/src/lib/prisma";

type QuoteSuccessPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export const dynamic = "force-dynamic";

export default async function QuoteSuccessPage({
  searchParams,
}: QuoteSuccessPageProps) {
  const params = (await searchParams) ?? {};
  const quoteId = firstParam(params.quote);

  if (!quoteId) {
    notFound();
  }

  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: {
      items: true,
    },
  });

  if (!quote) {
    notFound();
  }

  return (
    <main className="bg-gray-50 px-6 py-16 text-gray-950">
      <div className="mx-auto grid max-w-3xl gap-6">
        <section className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
            Quote request received
          </p>
          <h1 className="mt-2 text-3xl font-bold">Thanks, {quote.name}</h1>
          <p className="mt-3 text-gray-600">
            Quote #{quote.id.slice(-8).toUpperCase()} has been sent to Frednes.
            A confirmation email has been queued for {quote.email}.
          </p>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Requested products</h2>
          <div className="mt-4 divide-y divide-gray-100">
            {quote.items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between gap-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-gray-500">SKU {item.sku}</p>
                </div>
                <p className="font-semibold">Qty {item.quantity}</p>
              </div>
            ))}
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
