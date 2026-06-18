// components/Navbar.tsx

import Link from "next/link";
import { CartLink } from "@/components/cart/cart-link";

export default function Navbar() {
  return (
    <header className="w-full border-b sticky top-0 z-50 border-neutral-200 bg-white/80 backdrop-blur">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* LOGO */}
        <Link href="/" className="text-xl font-bold text-green-800">
          Fredness Market
        </Link>

        {/* NAV LINKS */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700">
          <Link href="/products" className="hover:text-green-700">
            Shop
          </Link>
          <Link href="/products" className="hover:text-green-700">
            Categories
          </Link>
          <Link href="#" className="hover:text-green-700">
            Best Sellers
          </Link>
          <Link href="#" className="hover:text-green-700">
            Bundles
          </Link>
        </nav>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4">
          <form action="/products" className="hidden md:block">
            <input
              type="search"
              name="q"
              placeholder="Search products..."
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
            />
          </form>

          <CartLink />

          {/* WHOLESALE CTA */}
          <button className="hidden md:block bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800 transition">
            Bulk Orders
          </button>
        </div>
      </div>
    </header>
  );
}
