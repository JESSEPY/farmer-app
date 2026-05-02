"use client";

import { CloudSun, MapPin, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  wind: number;
}

const mockWeather: WeatherData = {
  temp: 28,
  condition: "Partly Cloudy",
  humidity: 75,
  wind: 12,
};

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 lg:px-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">Masbate, PH</span>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Weather Widget - hidden on small mobile */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
            <CloudSun className="w-5 h-5 text-warning" />
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold">{mockWeather.temp}°C</span>
              <span className="text-xs text-muted-foreground hidden md:inline">
                {mockWeather.condition}
              </span>
            </div>
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative cursor-pointer min-w-[44px] min-h-[44px]">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
          </Button>
        </div>
      </div>
    </header>
  );
}