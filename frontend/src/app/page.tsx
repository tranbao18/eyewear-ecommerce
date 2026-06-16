import HeroBanner from "@/components/home/HeroBanner";
import CategorySection from "@/components/home/CategorySection";
import FeaturedProducts from "@/components/home/FeaturedProducts";

export default function Home() {
  return (
    <div className="w-full flex flex-col">
      <HeroBanner />
      <CategorySection />
      <FeaturedProducts />
    </div>
  );
}
