// app/admin/orders/page.tsx
import { OrderStatus, Prisma } from "@prisma/client";
import { updateOrderStatusAction } from "@/app/admin/orders/actions";
import { requireAdmin } from "@/src/lib/auth/admin";
import { prisma } from "@/src/lib/prisma";

type OrdersPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const pageSize = 25;
const orderStatuses: OrderStatus[] = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "FULFILLED",
  "CANCELLED",
];

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function statusLabel(status: OrderStatus) {
  return status
    .toLowerCase()
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function statusClass(status: OrderStatus) {
  switch (status) {
    case "PENDING":
      return "bg-amber-50 text-amber-700";
    case "PAID":
      return "bg-emerald-50 text-emerald-700";
    case "PROCESSING":
      return "bg-blue-50 text-blue-700";
    case "FULFILLED":
      return "bg-neutral-950 text-white";
    case "CANCELLED":
      return "bg-red-50 text-red-700";
  }
}

function money(value: Prisma.Decimal) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value));
}

function previewText(value: string, length = 100) {
  return value.length > length ? `${value.slice(0, length).trim()}...` : value;
}

function ordersHref({
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
  return query ? `/admin/orders?${query}` : "/admin/orders";
}

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: OrdersPageProps) {
  await requireAdmin();

  const params = (await searchParams) ?? {};
  const query = firstParam(params.q)?.trim() ?? "";
  const statusParam = firstParam(params.status)?.trim() ?? "";
  const status = orderStatuses.includes(statusParam as OrderStatus)
    ? (statusParam as OrderStatus)
    : "";
  const page = Math.max(Number(firstParam(params.page) ?? "1") || 1, 1);

  const where: Prisma.OrderWhereInput = {
    ...(status ? { status } : {}),
    ...(query
      ? {
          OR: [
            { id: { contains: query, mode: "insensitive" } },
            { customerName: { contains: query, mode: "insensitive" } },
            { customerEmail: { contains: query, mode: "insensitive" } },
            { customerPhone: { contains: query, mode: "insensitive" } },
            { notes: { contains: query, mode: "insensitive" } },
            { stripeCheckoutSession: { contains: query, mode: "insensitive" } },
            { stripePaymentIntent: { contains: query, mode: "insensitive" } },
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

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
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
    prisma.order.count({ where }),
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
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Orders</h1>
            <p className="mt-2 text-sm text-neutral-600">
              View retail orders, filter by status, review customer details, and
              move orders through fulfillment.
            </p>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm">
            <span className="font-semibold">{total}</span>{" "}
            {total === 1 ? "order" : "orders"}
          </div>
        </div>

        <form className="grid gap-3 rounded-lg border border-neutral-200 bg-white p-4 md:grid-cols-[1fr_220px_auto]">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search order, customer, email, product, SKU..."
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-950"
          />
          <select
            name="status"
            defaultValue={status}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-950"
          >
            <option value="">All statuses</option>
            {orderStatuses.map((item) => (
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
            <table className="w-full min-w-275 border-collapse text-left text-sm">
              <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
                <tr>
                  <th className="border-b border-neutral-200 px-4 py-3">
                    Order
                  </th>
                  <th className="border-b border-neutral-200 px-4 py-3">
                    Customer
                  </th>
                  <th className="border-b border-neutral-200 px-4 py-3">
                    Items
                  </th>
                  <th className="border-b border-neutral-200 px-4 py-3">
                    Total
                  </th>
                  <th className="border-b border-neutral-200 px-4 py-3">
                    Status
                  </th>
                  <th className="border-b border-neutral-200 px-4 py-3">
                    Payment
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.length ? (
                  orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-neutral-100 last:border-0"
                    >
                      <td className="px-4 py-4 align-top">
                        <p className="font-semibold text-neutral-950">
                          #{order.id.slice(-8).toUpperCase()}
                        </p>
                        <p className="mt-1 text-xs text-neutral-500">
                          {order.createdAt.toLocaleDateString("en-US")}
                        </p>
                        {order.notes ? (
                          <details className="mt-3 max-w-56 text-xs text-amber-700">
                            <summary className="cursor-pointer list-none">
                              {previewText(order.notes)}
                              {order.notes.length > 100 ? (
                                <span className="ml-1 font-semibold underline">
                                  View
                                </span>
                              ) : null}
                            </summary>
                            {order.notes.length > 100 ? (
                              <p className="mt-2 whitespace-pre-line rounded-md bg-amber-50 p-2">
                                {order.notes}
                              </p>
                            ) : null}
                          </details>
                        ) : null}
                      </td>
                      <td className="px-4 py-4 align-top">
                        <p className="font-semibold text-neutral-950">
                          {order.customerName}
                        </p>
                        <div className="mt-2 grid gap-1 text-xs text-neutral-500">
                          <a
                            href={`mailto:${order.customerEmail}`}
                            className="hover:text-emerald-700"
                          >
                            {order.customerEmail}
                          </a>
                          {order.customerPhone ? (
                            <a
                              href={`tel:${order.customerPhone}`}
                              className="hover:text-emerald-700"
                            >
                              {order.customerPhone}
                            </a>
                          ) : null}
                        </div>
                        {order.shippingAddress ||
                        order.city ||
                        order.state ||
                        order.zipCode ? (
                          <p className="mt-3 max-w-52 text-xs text-neutral-600">
                            {[
                              order.shippingAddress,
                              order.city,
                              order.state,
                              order.zipCode,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="grid gap-2">
                          {order.items.map((item) => (
                            <div key={item.id}>
                              <p className="font-medium text-neutral-900">
                                {item.productName}
                              </p>
                              {item.variantLabel ? (
                                <p className="text-xs font-medium text-neutral-600">
                                  Pack / Size: {item.variantLabel}
                                </p>
                              ) : null}
                              <p className="text-xs text-neutral-500">
                                SKU {item.sku} | Qty {item.quantity} |{" "}
                                {money(item.lineTotal)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <p className="font-bold text-neutral-950">
                          {money(order.total)}
                        </p>
                        <dl className="mt-2 grid gap-1 text-xs text-neutral-500">
                          <div className="flex justify-between gap-4">
                            <dt>Subtotal</dt>
                            <dd>{money(order.subtotal)}</dd>
                          </div>
                          <div className="flex justify-between gap-4">
                            <dt>Tax</dt>
                            <dd>{money(order.tax)}</dd>
                          </div>
                          <div className="flex justify-between gap-4">
                            <dt>Shipping</dt>
                            <dd>{money(order.shipping)}</dd>
                          </div>
                        </dl>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="grid gap-3">
                          <span
                            className={`w-fit rounded-full px-2 py-1 text-xs font-medium ${statusClass(
                              order.status,
                            )}`}
                          >
                            {statusLabel(order.status)}
                          </span>
                          <form
                            action={updateOrderStatusAction}
                            className="flex flex-wrap gap-2"
                          >
                            <input type="hidden" name="id" value={order.id} />
                            <select
                              name="status"
                              defaultValue={order.status}
                              className="min-h-10 rounded-md border border-neutral-300 px-2 py-2 text-sm"
                            >
                              {orderStatuses.map((item) => (
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
                      <td className="px-4 py-4 align-top text-xs text-neutral-500">
                        {order.stripePaymentIntent ? (
                          <p>
                            <span className="font-medium text-neutral-700">
                              Intent:
                            </span>{" "}
                            {order.stripePaymentIntent}
                          </p>
                        ) : null}
                        {order.stripeCheckoutSession ? (
                          <p className="mt-2">
                            <span className="font-medium text-neutral-700">
                              Session:
                            </span>{" "}
                            {order.stripeCheckoutSession}
                          </p>
                        ) : null}
                        {!order.stripePaymentIntent &&
                        !order.stripeCheckoutSession ? (
                          <span className="text-neutral-400">
                            No Stripe reference
                          </span>
                        ) : null}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      className="px-4 py-12 text-center text-neutral-500"
                      colSpan={6}
                    >
                      No orders found.
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
              href={ordersHref({
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
              href={ordersHref({
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
