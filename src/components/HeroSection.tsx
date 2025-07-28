import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { 
  Search, 
  Camera, 
  Upload,
  X,
  FileText,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      toast({
        title: "Searching...",
        description: `Looking for "${searchQuery}"`,
      });
    }
  };

  const handleFileUpload = (file: File) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload PDF, JPEG, JPG, or PNG files only.",
        variant: "destructive",
      });
      return;
    }

    setUploadedFile(file);
    toast({
      title: "Prescription uploaded successfully!",
      description: "We'll process your prescription shortly.",
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <section className="bg-hero-gradient py-16 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-light/10 to-secondary/20"></div>
      <div className="absolute top-10 right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 left-10 w-48 h-48 bg-accent/5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            What are you looking for?
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Find medicines, book lab tests, consult doctors - all in one place
          </p>
        </div>

        {/* Main Search Bar */}
        <div className="max-w-4xl mx-auto mb-8 animate-slide-up">
          <Card className="p-6 shadow-strong">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search for medicines, health tests, skincare..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-4 text-lg rounded-xl border-border focus:border-primary"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsUploadModalOpen(true)}
                  className="flex items-center space-x-2 hover-lift"
                >
                  <Camera className="h-5 w-5" />
                  <span className="hidden sm:inline">Upload Prescription</span>
                </Button>
                
                <Button 
                  size="lg"
                  onClick={handleSearch}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 hover-lift"
                >
                  Search
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Order with Prescription CTA */}
        <div className="max-w-4xl mx-auto animate-bounce-in">
          <Card className="p-4 bg-accent/10 border-accent/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-accent p-2 rounded-lg">
                  <FileText className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Order with prescription</h3>
                  <p className="text-sm text-muted-foreground">Upload prescription and we will deliver your medicines</p>
                </div>
              </div>
              <Button variant="outline" className="hover-lift">
                UPLOAD NOW
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Upload Prescription</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsUploadModalOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver ? 'border-primary bg-primary/5' : 'border-border'
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
            >
              {uploadedFile ? (
                <div className="space-y-4">
                  <CheckCircle className="h-12 w-12 text-success mx-auto" />
                  <div>
                    <h4 className="font-medium text-foreground">{uploadedFile.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    onClick={() => setUploadedFile(null)}
                    variant="outline"
                    size="sm"
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                  <div>
                    <h4 className="font-medium text-foreground">
                      Drag and drop your prescription here
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      or click to browse files
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Supports PDF, JPEG, JPG, PNG
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.jpeg,.jpg,.png"
                    onChange={handleFileInputChange}
                    className="hidden"
                    id="prescription-upload"
                  />
                  <label htmlFor="prescription-upload">
                    <Button variant="outline" asChild>
                      <span className="cursor-pointer">Browse Files</span>
                    </Button>
                  </label>
                </div>
              )}
            </div>

            {uploadedFile && (
              <div className="mt-6 space-y-3">
                <Button 
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => {
                    toast({
                      title: "Prescription submitted!",
                      description: "We'll contact you shortly with medicine availability.",
                    });
                    setIsUploadModalOpen(false);
                    setUploadedFile(null);
                  }}
                >
                  Submit Prescription
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}
    </section>
  );
};

export default HeroSection;