import BestSellers from "@/components/BestSellers";
import BundlesSection from "@/components/BundlesSection";
import CategoryGrid from "@/components/CategoryGrid";
import Hero from "@/components/Hero";
import WhyUs from "@/components/WhyUs";

export default function page() {
  return (
    <main>
      <Hero />
      <CategoryGrid />
      <BestSellers />
      <BundlesSection />
      <WhyUs />
    </main>
  );
}
