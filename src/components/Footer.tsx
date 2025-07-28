import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Facebook, 
  Instagram, 
  Youtube, 
  Twitter, 
  MessageCircle,
  Heart
} from "lucide-react";

const footerSections = {
  company: [
    "About Us",
    "Careers", 
    "Blog",
    "Partner with Curemate"
  ],
  services: [
    "Order Medicine",
    "Healthcare Products", 
    "Lab Tests",
    "Find Nearest Collection Centre"
  ],
  categories: [
    "Must Haves",
    "Diabetes Essentials",
    "Vitamins & Supplements", 
    "Heart Care",
    "Ayurvedic Care",
    "Sports Nutrition"
  ],
  help: [
    "Browse All Medicines",
    "Browse All Cities",
    "FAQs"
  ],
  policy: [
    "Privacy Policy",
    "Terms and Conditions", 
    "Return Policy"
  ]
};

const paymentPartners = [
  "💳", "💰", "🏦", "💎"
];

const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t border-border">
      {/* WhatsApp Float Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          size="icon"
          className="h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-strong hover:shadow-[0_0_20px_rgba(34,197,94,0.4)]"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-2">
              {footerSections.company.map((item, index) => (
                <li key={index}>
                  <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-primary text-left">
                    {item}
                  </Button>
                </li>
              ))}
            </ul>
          </div>

          {/* Our Services */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Our Services</h4>
            <ul className="space-y-2">
              {footerSections.services.map((item, index) => (
                <li key={index}>
                  <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-primary text-left">
                    {item}
                  </Button>
                </li>
              ))}
            </ul>
          </div>

          {/* Featured Categories */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Featured Categories</h4>
            <ul className="space-y-2">
              {footerSections.categories.map((item, index) => (
                <li key={index}>
                  <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-primary text-left">
                    {item}
                  </Button>
                </li>
              ))}
            </ul>
          </div>

          {/* Need Help */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Need Help</h4>
            <ul className="space-y-2">
              {footerSections.help.map((item, index) => (
                <li key={index}>
                  <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-primary text-left">
                    {item}
                  </Button>
                </li>
              ))}
            </ul>
          </div>

          {/* Policy Info */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Policy Info</h4>
            <ul className="space-y-2">
              {footerSections.policy.map((item, index) => (
                <li key={index}>
                  <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-primary text-left">
                    {item}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Social Media & Payment Partners */}
        <div className="space-y-6">
          {/* Follow Us */}
          <div className="text-center">
            <h4 className="font-semibold text-foreground mb-4">Follow us on</h4>
            <div className="flex justify-center space-x-4">
              <Button variant="outline" size="icon" className="hover:bg-blue-50 hover:border-blue-200">
                <Instagram className="h-5 w-5 text-pink-500" />
              </Button>
              <Button variant="outline" size="icon" className="hover:bg-blue-50 hover:border-blue-200">
                <Facebook className="h-5 w-5 text-blue-600" />
              </Button>
              <Button variant="outline" size="icon" className="hover:bg-red-50 hover:border-red-200">
                <Youtube className="h-5 w-5 text-red-600" />
              </Button>
              <Button variant="outline" size="icon" className="hover:bg-blue-50 hover:border-blue-200">
                <Twitter className="h-5 w-5 text-blue-400" />
              </Button>
            </div>
          </div>

          {/* Payment Partners - Simplified */}
          <div className="text-center">
            <h4 className="font-semibold text-foreground mb-4">Payment Options</h4>
            <div className="flex justify-center items-center space-x-4 flex-wrap gap-2">
              {paymentPartners.map((icon, index) => (
                <div 
                  key={index}
                  className="bg-white border border-border rounded-lg p-3 text-2xl hover:shadow-medium transition-shadow"
                >
                  {icon}
                </div>
              ))}
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Copyright */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 text-muted-foreground">
            <span>© 2025 Curemate. All Rights Reserved</span>
          </div>
          <div className="flex items-center justify-center space-x-1 text-sm text-muted-foreground">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-500 fill-current" />
            <span>for better healthcare access</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;