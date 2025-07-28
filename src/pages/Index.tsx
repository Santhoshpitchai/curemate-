import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CategorySection from "@/components/CategorySection";
import ImageCarousel from "@/components/ImageCarousel";
import HealthConcernSection from "@/components/HealthConcernSection";
import TrendingSection from "@/components/TrendingSection";
import AboutSection from "@/components/AboutSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <CategorySection />
      <ImageCarousel />
      <HealthConcernSection />
      <TrendingSection />
      <AboutSection />
      <Footer />
    </div>
  );
};

export default Index;
