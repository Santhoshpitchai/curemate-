import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const healthConcerns = [
  {
    id: 1,
    name: "Full Body Checkups",
    image: "🩺",
    bgColor: "bg-green-100",
    textColor: "text-green-800"
  },
  {
    id: 2,
    name: "Vitamins",
    image: "🍊",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-800"
  },
  {
    id: 3,
    name: "Diabetes",
    image: "🩸",
    bgColor: "bg-blue-100",
    textColor: "text-blue-800"
  }
];

const HealthConcernSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerView = 3;
  const maxIndex = Math.max(0, healthConcerns.length - itemsPerView);

  const scrollLeft = () => {
    setCurrentIndex(Math.max(0, currentIndex - 1));
  };

  const scrollRight = () => {
    setCurrentIndex(Math.min(maxIndex, currentIndex + 1));
  };

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Lab Tests by Health Concern
          </h2>
          <p className="text-muted-foreground flex items-center space-x-2">
            <span>Powered by</span>
            <span className="font-semibold text-primary">Thyrocare</span>
          </p>
        </div>

        <div className="relative">
          {/* Navigation Arrows */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 z-10 h-10 w-10 rounded-full shadow-medium"
            onClick={scrollLeft}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 z-10 h-10 w-10 rounded-full shadow-medium"
            onClick={scrollRight}
            disabled={currentIndex >= maxIndex}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          {/* Scrollable Container */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-300 ease-in-out gap-4"
              style={{ 
                transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
                width: `${(healthConcerns.length / itemsPerView) * 100}%`
              }}
            >
              {healthConcerns.map((concern, index) => (
                <Card
                  key={concern.id}
                  className={`
                    flex-shrink-0 cursor-pointer p-6 text-center
                    ${concern.bgColor} border-0 hover-lift
                    transition-all duration-300 hover:shadow-medium
                    animate-fade-in
                  `}
                  style={{ 
                    width: `${100 / itemsPerView}%`,
                    animationDelay: `${index * 50}ms`
                  }}
                >
                  <div className="space-y-3">
                    <div className="text-4xl mb-3">
                      {concern.image}
                    </div>
                    <h3 className={`font-semibold text-sm md:text-base ${concern.textColor}`}>
                      {concern.name}
                    </h3>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Dots Indicator */}
        <div className="flex justify-center space-x-2 mt-6 md:hidden">
          {Array.from({ length: maxIndex + 1 }, (_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-primary scale-125' 
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/60'
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HealthConcernSection;