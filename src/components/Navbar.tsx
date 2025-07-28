import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  MapPin, 
  ShoppingCart, 
  User, 
  Menu, 
  X,
  Heart,
  Gift,
  Phone
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount] = useState(3);

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      {/* Top Bar */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-2 text-sm">
          <div className="flex items-center space-x-4 text-muted-foreground">
            <span className="hidden md:flex items-center space-x-1">
              <span className="text-primary font-medium">Take it easy</span>
            </span>
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4 text-accent" />
              <span>Express delivery to</span>
              <span className="font-medium">400001 Mumbai</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="hidden md:inline text-muted-foreground">Hello, Log in</span>
            <div className="flex items-center space-x-1">
              <Gift className="h-4 w-4 text-accent" />
              <span className="font-medium">Offers</span>
            </div>
            <div className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs bg-accent text-accent-foreground">
                  {cartCount}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className="bg-primary p-2 rounded-lg">
                  <Heart className="h-6 w-6 text-primary-foreground fill-current" />
                </div>
                <span className="text-xl font-bold text-primary">Curemate</span>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center space-x-6">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="hover:text-primary">
                      Medicine
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Prescription Medicines</DropdownMenuItem>
                    <DropdownMenuItem>OTC Medicines</DropdownMenuItem>
                    <DropdownMenuItem>Ayurvedic</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="ghost" className="hover:text-primary">
                  Lab Tests
                </Button>

                <Button variant="ghost" className="hover:text-primary">
                  Doctor Consult
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="hover:text-primary">
                      Healthcare
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Health Devices</DropdownMenuItem>
                    <DropdownMenuItem>Wellness Products</DropdownMenuItem>
                    <DropdownMenuItem>Personal Care</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="hover:text-primary">
                      Health Blogs
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Health Tips</DropdownMenuItem>
                    <DropdownMenuItem>Disease Info</DropdownMenuItem>
                    <DropdownMenuItem>Wellness Guide</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="ghost" className="hover:text-primary">
                  PLUS
                </Button>

                <Button variant="ghost" className="hover:text-primary">
                  Value Store
                </Button>
              </nav>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search for medicines, health tests, skincare..."
                  className="pl-10 pr-4 py-2 w-full rounded-full border-border focus:border-primary"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="hidden md:flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>Find a Store</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Mumbai Stores</DropdownMenuItem>
                  <DropdownMenuItem>Delhi Stores</DropdownMenuItem>
                  <DropdownMenuItem>Bangalore Stores</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="ghost" className="hidden md:flex items-center space-x-1">
                <Phone className="h-4 w-4" />
                <span>Contact Us</span>
              </Button>

              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <User className="h-4 w-4 mr-2" />
                Login
              </Button>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search medicines..."
                className="pl-10 pr-4 py-2 w-full rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background">
          <div className="container mx-auto px-4 py-4">
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start">Medicine</Button>
              <Button variant="ghost" className="w-full justify-start">Lab Tests</Button>
              <Button variant="ghost" className="w-full justify-start">Doctor Consult</Button>
              <Button variant="ghost" className="w-full justify-start">Healthcare</Button>
              <Button variant="ghost" className="w-full justify-start">Health Blogs</Button>
              <Button variant="ghost" className="w-full justify-start">PLUS</Button>
              <Button variant="ghost" className="w-full justify-start">Value Store</Button>
              <hr className="my-4" />
              <Button variant="ghost" className="w-full justify-start">
                <MapPin className="h-4 w-4 mr-2" />
                Find a Store
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Phone className="h-4 w-4 mr-2" />
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;