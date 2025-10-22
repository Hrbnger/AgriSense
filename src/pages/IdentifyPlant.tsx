import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Camera, Upload, Leaf, Droplet, Sun, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface IdentificationResult {
  plantName: string;
  scientificName: string;
  plantType: string;
  suitableEnvironment: string;
  careInstructions: string;
  confidence: number;
}

const IdentifyPlant = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [identifying, setIdentifying] = useState(false);
  const [result, setResult] = useState<IdentificationResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const processFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
      toast({
        title: "Image loaded",
        description: "Image ready for identification",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleIdentify = async () => {
    if (!selectedImage) {
      toast({
        title: "No image selected",
        description: "Please select or capture an image first",
        variant: "destructive",
      });
      return;
    }

    setIdentifying(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('identify-plant', {
        body: { imageData: selectedImage }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
      toast({
        title: "Plant Identified!",
        description: `${data.plantName} identified with ${data.confidence}% confidence`,
      });
    } catch (error: any) {
      console.error('Identification error:', error);
      toast({
        title: "Identification Failed",
        description: error.message || "Failed to identify plant. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIdentifying(false);
    }
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
            <CardTitle>Identify Plant</CardTitle>
            <CardDescription>Take or upload a photo to identify plants</CardDescription>
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

            {selectedImage ? (
              <div className="relative rounded-lg overflow-hidden border">
                <img src={selectedImage} alt="Selected plant" className="w-full h-64 object-cover" />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={clearImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragOver
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">
                  Drag and drop an image here, or click the buttons below
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports JPG, PNG, GIF up to 10MB
                </p>
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
              onClick={handleIdentify}
              disabled={!selectedImage || identifying}
              className="w-full"
            >
              {identifying ? "Identifying..." : "Identify Plant"}
            </Button>

            {result && (
              <div className="mt-6 space-y-4">
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Leaf className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg">{result.plantName}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground italic">{result.scientificName}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs font-medium px-2 py-1 bg-primary/10 rounded">
                      {result.plantType}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Confidence: {result.confidence}%
                    </span>
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Sun className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">Suitable Environment</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {result.suitableEnvironment}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Droplet className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">Care Instructions</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {result.careInstructions}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IdentifyPlant;
