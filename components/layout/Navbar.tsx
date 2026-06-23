// components/Navbar.tsx

"use client";

import Link from "next/link";
import { CartLink } from "@/components/cart/cart-link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { href: "/products", label: "Shop" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <header className="w-full border-b sticky top-0 z-50 border-neutral-200 bg-white/80 backdrop-blur">
      <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
        {/* LOGO */}
        <Link
          href="/"
          className="min-w-0 text-xl font-bold text-green-800"
          onClick={closeMenu}
        >
          <Image
            src="/images/fred_logo.png"
            alt="African Best"
            width={0}
            height={0}
            sizes="100vw"
            className="h-12 w-auto"
          />
        </Link>

        {/* NAV LINKS */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-green-700">
              {link.label}
            </Link>
          ))}
        </nav>

        {/* RIGHT SIDE */}
        <div className="flex shrink-0 items-center gap-2 md:gap-4">
          <form action="/products" className="hidden md:block">
            <input
              type="search"
              name="q"
              placeholder="Search products..."
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
            />
          </form>

          <div className="shrink-0">
            <CartLink />
          </div>

          {/* WHOLESALE CTA */}
          <Link
            href="/quote"
            className="hidden md:block rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-800"
          >
            Bulk Orders
          </Link>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-gray-700 transition hover:bg-gray-50 md:hidden"
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? (
              <X aria-hidden="true" className="h-5 w-5" strokeWidth={2.2} />
            ) : (
              <Menu aria-hidden="true" className="h-5 w-5" strokeWidth={2.2} />
            )}
          </button>
        </div>
      </div>

      <div
        id="mobile-navigation"
        className={`border-t border-neutral-200 bg-white px-6 py-4 shadow-sm md:hidden ${
          isMenuOpen ? "grid gap-4" : "hidden"
        }`}
      >
        <form action="/products" className="grid gap-2" onSubmit={closeMenu}>
          <label className="sr-only" htmlFor="mobile-product-search">
            Search products
          </label>
          <input
            id="mobile-product-search"
            type="search"
            name="q"
            placeholder="Search products..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
          />
        </form>

        <nav className="grid gap-1 text-sm font-semibold text-gray-800">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-1 py-3 hover:text-green-700"
              onClick={closeMenu}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/quote"
            className="mt-2 rounded-lg bg-green-700 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-green-800"
            onClick={closeMenu}
          >
            Bulk Orders
          </Link>
        </nav>
      </div>
    </header>
  );
}
