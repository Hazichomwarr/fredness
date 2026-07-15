import { STORE_SETTINGS } from "@/src/lib/store-settings";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Frednes International Market",
  description:
    "Learn about Frednes International Market, a trusted African, Caribbean, and multicultural grocery store serving retail and wholesale customers in Orange, New Jersey.",
};

const reasons = [
  "Authentic African Products",
  "Caribbean Favorites",
  "Wholesale Availability",
  "Friendly Local Service",
];

const mapsUrl =
  "https://www.google.com/maps/search/?api=1&query=51%20Park%20St%2C%20Orange%2C%20NJ";

export default function AboutPage() {
  return (
    <main className="bg-white text-gray-950">
      <section className="bg-gray-50 px-6 py-12 md:py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative aspect-4/3 overflow-hidden rounded-lg bg-gray-200 shadow-sm">
            <Image
              src="/images/store-award.png"
              alt="Frednes International Market grocery selection"
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
              Orange, New Jersey
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-950 md:text-5xl">
              About Frednes International Market
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-gray-700">
              Serving African, Caribbean, and multicultural families from
              Orange, New Jersey with authentic groceries, wholesale products,
              and community-focused service.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="rounded-lg bg-green-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800"
              >
                Shop Products
              </Link>
              <Link
                href="/quote"
                className="rounded-lg border border-green-700 px-5 py-3 text-sm font-semibold text-green-800 transition hover:bg-green-50"
              >
                Get Wholesale Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-14">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
          <div className="relative aspect-5/4 overflow-hidden rounded-lg bg-gray-200">
            <Image
              src="/images/fred-story.jpg"
              alt="Fresh grocery products available at Frednes International Market"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
              The Story
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              Built for families, restaurants, and local businesses.
            </h2>

            <div className="mt-5 space-y-4 text-base leading-8 text-gray-700">
              <p>
                Frednes International Market was founded with a simple mission:
                to bring authentic African, Caribbean, and international foods
                closer to the communities that call New Jersey home.
              </p>

              <p>
                From a neighborhood grocery store, Frednes has grown into a
                trusted destination serving families, restaurants, caterers,
                churches, and small businesses with thousands of carefully
                selected products—from everyday pantry essentials to specialty
                ingredients that are often difficult to find elsewhere.
              </p>

              <p>
                The market's steady growth and commitment to serving
                multicultural communities have also been recognized beyond its
                customers. Frednes was featured by{" "}
                <strong>The New Jersey Farmer</strong>, which highlighted the
                company's expansion and its role in providing authentic foods to
                the region's growing African and Caribbean communities.
              </p>

              <p>
                Today, we continue that same commitment by offering quality
                products, competitive wholesale pricing, and friendly
                service—whether you're shopping for your family or stocking your
                business.
              </p>

              <a
                href="https://americanfarm.com/articles/the-new-jersey-farmer/frednes-african-international-market-growing-quickly/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center font-semibold text-green-700 hover:text-green-800"
              >
                Read the feature in{" "}
                <em className="ml-1">The New Jersey Farmer</em> →
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-green-950 px-6 py-14 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative aspect-4/5 overflow-hidden rounded-lg bg-green-900">
            <Image
              src="/images/meet-owners.png"
              alt="Frednes International Market products"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-green-200">
              Meet the Owners
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              Meet Mr. Fred & Mrs. Agnes
            </h2>
            <p className="mt-2 text-green-100">Owner & Founder</p>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-green-50">
              As the owners of Frednes International Market, Frednes is
              committed to helping families, restaurants, and retailers find the
              products they need at competitive prices.
            </p>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-green-50">
              His goal is simple: provide quality products, build lasting
              customer relationships, and serve the local community with
              integrity.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-14">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
            Why Customers Choose Us
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {reasons.map((reason) => (
              <div
                key={reason}
                className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-800">
                  ✓
                </div>
                <h3 className="mt-4 text-lg font-semibold">{reason}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 px-6 py-14">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
              Store Information
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              Visit us in Orange, NJ.
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="font-semibold">Address</h3>
              <p className="mt-2 leading-7 text-gray-700">
                51 Park St
                <br />
                Orange, NJ
              </p>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-800"
              >
                View on Google Maps
              </a>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="font-semibold">Phone</h3>
              <div className="mt-2 space-y-2 text-gray-700">
                <a
                  className="block hover:text-green-700 hover:underline"
                  href={STORE_SETTINGS.phone.href}
                >
                  {STORE_SETTINGS.phone.display}
                </a>
                <a
                  className="block hover:text-green-700 hover:underline"
                  href={STORE_SETTINGS.phone2.href}
                >
                  {STORE_SETTINGS.phone2.display}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
            Community
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">
            Proud to serve New Jersey.
          </h2>
          <p className="mt-5 text-lg leading-8 text-gray-700">
            We are proud to serve families, churches, restaurants, food vendors,
            and local businesses throughout New Jersey.
          </p>
          <p className="mt-4 text-lg leading-8 text-gray-700">
            Thank you for supporting a local community business.
          </p>
        </div>
      </section>
    </main>
  );
}
