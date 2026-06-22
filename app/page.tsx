import CategoryGrid from "@/components/CategoryGrid";
import FeaturedProducts from "@/components/FeaturedProducts";
import Hero from "@/components/Hero";
import WhyUs from "@/components/WhyUs";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <main>
      <Hero />
      <CategoryGrid />
      <FeaturedProducts />
      <WhyUs />
    </main>
  );
}
