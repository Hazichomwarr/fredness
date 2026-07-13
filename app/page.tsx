import CategoryGrid from "@/components/CategoryGrid";
import FeaturedProducts from "@/components/FeaturedProducts";
import Hero from "@/components/Hero";
import Navbar from "@/components/layout/Navbar";
import WhyUs from "@/components/WhyUs";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <main>
      {/* <Navbar /> */}
      <Hero />
      <CategoryGrid />
      <FeaturedProducts />
      <WhyUs />
    </main>
  );
}
