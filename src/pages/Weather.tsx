import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CloudSun, Droplets, Wind, Thermometer, MapPin, RefreshCw, Sun, Umbrella } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WeatherData {
  temp: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  location: string;
  feelsLike: number;
  precipitation: number;
  uvIndex: number;
  latitude: number;
  longitude: number;
}

const Weather = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWeatherData();
  }, []);

  const getLocationName = async (latitude: number, longitude: number): Promise<string> => {
    try {
      // Use OpenStreetMap Nominatim for reverse geocoding (free, no API key)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
      );
      const data = await response.json();
      
      // Extract city, town, or village name
      const locationName = data.address.city || 
                          data.address.town || 
                          data.address.village || 
                          data.address.county || 
                          data.address.state || 
                          "Unknown Location";
      
      return `${locationName}, ${data.address.country || ''}`;
    } catch (error) {
      console.error("Failed to get location name:", error);
      return `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`;
    }
  };

  const getWeatherData = async () => {
    setLoading(true);
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
          
          // Fetch weather data from Open-Meteo API with more parameters
          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=uv_index_max&timezone=auto`
          );
          
          const data = await response.json();
          
          // Get location name
          const locationName = await getLocationName(latitude, longitude);
          
          // Map weather codes to conditions
          const weatherCode = data.current.weather_code;
          const conditions = [
            { codes: [0], label: "Clear Sky" },
            { codes: [1, 2, 3], label: "Partly Cloudy" },
            { codes: [45, 48], label: "Foggy" },
            { codes: [51, 53, 55], label: "Drizzle" },
            { codes: [61, 63, 65], label: "Rainy" },
            { codes: [71, 73, 75, 77], label: "Snowy" },
            { codes: [80, 81, 82], label: "Rain Showers" },
            { codes: [95, 96, 99], label: "Thunderstorm" },
          ];
          
          const condition = conditions.find(c => c.codes.includes(weatherCode))?.label || "Unknown";
          
          setWeather({
            temp: Math.round(data.current.temperature_2m),
            feelsLike: Math.round(data.current.apparent_temperature),
            humidity: data.current.relative_humidity_2m,
            windSpeed: Math.round(data.current.wind_speed_10m),
            precipitation: data.current.precipitation || 0,
            uvIndex: data.daily.uv_index_max[0] || 0,
            condition,
            location: locationName,
            latitude,
            longitude,
          });
          setLoading(false);
          
          toast({
            title: "Weather updated",
            description: `Weather data for ${locationName}`,
          });
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Weather & Farming Tips</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-2">
                  <MapPin className="h-4 w-4" />
                  {loading ? "Getting location..." : weather?.location || "Location unavailable"}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={getWeatherData}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground">Loading weather data...</p>
            ) : weather ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <Thermometer className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="text-2xl font-bold">{weather.temp}°C</p>
                      <p className="text-sm text-muted-foreground">Temperature</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <Thermometer className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                      <p className="text-2xl font-bold">{weather.feelsLike}°C</p>
                      <p className="text-sm text-muted-foreground">Feels Like</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <Droplets className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                      <p className="text-2xl font-bold">{weather.humidity}%</p>
                      <p className="text-sm text-muted-foreground">Humidity</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <Wind className="h-8 w-8 mx-auto mb-2 text-slate-500" />
                      <p className="text-2xl font-bold">{weather.windSpeed} km/h</p>
                      <p className="text-sm text-muted-foreground">Wind Speed</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <Umbrella className="h-8 w-8 mx-auto mb-2 text-sky-500" />
                      <p className="text-2xl font-bold">{weather.precipitation} mm</p>
                      <p className="text-sm text-muted-foreground">Precipitation</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <Sun className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                      <p className="text-2xl font-bold">{weather.uvIndex.toFixed(1)}</p>
                      <p className="text-sm text-muted-foreground">UV Index</p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-primary/5 mb-6">
                  <CardContent className="pt-6 text-center">
                    <CloudSun className="h-16 w-16 mx-auto mb-4 text-primary" />
                    <p className="text-3xl font-bold mb-2">{weather.condition}</p>
                    <p className="text-muted-foreground">Current Conditions</p>
                  </CardContent>
                </Card>

                <Card className="bg-muted">
                  <CardHeader>
                    <CardTitle className="text-lg">Today's Farming Tips</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {weather.temp > 30 && (
                      <p>• 🌡️ High temperature - water crops early morning and evening to prevent heat stress</p>
                    )}
                    {weather.temp < 15 && (
                      <p>• ❄️ Cool weather - protect sensitive plants with mulch or row covers</p>
                    )}
                    {weather.humidity > 70 && (
                      <p>• 💧 High humidity - watch for fungal diseases and ensure good air circulation</p>
                    )}
                    {weather.humidity < 40 && (
                      <p>• 🏜️ Low humidity - increase watering frequency and consider misting</p>
                    )}
                    {weather.windSpeed > 20 && (
                      <p>• 💨 Strong winds - secure tall plants, provide windbreaks, and delay spraying</p>
                    )}
                    {weather.precipitation > 5 && (
                      <p>• 🌧️ Heavy rain expected - check drainage and delay irrigation</p>
                    )}
                    {weather.precipitation > 0 && weather.precipitation <= 5 && (
                      <p>• 🌦️ Light rain - delay fertilizer application and reduce watering</p>
                    )}
                    {weather.uvIndex > 7 && (
                      <p>• ☀️ High UV levels - consider shade cloth for sensitive crops</p>
                    )}
                    {weather.condition.includes("Clear") && weather.temp > 15 && weather.temp < 28 && (
                      <p>• ✅ Perfect conditions - ideal time for transplanting, planting, and harvesting</p>
                    )}
                    {weather.condition.includes("Thunder") && (
                      <p>• ⚡ Thunderstorm conditions - avoid field work and check for hail damage</p>
                    )}
                    <p>• 🐛 Monitor plants regularly for pest activity, especially after rain</p>
                    <p>• 📍 Location: {weather.latitude.toFixed(4)}°N, {weather.longitude.toFixed(4)}°E</p>
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
