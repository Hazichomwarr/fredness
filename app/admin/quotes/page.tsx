// app/admin/quotes/page.tsx
import { Prisma, QuoteStatus } from "@prisma/client";
import { updateQuoteStatusAction } from "@/app/admin/quotes/actions";
import { prisma } from "@/src/lib/prisma";

type QuotesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const pageSize = 25;
const quoteStatuses: QuoteStatus[] = [
  "NEW",
  "CONTACTED",
  "NEGOTIATING",
  "CLOSED",
  "LOST",
];

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function statusLabel(status: QuoteStatus) {
  return status
    .toLowerCase()
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function statusClass(status: QuoteStatus) {
  switch (status) {
    case "NEW":
      return "bg-blue-50 text-blue-700";
    case "CONTACTED":
      return "bg-emerald-50 text-emerald-700";
    case "NEGOTIATING":
      return "bg-amber-50 text-amber-700";
    case "CLOSED":
      return "bg-neutral-950 text-white";
    case "LOST":
      return "bg-red-50 text-red-700";
  }
}

function quotesHref({
  q,
  status,
  page,
}: {
  q: string;
  status: string;
  page: number;
}) {
  const params = new URLSearchParams();

  if (q) params.set("q", q);
  if (status) params.set("status", status);
  if (page > 1) params.set("page", String(page));

  const query = params.toString();
  return query ? `/admin/quotes?${query}` : "/admin/quotes";
}

export const dynamic = "force-dynamic";

export default async function AdminQuotesPage({
  searchParams,
}: QuotesPageProps) {
  const params = (await searchParams) ?? {};
  const query = firstParam(params.q)?.trim() ?? "";
  const statusParam = firstParam(params.status)?.trim() ?? "";
  const status = quoteStatuses.includes(statusParam as QuoteStatus)
    ? (statusParam as QuoteStatus)
    : "";
  const page = Math.max(Number(firstParam(params.page) ?? "1") || 1, 1);

  const where: Prisma.QuoteWhereInput = {
    ...(status ? { status } : {}),
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { phone: { contains: query, mode: "insensitive" } },
            { businessName: { contains: query, mode: "insensitive" } },
            { message: { contains: query, mode: "insensitive" } },
            {
              items: {
                some: {
                  OR: [
                    { productName: { contains: query, mode: "insensitive" } },
                    { sku: { contains: query, mode: "insensitive" } },
                  ],
                },
              },
            },
          ],
        }
      : {}),
  };

  const [quotes, total] = await Promise.all([
    prisma.quote.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        items: {
          orderBy: [{ createdAt: "asc" }],
        },
      },
    }),
    prisma.quote.count({ where }),
  ]);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-10 text-neutral-950 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
              Admin
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Wholesale leads
            </h1>
            <p className="mt-2 text-sm text-neutral-600">
              Review quote requests, search leads, and move each opportunity
              through the wholesale pipeline.
            </p>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm">
            <span className="font-semibold">{total}</span>{" "}
            {total === 1 ? "lead" : "leads"}
          </div>
        </div>

        <form className="grid gap-3 rounded-lg border border-neutral-200 bg-white p-4 md:grid-cols-[1fr_220px_auto]">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search name, email, business, product, SKU..."
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-950"
          />
          <select
            name="status"
            defaultValue={status}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-950"
          >
            <option value="">All statuses</option>
            {quoteStatuses.map((item) => (
              <option key={item} value={item}>
                {statusLabel(item)}
              </option>
            ))}
          </select>
          <button className="rounded-md bg-neutral-950 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800">
            Search
          </button>
        </form>

        <section className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-250 border-collapse text-left text-sm">
              <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
                <tr>
                  <th className="border-b border-neutral-200 px-4 py-3">
                    Lead
                  </th>
                  <th className="border-b border-neutral-200 px-4 py-3">
                    Products
                  </th>
                  <th className="border-b border-neutral-200 px-4 py-3">
                    Message
                  </th>
                  <th className="border-b border-neutral-200 px-4 py-3">
                    Status
                  </th>
                  <th className="border-b border-neutral-200 px-4 py-3">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody>
                {quotes.length ? (
                  quotes.map((quote) => (
                    <tr
                      key={quote.id}
                      className="border-b border-neutral-100 last:border-0"
                    >
                      <td className="px-4 py-4 align-top">
                        <p className="font-semibold text-neutral-950">
                          {quote.businessName}
                        </p>
                        <p className="mt-1 text-neutral-700">{quote.name}</p>
                        <div className="mt-2 grid gap-1 text-xs text-neutral-500">
                          <a
                            href={`mailto:${quote.email}`}
                            className="hover:text-emerald-700"
                          >
                            {quote.email}
                          </a>
                          <a
                            href={`tel:${quote.phone}`}
                            className="hover:text-emerald-700"
                          >
                            {quote.phone}
                          </a>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="grid gap-2">
                          {quote.items.map((item) => (
                            <div key={item.id}>
                              <p className="font-medium text-neutral-900">
                                {item.productName}
                              </p>
                              <p className="text-xs text-neutral-500">
                                SKU {item.sku} · Qty {item.quantity}
                              </p>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="max-w-85 px-4 py-4 align-top text-neutral-600">
                        {quote.message ? (
                          <p className="line-clamp-4">{quote.message}</p>
                        ) : (
                          <span className="text-neutral-400">No message</span>
                        )}
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="grid gap-3">
                          <span
                            className={`w-fit rounded-full px-2 py-1 text-xs font-medium ${statusClass(
                              quote.status,
                            )}`}
                          >
                            {statusLabel(quote.status)}
                          </span>
                          <form
                            action={updateQuoteStatusAction}
                            className="flex flex-wrap gap-2"
                          >
                            <input type="hidden" name="id" value={quote.id} />
                            <select
                              name="status"
                              defaultValue={quote.status}
                              className="min-h-10 rounded-md border border-neutral-300 px-2 py-2 text-sm"
                            >
                              {quoteStatuses.map((item) => (
                                <option key={item} value={item}>
                                  {statusLabel(item)}
                                </option>
                              ))}
                            </select>
                            <button className="min-h-10 rounded-md border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50">
                              Update
                            </button>
                          </form>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top text-neutral-600">
                        <p>{quote.createdAt.toLocaleDateString("en-US")}</p>
                        <p className="mt-1 text-xs text-neutral-400">
                          #{quote.id.slice(-8).toUpperCase()}
                        </p>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      className="px-4 py-12 text-center text-neutral-500"
                      colSpan={5}
                    >
                      No wholesale leads found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-neutral-600">
          <p>
            Page {page} of {pageCount}
          </p>
          <div className="flex gap-2">
            <a
              href={quotesHref({
                q: query,
                status,
                page: Math.max(1, page - 1),
              })}
              className={`rounded-md border border-neutral-300 px-3 py-2 font-semibold ${
                page <= 1 ? "pointer-events-none opacity-50" : "hover:bg-white"
              }`}
            >
              Previous
            </a>
            <a
              href={quotesHref({
                q: query,
                status,
                page: Math.min(pageCount, page + 1),
              })}
              className={`rounded-md border border-neutral-300 px-3 py-2 font-semibold ${
                page >= pageCount
                  ? "pointer-events-none opacity-50"
                  : "hover:bg-white"
              }`}
            >
              Next
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
