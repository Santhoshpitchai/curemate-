import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, Heart } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const trendingProducts = [
  {
    id: 1,
    name: "Dolo 650 Tablet",
    dosage: "Strip of 15 tablets",
    originalPrice: 65.50,
    discountedPrice: 32.75,
    discount: 50,
    rating: 4.5,
    reviews: 1250,
    image: "💊",
    inStock: true,
    prescription: false
  },
  {
    id: 2,
    name: "Vitamin D3 Capsules",
    dosage: "Bottle of 60 capsules",
    originalPrice: 299.00,
    discountedPrice: 199.00,
    discount: 33,
    rating: 4.7,
    reviews: 890,
    image: "🟡",
    inStock: true,
    prescription: false
  },
  {
    id: 3,
    name: "Omega 3 Fish Oil",
    dosage: "Bottle of 30 capsules",
    originalPrice: 450.00,
    discountedPrice: 315.00,
    discount: 30,
    rating: 4.6,
    reviews: 567,
    image: "🐟",
    inStock: true,
    prescription: false
  },
  {
    id: 4,
    name: "Multivitamin Tablets",
    dosage: "Strip of 10 tablets",
    originalPrice: 180.00,
    discountedPrice: 126.00,
    discount: 30,
    rating: 4.4,
    reviews: 432,
    image: "🟢",
    inStock: true,
    prescription: false
  },
  {
    id: 5,
    name: "Calcium + D3 Tablets",
    dosage: "Strip of 15 tablets",
    originalPrice: 120.00,
    discountedPrice: 84.00,
    discount: 30,
    rating: 4.3,
    reviews: 298,
    image: "⚪",
    inStock: false,
    prescription: false
  },
  {
    id: 6,
    name: "Zinc Tablets",
    dosage: "Strip of 20 tablets",
    originalPrice: 75.00,
    discountedPrice: 52.50,
    discount: 30,
    rating: 4.2,
    reviews: 156,
    image: "🔵",
    inStock: true,
    prescription: false
  },
  // New products added below
  {
    id: 7,
    name: "Protein Powder",
    dosage: "Jar of 500g",
    originalPrice: 1200.00,
    discountedPrice: 960.00,
    discount: 20,
    rating: 4.8,
    reviews: 723,
    image: "🥛",
    inStock: true,
    prescription: false
  },
  {
    id: 8,
    name: "Vitamin C Tablets",
    dosage: "Strip of 30 tablets",
    originalPrice: 220.00,
    discountedPrice: 154.00,
    discount: 30,
    rating: 4.5,
    reviews: 412,
    image: "🍊",
    inStock: true,
    prescription: false
  },
  {
    id: 9,
    name: "Blood Glucose Monitor",
    dosage: "Device with 10 strips",
    originalPrice: 1500.00,
    discountedPrice: 1125.00,
    discount: 25,
    rating: 4.7,
    reviews: 328,
    image: "📱",
    inStock: true,
    prescription: false
  },
  {
    id: 10,
    name: "Ayurvedic Immunity Booster",
    dosage: "Bottle of 60 capsules",
    originalPrice: 350.00,
    discountedPrice: 280.00,
    discount: 20,
    rating: 4.4,
    reviews: 189,
    image: "🌿",
    inStock: true,
    prescription: false
  },
  {
    id: 11,
    name: "Digital Thermometer",
    dosage: "1 Unit",
    originalPrice: 250.00,
    discountedPrice: 175.00,
    discount: 30,
    rating: 4.6,
    reviews: 276,
    image: "🌡️",
    inStock: true,
    prescription: false
  },
  {
    id: 12,
    name: "N95 Face Masks",
    dosage: "Pack of 10",
    originalPrice: 400.00,
    discountedPrice: 320.00,
    discount: 20,
    rating: 4.5,
    reviews: 512,
    image: "😷",
    inStock: true,
    prescription: false
  }
];

const TrendingSection = () => {
  const [likedProducts, setLikedProducts] = useState<number[]>([]);
  const { toast } = useToast();

  const toggleLike = (productId: number) => {
    setLikedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const addToCart = (product: any) => {
    if (!product.inStock) {
      toast({
        title: "Out of stock",
        description: "This product is currently unavailable",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Added to cart!",
      description: `${product.name} has been added to your cart`,
    });
  };

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Trending Near You
            </h2>
            <p className="text-muted-foreground">
              Popular medicines and health products in your area
            </p>
          </div>
          <Button variant="outline" className="hidden md:flex">
            View All Products
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {trendingProducts.map((product, index) => (
            <Card 
              key={product.id}
              className={`
                medical-card p-4 relative overflow-hidden group
                ${!product.inStock ? 'opacity-75' : ''}
                animate-fade-in hover-lift
              `}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Discount Badge */}
              {product.discount > 0 && (
                <Badge className="absolute top-2 left-2 bg-success text-success-foreground text-xs">
                  {product.discount}% OFF
                </Badge>
              )}

              {/* Wishlist Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => toggleLike(product.id)}
              >
                <Heart 
                  className={`h-4 w-4 ${
                    likedProducts.includes(product.id) 
                      ? 'fill-red-500 text-red-500' 
                      : 'text-muted-foreground'
                  }`} 
                />
              </Button>

              {/* Product Image */}
              <div className="text-center mb-3">
                <div className="text-5xl mb-2">{product.image}</div>
                {!product.inStock && (
                  <Badge variant="destructive" className="text-xs">
                    Out of Stock
                  </Badge>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-foreground line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {product.dosage}
                </p>

                {/* Rating */}
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-medium">{product.rating}</span>
                  <span className="text-xs text-muted-foreground">
                    ({product.reviews})
                  </span>
                </div>

                {/* Pricing */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-foreground">
                      ₹{product.discountedPrice.toFixed(2)}
                    </span>
                    {product.originalPrice > product.discountedPrice && (
                      <span className="text-xs text-muted-foreground line-through">
                        MRP ₹{product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Add to Cart Button */}
                <Button
                  onClick={() => addToCart(product)}
                  disabled={!product.inStock}
                  className={`
                    w-full text-xs h-8
                    ${product.inStock 
                      ? 'bg-primary hover:bg-primary/90' 
                      : 'bg-muted text-muted-foreground'
                    }
                  `}
                >
                  <ShoppingCart className="h-3 w-3 mr-1" />
                  {product.inStock ? 'Add to Cart' : 'Notify Me'}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="text-center mt-8 md:hidden">
          <Button variant="outline" className="w-full">
            View All Products
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TrendingSection;