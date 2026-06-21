// components/Hero.tsx

// import Image from "next/image";

// export default function Hero() {
//   return (
//     <section className="relative bg-linear-to-br from-green-900 via-green-800 to-green-700 text-white">
//       <div className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
//         {/* LEFT */}
//         <div>
//           {/* BADGE */}
//           <span className="inline-block bg-yellow-400 text-green-900 text-xs font-semibold px-3 py-1 rounded-full mb-4">
//             Wholesale & Retail Available
//           </span>

//           {/* HEADLINE */}
//           <h1 className="text-4xl md:text-5xl font-bold leading-tight">
//             African & Caribbean Foods, <br />
//             <span className="text-yellow-300">At Wholesale Prices</span>
//           </h1>

//           {/* SUBTEXT */}
//           <p className="mt-6 text-lg text-green-100">
//             From bulk rice and yams to smoked fish and spices — shop everything
//             you need in one place. Perfect for families, restaurants, and
//             resellers.
//           </p>

//           {/* CTA */}
//           <div className="mt-8 flex flex-wrap gap-4">
//             <button className="bg-yellow-400 text-green-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition">
//               Shop Now
//             </button>

//             <button className="bg-white/10 border border-white/30 px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition">
//               Browse Categories
//             </button>
//           </div>

//           {/* TRUST */}
//           <div className="mt-6 text-sm text-green-200 flex flex-wrap gap-4">
//             <span>✅ Bulk Discounts</span>
//             <span>🚚 Fast Local Pickup</span>
//             <span>📦 Wholesale Supply</span>
//           </div>

//           {/* LOCATION */}
//           <a
//             href="https://www.google.com/maps/search/?api=1&query=Frednes+International+Market+Orange+NJ"
//             target="_blank"
//             rel="noopener noreferrer"
//             className="mt-6 inline-block text-sm underline text-green-200 hover:text-white"
//           >
//             📍 51 Park St, Orange, NJ • Open to Public & Bulk Buyers
//           </a>
//         </div>

//         {/* RIGHT (IMAGE GRID) */}
//         <div className="grid grid-cols-2 gap-4">
//           <Image
//             src="/images/fredness-rice.jpeg"
//             alt="Rice"
//             width={200}
//             height={50}
//             className="rounded-xl object-cover h-40 w-full"
//           />
//           <Image
//             src="/images/fredness-yam.jpg"
//             alt="Yam"
//             width={200}
//             height={50}
//             className="rounded-xl object-cover h-40 w-full"
//           />
//           <Image
//             src="/images/fredness-fish.jpeg"
//             alt="Fish"
//             width={200}
//             height={50}
//             className="rounded-xl object-cover h-40 w-full"
//           />
//           <Image
//             src="/images/fredness-malt.jpeg"
//             alt="Malt"
//             width={200}
//             height={50}
//             className="rounded-xl object-cover h-40 w-full"
//           />
//         </div>
//       </div>
//     </section>
//   );
// }

import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative bg-linear-to-br from-green-900 via-green-800 to-green-700 text-white">
      {" "}
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2">
        {/* LEFT */}{" "}
        <div>
          {/* BADGE */}{" "}
          <span className="mb-4 inline-block rounded-full bg-yellow-400 px-3 py-1 text-xs font-semibold text-green-900">
            Wholesale & Retail Available{" "}
          </span>
          {/* HEADLINE */}
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            African & Caribbean Groceries
            <br />
            <span className="text-yellow-300">
              for Families, Restaurants & Resellers
            </span>
          </h1>
          {/* SUBTEXT */}
          <p className="mt-6 text-lg text-green-100">
            Shop authentic African and Caribbean foods including rice, yam,
            spices, beverages, frozen products, and wholesale essentials.
            Serving families, restaurants, convenience stores, and resellers
            throughout New Jersey, and out-of-state.
          </p>
          {/* CTA */}
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/products"
              className="rounded-lg bg-yellow-400 px-6 py-3 font-semibold text-green-900 transition hover:bg-yellow-300"
            >
              Shop Products
            </Link>

            <Link
              href="/quote"
              className="rounded-lg border border-white/30 bg-white/10 px-6 py-3 font-semibold transition hover:bg-white/20"
            >
              Get Wholesale Pricing
            </Link>
          </div>
          {/* TRUST */}
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-green-200">
            <span>✅ Bulk Discounts</span>
            <span>🚚 Fast Local Pickup</span>
            <span>📦 Wholesale Supply</span>
          </div>
          {/* LOCATION */}
          <a
            href="https://www.google.com/maps/search/?api=1&query=Frednes+International+Market+Orange+NJ"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block text-sm text-green-200 underline hover:text-white"
          >
            📍 51 Park St, Orange, NJ • Open to Public & Bulk Buyers
          </a>
        </div>
        {/* RIGHT (IMAGE GRID) */}
        <div className="grid grid-cols-2 gap-4">
          <Image
            src="/images/fredness-rice.jpeg"
            alt="Rice"
            width={200}
            height={50}
            className="h-40 w-full rounded-xl object-cover"
          />
          <Image
            src="/images/fredness-yam.jpg"
            alt="Yam"
            width={200}
            height={50}
            className="h-40 w-full rounded-xl object-cover"
          />
          <Image
            src="/images/fredness-fish.jpeg"
            alt="Smoked Fish"
            width={200}
            height={50}
            className="h-40 w-full rounded-xl object-cover"
          />
          <Image
            src="/images/fredness-malt.jpeg"
            alt="Malt Drink"
            width={200}
            height={50}
            className="h-40 w-full rounded-xl object-cover"
          />
        </div>
      </div>
    </section>
  );
}
