import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CloudSun, Droplets, Wind, Thermometer } from "lucide-react";

const Weather = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Weather & Farming Tips</CardTitle>
            <CardDescription>Get localized farming advice based on weather</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6 text-center">
                  <Thermometer className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">28°C</p>
                  <p className="text-sm text-muted-foreground">Temperature</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Droplets className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">65%</p>
                  <p className="text-sm text-muted-foreground">Humidity</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Wind className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">12 km/h</p>
                  <p className="text-sm text-muted-foreground">Wind Speed</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <CloudSun className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">Sunny</p>
                  <p className="text-sm text-muted-foreground">Conditions</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-muted">
              <CardHeader>
                <CardTitle className="text-lg">Today's Farming Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>• Perfect weather for watering crops early morning</p>
                <p>• Consider applying fertilizer before evening</p>
                <p>• Good conditions for pest control spray</p>
                <p>• Monitor plants for heat stress in afternoon</p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Weather;
