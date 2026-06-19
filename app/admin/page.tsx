import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/src/lib/prisma";

const storeTimeZone = "America/New_York";

function money(value: Prisma.Decimal | number | null | undefined) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
}

function storeDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: storeTimeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(date);

  return {
    year: Number(parts.find((part) => part.type === "year")?.value),
    month: Number(parts.find((part) => part.type === "month")?.value),
    day: Number(parts.find((part) => part.type === "day")?.value),
  };
}

function timeZoneOffset(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: storeTimeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hourCycle: "h23",
  }).formatToParts(date);
  const getPart = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value);
  const localAsUtc = Date.UTC(
    getPart("year"),
    getPart("month") - 1,
    getPart("day"),
    getPart("hour"),
    getPart("minute"),
    getPart("second"),
  );

  return localAsUtc - date.getTime();
}

function storeLocalTimeToUtc(year: number, month: number, day: number) {
  const localAsUtc = Date.UTC(year, month - 1, day, 0, 0, 0);
  const offset = timeZoneOffset(new Date(localAsUtc));

  return new Date(localAsUtc - offset);
}

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const todayParts = storeDateParts(new Date());
  const today = storeLocalTimeToUtc(
    todayParts.year,
    todayParts.month,
    todayParts.day,
  );
  const tomorrow = storeLocalTimeToUtc(
    todayParts.year,
    todayParts.month,
    todayParts.day + 1,
  );
  const monthStart = storeLocalTimeToUtc(todayParts.year, todayParts.month, 1);

  const [
    ordersToday,
    pendingOrders,
    wholesaleLeads,
    products,
    categories,
    revenueThisMonth,
  ] = await Promise.all([
    prisma.order.count({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    }),
    prisma.order.count({
      where: {
        status: "PENDING",
      },
    }),
    prisma.quote.count(),
    prisma.product.count(),
    prisma.category.count(),
    prisma.order.aggregate({
      where: {
        createdAt: {
          gte: monthStart,
        },
        status: {
          in: ["PAID", "PROCESSING", "FULFILLED"],
        },
      },
      _sum: {
        total: true,
      },
    }),
  ]);

  const cards = [
    {
      label: "Orders Today",
      value: ordersToday,
      href: "/admin/orders",
    },
    {
      label: "Pending Orders",
      value: pendingOrders,
      href: "/admin/orders?status=PENDING",
    },
    {
      label: "Wholesale Leads",
      value: wholesaleLeads,
      href: "/admin/quotes",
    },
    {
      label: "Products",
      value: products,
      href: "/admin/products",
    },
    {
      label: "Categories",
      value: categories,
      href: "/admin/categories",
    },
    {
      label: "Revenue This Month",
      value: money(revenueThisMonth._sum.total),
      href: "/admin/orders",
    },
  ];

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-10 text-neutral-950 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Admin
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Quick numbers for orders, wholesale leads, catalog health, and
            monthly retail revenue.
          </p>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-neutral-300 hover:shadow-md"
            >
              <p className="text-sm font-medium text-neutral-500">
                {card.label}
              </p>
              <p className="mt-3 text-3xl font-bold text-neutral-950">
                {card.value}
              </p>
            </Link>
          ))}
        </section>

        <section className="grid gap-3 rounded-lg border border-neutral-200 bg-white p-5 sm:grid-cols-3">
          <Link
            href="/admin/orders"
            className="rounded-md border border-neutral-200 px-4 py-3 text-sm font-semibold hover:bg-neutral-50"
          >
            Manage orders
          </Link>
          <Link
            href="/admin/quotes"
            className="rounded-md border border-neutral-200 px-4 py-3 text-sm font-semibold hover:bg-neutral-50"
          >
            View wholesale leads
          </Link>
          <Link
            href="/admin/products"
            className="rounded-md border border-neutral-200 px-4 py-3 text-sm font-semibold hover:bg-neutral-50"
          >
            Manage products
          </Link>
        </section>
      </div>
    </main>
  );
}
