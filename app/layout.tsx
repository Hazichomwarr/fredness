import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TopBar from "@/components/TopBar";
// import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Frednes International Market | African & Caribbean Wholesale Food",

  description:
    "Frednes International Market offers wholesale and retail African & Caribbean foods in Orange, NJ. Shop bulk rice, yams, smoked fish, spices, drinks, and more. Open to the public and businesses.",

  keywords: [
    "African food wholesale",
    "Caribbean grocery store",
    "African market Orange NJ",
    "bulk African food USA",
    "buy yam near me",
    "smoked fish African store",
    "wholesale rice African",
    "Caribbean food supplier",
  ],

  openGraph: {
    title: "Frednes International Market",
    description:
      "Wholesale & retail African and Caribbean foods. Bulk deals available. Located in Orange, NJ.",
    url: "https://frednesmarket.com", // update later
    siteName: "Frednes International Market",
    type: "website",
  },

  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TopBar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
