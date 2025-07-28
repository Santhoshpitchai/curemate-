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
      {/* Main Navigation */}
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
              <Button variant="ghost" className="hover:text-primary">
                About Us
              </Button>
            </nav>
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

            {/* Cart Icon */}
            <div className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs bg-accent text-accent-foreground">
                  {cartCount}
                </Badge>
              )}
            </div>

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

      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background">
          <div className="container mx-auto px-4 py-4">
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start">About Us</Button>
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