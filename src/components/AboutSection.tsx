import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  ShoppingBag, 
  Package, 
  MapPin,
  CheckCircle,
  Smartphone,
  Clock
} from "lucide-react";

const stats = [
  {
    id: 1,
    icon: Users,
    count: "46 Million+",
    label: "Registered users as of Oct 31, 2024",
    color: "text-blue-500"
  },
  {
    id: 2,
    icon: ShoppingBag,
    count: "66 Million+",
    label: "Orders on Curemate till date",
    color: "text-green-500"
  },
  {
    id: 3,
    icon: Package,
    count: "60000+",
    label: "Unique items sold last 6 months",
    color: "text-purple-500"
  },
  {
    id: 4,
    icon: MapPin,
    count: "19000+",
    label: "Pin codes serviced last 3 months",
    color: "text-red-500"
  }
];

const features = [
  {
    id: 1,
    title: "Wide Network",
    description: "Connected with 1000+ pharmacies across India",
    icon: MapPin
  },
  {
    id: 2,
    title: "Quality Assured",
    description: "All medicines are sourced from certified suppliers",
    icon: CheckCircle
  },
  {
    id: 3,
    title: "24/7 Support",
    description: "Round the clock customer support available",
    icon: Clock
  }
  // Removed Mobile App feature
];

const AboutSection = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Why Choose Us Stats */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-12">
            Why Choose Us?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              
              return (
                <Card 
                  key={stat.id}
                  className={`
                    medical-card p-6 text-center hover-lift
                    animate-fade-in
                  `}
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="space-y-4">
                    <div className={`${stat.color} mx-auto`}>
                      <IconComponent className="h-12 w-12 mx-auto" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">
                        {stat.count}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* About Curemate */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Simplifying Healthcare
              </h2>
              <h3 className="text-xl md:text-2xl text-primary mb-6">
                Impacting Lives
              </h3>
            </div>
            
            <div className="space-y-4 text-muted-foreground">
              <p className="text-lg leading-relaxed">
                <strong className="text-foreground">Curemate</strong> is a web app designed to provide 
                seamless access to pharmaceutical products by linking users to their nearest pharmacy.
              </p>
              <p className="leading-relaxed">
                We show stock availability for local stores so users can choose home delivery 
                or pick up directly. Our platform ensures you get genuine medicines at 
                competitive prices with the convenience of digital ordering.
              </p>
              <p className="leading-relaxed">
                With our extensive network of verified pharmacies, we're making healthcare 
                more accessible and affordable for everyone across India.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button variant="outline" size="lg">
                Learn More About Us
              </Button>
            </div>
          </div>

          <div className="space-y-6 animate-slide-up">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                
                return (
                  <Card 
                    key={feature.id}
                    className={`
                      medical-card p-4 hover-lift
                      animate-bounce-in
                    `}
                    style={{ animationDelay: `${index * 200}ms` }}
                  >
                    <div className="space-y-3">
                      <div className="bg-primary/10 p-3 rounded-lg w-fit">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">
                          {feature.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;