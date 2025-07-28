import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Dumbbell,
  Sparkles,
  FileText,
  Heart,
  MoreHorizontal,
  Pill,
  Stethoscope,
  Activity
} from "lucide-react";

const categories = [
  {
    id: 1,
    name: "Medicine",
    icon: Pill,
    discount: "SAVE 23%",
    color: "bg-blue-500",
    bgColor: "bg-blue-50"
  },
  {
    id: 2,
    name: "Lab Tests",
    icon: Stethoscope,
    discount: "UPTO 70% OFF",
    color: "bg-red-500",
    bgColor: "bg-red-50"
  },
  {
    id: 3,
    name: "Doctor Consult",
    icon: Activity,
    discount: "UPTO 60% OFF",
    color: "bg-green-500",
    bgColor: "bg-green-50"
  },
  {
    id: 4,
    name: "Healthcare",
    icon: Heart,
    discount: "SAVE 5% EXTRA",
    color: "bg-pink-500",
    bgColor: "bg-pink-50"
  },
  {
    id: 5,
    name: "Health Blogs",
    icon: FileText,
    discount: "UPTO 50% OFF",
    color: "bg-purple-500",
    bgColor: "bg-purple-50"
  },
  {
    id: 6,
    name: "PLUS",
    icon: Sparkles,
    discount: "UPTO 50% OFF",
    color: "bg-yellow-500",
    bgColor: "bg-yellow-50"
  },
  {
    id: 7,
    name: "Offers",
    icon: Dumbbell,
    discount: "SAVE 23%",
    color: "bg-indigo-500",
    bgColor: "bg-indigo-50"
  },
  {
    id: 8,
    name: "Value Store",
    icon: MoreHorizontal,
    discount: "UPTO 50% OFF",
    color: "bg-teal-500",
    bgColor: "bg-teal-50"
  }
];

const CategorySection = () => {
  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((category, index) => {
            const IconComponent = category.icon;
            
            return (
              <Card 
                key={category.id}
                className={`
                  health-card cursor-pointer p-6 text-center
                  ${category.bgColor} border-0
                  hover:scale-105 transition-all duration-300
                  animate-fade-in
                `}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="space-y-3">
                  <div className={`
                    ${category.color} 
                    w-16 h-16 rounded-full flex items-center justify-center mx-auto
                    shadow-medium
                  `}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground text-sm md:text-base">
                      {category.name}
                    </h3>
                    <Badge 
                      variant="secondary" 
                      className="text-xs mt-2 bg-white/80 text-red-600 font-medium"
                    >
                      {category.discount}
                    </Badge>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;