// components/Footer.tsx

import { STORE_SETTINGS } from "@/src/lib/store-settings";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-green-900 text-green-100">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-10">
          {/* BRAND */}
          <div>
            <h3 className="text-xl font-bold text-white">
              Frednes International Market
            </h3>
            <p className="mt-3 text-sm text-green-200">
              Your trusted source for African & Caribbean foods — wholesale and
              retail.
            </p>
          </div>

          {/* LINKS */}
          <div>
            <h4 className="font-semibold text-white">Quick Links</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link
                  href="/products"
                  className="inline-flex min-h-10 items-center hover:text-white"
                >
                  Shop
                </Link>
              </li>
              <li>
                <Link
                  href="/quote"
                  className="inline-flex min-h-10 items-center hover:text-white"
                >
                  Wholesale quote
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="inline-flex min-h-10 items-center hover:text-white"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="inline-flex min-h-10 items-center hover:text-white"
                >
                  Admin
                </Link>
              </li>
            </ul>
          </div>

          {/* CONTACT */}
          <div>
            <h4 className="font-semibold text-white">Contact</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a
                  href={STORE_SETTINGS.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  📍 51 Park St, Orange, NJ
                </a>
              </li>
              <li>
                <a href={STORE_SETTINGS.phone.href}>
                  📞 {STORE_SETTINGS.phone.display}
                </a>
              </li>
              <li>
                <a href={STORE_SETTINGS.phone2.href}>
                  📞 {STORE_SETTINGS.phone2.display}
                </a>
              </li>
            </ul>

            <a
              href="https://www.google.com/maps/search/?api=1&query=Frednes+International+Market+Orange+NJ"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex min-h-10 items-center text-sm underline hover:text-white"
            >
              View on Google Maps
            </a>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="border-t border-green-800 mt-10 pt-6 text-sm text-green-300">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p>
              © {new Date().getFullYear()} Fredness International Market. All
              rights reserved.
            </p>
            <nav className="flex flex-wrap justify-center gap-4">
              <Link
                href="/privacy-policy"
                className="inline-flex min-h-10 items-center hover:text-white"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="inline-flex min-h-10 items-center hover:text-white"
              >
                Terms
              </Link>
              <Link
                href="/refund-policy"
                className="inline-flex min-h-10 items-center hover:text-white"
              >
                Refund Policy
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
