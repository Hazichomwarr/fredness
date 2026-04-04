import BestSellers from "./_components/BestSellers";
import BundlesSection from "./_components/BundlesSection";
import CategoryGrid from "./_components/CategoryGrid";
import Hero from "./_components/Hero";
import WhyUs from "./_components/WhyUs";

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
