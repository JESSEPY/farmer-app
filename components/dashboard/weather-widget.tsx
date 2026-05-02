"use client";

import {
  CloudSun,
  Droplets,
  Wind,
  Sunrise,
  Sunset,
  Cloud,
  Sun,
  CloudRain,
  CloudDrizzle,
  CloudSnow,
  Snowflake,
  CloudLightning,
  CloudFog,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useWeather } from "@/hooks/use-weather";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  sun: Sun,
  "cloud-sun": CloudSun,
  cloud: CloudRain,
  "cloud-drizzle": CloudDrizzle,
  "cloud-snow": CloudSnow,
  snowflake: Snowflake,
  "cloud-lightning": CloudLightning,
  "cloud-fog": CloudFog,
};

const IconComponent = ({
  name,
  className,
}: {
  name: string;
  className?: string;
}) => {
  const Icon = iconMap[name] || CloudSun;
  return <Icon className={className} />;
};

export function WeatherWidget() {
  const { weather, loading, error, currentCondition, currentIcon, forecast, sunrise, sunset } = useWeather();

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Loading weather...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !weather) {
    return (
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground mb-1">Weather Unavailable</p>
              <div className="flex items-center gap-2 sm:gap-3">
                <Cloud className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-2xl sm:text-3xl font-bold">--°C</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{error || "Unable to load weather"}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentIconName = currentIcon;
  const forecastWithIcons = forecast.map((day) => day.icon);

  return (
    <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground mb-1 truncate">
              {weather.location.timezone}
            </p>
            <div className="flex items-center gap-2 sm:gap-3">
              <IconComponent
                name={currentIconName}
                className="w-8 h-8 sm:w-10 sm:h-10 text-warning flex-shrink-0"
              />
              <div>
                <p className="text-2xl sm:text-3xl font-bold">{weather.current.temperature}°C</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{currentCondition}</p>
              </div>
            </div>
          </div>

          <div className="text-right space-y-1 flex-shrink-0">
            <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
              <Droplets className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-info" />
              <span>{weather.current.humidity}%</span>
            </div>
            <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
              <Wind className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{weather.current.windSpeed} km/h</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-primary/10">
          <div className="flex items-center gap-1.5 text-xs sm:text-sm">
            <Sunrise className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-warning" />
            <span>{sunrise}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs sm:text-sm">
            <Sunset className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
            <span>{sunset}</span>
          </div>
        </div>

        {forecast.length > 0 && (
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mt-3 sm:mt-4">
            {forecast.map((day, i) => (
              <div 
                key={day.day} 
                className="text-center p-2 rounded-lg bg-background/50"
              >
                <p className="text-[10px] sm:text-xs text-muted-foreground">{day.day}</p>
                <IconComponent
                  name={forecastWithIcons[i]}
                  className="w-4 h-4 sm:w-5 sm:h-5 mx-auto my-1 text-muted-foreground"
                />
                <p className="text-xs sm:text-sm font-medium">{day.temp}°</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}