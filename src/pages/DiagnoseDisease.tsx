import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Camera, Upload } from "lucide-react";

const DiagnoseDisease = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [diagnosing, setDiagnosing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDiagnose = async () => {
    if (!selectedImage) {
      toast({
        title: "No image selected",
        description: "Please select or capture an image first",
        variant: "destructive",
      });
      return;
    }

    setDiagnosing(true);
    // Simulate API call
    setTimeout(() => {
      setDiagnosing(false);
      toast({
        title: "Disease Detected",
        description: "Early signs of leaf blight detected. Treatment recommended.",
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Diagnose Disease</CardTitle>
            <CardDescription>Detect plant diseases from leaf images</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />

            {selectedImage && (
              <div className="rounded-lg overflow-hidden border">
                <img src={selectedImage} alt="Selected leaf" className="w-full h-64 object-cover" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.setAttribute("capture", "environment");
                    fileInputRef.current.click();
                  }
                }}
                className="w-full"
              >
                <Camera className="mr-2 h-4 w-4" />
                Take Photo
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.removeAttribute("capture");
                    fileInputRef.current.click();
                  }
                }}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
            </div>

            <Button
              onClick={handleDiagnose}
              disabled={!selectedImage || diagnosing}
              className="w-full"
            >
              {diagnosing ? "Diagnosing..." : "Diagnose Disease"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DiagnoseDisease;
