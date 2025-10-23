import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Camera, Upload, Leaf, Droplet, Sun, X, Globe, Calendar, AlertTriangle, Heart, Sprout, Bug } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface IdentificationResult {
  plantName: string;
  scientificName: string;
  plantType: string;
  family: string;
  origin: string;
  suitableEnvironment: string;
  careInstructions: string;
  growthHabit: string;
  floweringSeason: string;
  toxicity: string;
  uses: string;
  propagation: string;
  commonProblems: string;
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
      
      // Check if we're using mock data
      const isMockData = data.plantName === "Sample Plant";
      
      toast({
        title: isMockData ? "Demo Mode - Plant Identified!" : "Plant Identified!",
        description: isMockData 
          ? "Using demo data. Configure Supabase for real AI analysis."
          : `${data.plantName} identified with ${data.confidence}% confidence`,
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
            <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Demo Mode</span>
              </div>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                Currently using demo data. To enable real AI plant identification, configure Supabase credentials.
              </p>
            </div>
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
                {/* Main Plant Info */}
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Leaf className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg">{result.plantName}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground italic mb-2">{result.scientificName}</p>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-xs font-medium px-2 py-1 bg-primary/10 rounded">
                      {result.plantType}
                    </span>
                    <span className="text-xs font-medium px-2 py-1 bg-blue-100 dark:bg-blue-900/20 rounded">
                      {result.family}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Confidence: {result.confidence}%
                    </span>
                  </div>
                </div>

                {/* Basic Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">Origin & Family</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium">Family:</span>
                          <p className="text-sm text-muted-foreground">{result.family}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Native Region:</span>
                          <p className="text-sm text-muted-foreground">{result.origin}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Sprout className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">Growth Habit</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{result.growthHabit}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Environment & Care */}
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

                {/* Flowering & Uses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">Flowering Season</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{result.floweringSeason}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Heart className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">Uses</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{result.uses}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Toxicity Warning */}
                {result.toxicity && result.toxicity !== "Unknown" && result.toxicity.toLowerCase().includes("toxic") && (
                  <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <CardTitle className="text-lg text-red-800 dark:text-red-200">Toxicity Warning</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-red-700 dark:text-red-300">{result.toxicity}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Propagation & Problems */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Sprout className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">Propagation</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{result.propagation}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Bug className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">Common Problems</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{result.commonProblems}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IdentifyPlant;
