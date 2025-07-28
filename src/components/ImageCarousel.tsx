import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import heroMedical from "@/assets/hero-medical.jpg";
import promoBanner1 from "@/assets/promo-banner-1.jpg";
import promoBanner2 from "@/assets/promo-banner-2.jpg";
import promoBanner3 from "@/assets/promo-banner-3.jpg";

const carouselImages = [
  {
    id: 1,
    src: heroMedical,
    alt: "Healthcare Hero",
    title: "Your Health, Our Priority",
    subtitle: "Quality medicines and healthcare products delivered to your doorstep",
    cta: "Shop Now"
  },
  {
    id: 2,
    src: promoBanner1,
    alt: "Medicine Promotion",
    title: "Medicine & Wellness",
    subtitle: "Up to 50% off on medicines and health supplements",
    cta: "Explore Deals"
  },
  {
    id: 3,
    src: promoBanner2,
    alt: "Doctor Consultation",
    title: "Online Doctor Consultation",
    subtitle: "Consult certified doctors from the comfort of your home",
    cta: "Book Now"
  },
  {
    id: 4,
    src: promoBanner3,
    alt: "Health Supplements",
    title: "Premium Supplements",
    subtitle: "Boost your immunity with our curated health supplements",
    cta: "Discover More"
  }
];

const ImageCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Auto-slide functionality
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const goToPrevious = () => {
    setCurrentSlide((prev) => 
      prev === 0 ? carouselImages.length - 1 : prev - 1
    );
    setIsPlaying(false);
    setTimeout(() => setIsPlaying(true), 3000);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    setIsPlaying(false);
    setTimeout(() => setIsPlaying(true), 3000);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsPlaying(false);
    setTimeout(() => setIsPlaying(true), 3000);
  };

  return (
    <section className="py-8 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="relative rounded-2xl overflow-hidden shadow-strong">
          {/* Carousel Container */}
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {carouselImages.map((image, index) => (
              <div key={image.id} className="w-full flex-shrink-0 relative">
                <div className="aspect-[16/6] md:aspect-[16/5] lg:aspect-[16/4] relative">
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay Content */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
                    <div className="container mx-auto px-4">
                      <div className="max-w-lg text-white space-y-4 animate-fade-in">
                        <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold">
                          {image.title}
                        </h2>
                        <p className="text-lg md:text-xl opacity-90">
                          {image.subtitle}
                        </p>
                        <Button 
                          size="lg"
                          className="bg-primary hover:bg-primary/90 text-primary-foreground hover-lift mt-6"
                        >
                          {image.cta}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <Button
            variant="secondary"
            size="icon"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 h-12 w-12 rounded-full shadow-medium hover:shadow-strong z-10"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          
          <Button
            variant="secondary"
            size="icon"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 h-12 w-12 rounded-full shadow-medium hover:shadow-strong z-10"
            onClick={goToNext}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          {/* Dots Indicator */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {carouselImages.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'bg-primary scale-125' 
                    : 'bg-white/50 hover:bg-white/80'
                }`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div 
              className="h-full bg-primary transition-all duration-100 ease-linear"
              style={{ 
                width: isPlaying ? '100%' : '0%',
                transitionDuration: isPlaying ? '5000ms' : '300ms'
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImageCarousel;