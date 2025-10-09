import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CloudSun, Droplets, Wind, Thermometer, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WeatherData {
  temp: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  location: string;
}

const Weather = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWeatherData();
  }, []);

  const getWeatherData = async () => {
    try {
      // Get user location
      if (!navigator.geolocation) {
        toast({
          title: "Location not supported",
          description: "Your browser doesn't support geolocation",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Fetch weather data from Open-Meteo API (free, no API key needed)
          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`
          );
          
          const data = await response.json();
          
          // Map weather codes to conditions
          const weatherCode = data.current.weather_code;
          const conditions = [
            { codes: [0], label: "Clear" },
            { codes: [1, 2, 3], label: "Partly Cloudy" },
            { codes: [45, 48], label: "Foggy" },
            { codes: [51, 53, 55, 61, 63, 65], label: "Rainy" },
            { codes: [71, 73, 75, 77], label: "Snowy" },
            { codes: [80, 81, 82], label: "Showers" },
            { codes: [95, 96, 99], label: "Thunderstorm" },
          ];
          
          const condition = conditions.find(c => c.codes.includes(weatherCode))?.label || "Unknown";
          
          setWeather({
            temp: Math.round(data.current.temperature_2m),
            humidity: data.current.relative_humidity_2m,
            windSpeed: Math.round(data.current.wind_speed_10m),
            condition,
            location: `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`,
          });
          setLoading(false);
        },
        (error) => {
          toast({
            title: "Location access denied",
            description: "Please enable location access to see weather data",
            variant: "destructive",
          });
          setLoading(false);
        }
      );
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch weather data",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

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
            <CardDescription className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {loading ? "Getting location..." : weather?.location || "Location unavailable"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground">Loading weather data...</p>
            ) : weather ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <Thermometer className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="text-2xl font-bold">{weather.temp}°C</p>
                      <p className="text-sm text-muted-foreground">Temperature</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <Droplets className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="text-2xl font-bold">{weather.humidity}%</p>
                      <p className="text-sm text-muted-foreground">Humidity</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <Wind className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="text-2xl font-bold">{weather.windSpeed} km/h</p>
                      <p className="text-sm text-muted-foreground">Wind Speed</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <CloudSun className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="text-2xl font-bold">{weather.condition}</p>
                      <p className="text-sm text-muted-foreground">Conditions</p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-muted">
                  <CardHeader>
                    <CardTitle className="text-lg">Today's Farming Tips</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {weather.temp > 30 && (
                      <p>• High temperature - water crops early morning and evening</p>
                    )}
                    {weather.temp < 15 && (
                      <p>• Cool weather - protect sensitive plants from cold</p>
                    )}
                    {weather.humidity > 70 && (
                      <p>• High humidity - watch for fungal diseases</p>
                    )}
                    {weather.humidity < 40 && (
                      <p>• Low humidity - increase watering frequency</p>
                    )}
                    {weather.windSpeed > 20 && (
                      <p>• Strong winds - secure tall plants and structures</p>
                    )}
                    {weather.condition.includes("Rain") && (
                      <p>• Rainy conditions - delay fertilizer application</p>
                    )}
                    {weather.condition === "Clear" && (
                      <p>• Clear skies - good time for transplanting and planting</p>
                    )}
                    <p>• Monitor plants regularly for pest activity</p>
                  </CardContent>
                </Card>
              </>
            ) : (
              <p className="text-center text-muted-foreground">Unable to load weather data</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Weather;
