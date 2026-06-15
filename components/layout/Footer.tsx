// components/Footer.tsx

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
              <li className="hover:text-white cursor-pointer">Shop</li>
              <li className="hover:text-white cursor-pointer">Categories</li>
              <li className="hover:text-white cursor-pointer">Best Sellers</li>
              <li className="hover:text-white cursor-pointer">Bundles</li>
            </ul>
          </div>

          {/* CONTACT */}
          <div>
            <h4 className="font-semibold text-white">Contact</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>📍 51 Park St, Orange, NJ</li>
              <li>📞 (973) 672-4566</li>
              <li>📞 (862) 520-3114</li>
            </ul>

            <a
              href="https://www.google.com/maps/search/?api=1&query=Frednes+International+Market+Orange+NJ"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 text-sm underline hover:text-white"
            >
              View on Google Maps
            </a>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="border-t border-green-800 mt-10 pt-6 text-center text-sm text-green-300">
          © {new Date().getFullYear()} Fredness International Market. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
}
