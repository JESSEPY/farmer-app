// hooks/use-weather.ts

import { useState, useCallback, useEffect } from "react";
import { apiClient } from "@/lib/api/client";
import { WeatherData } from "@/lib/types/weather";
import {
  getWeatherLabel,
  getWeatherIconName,
  formatDay,
} from "@/lib/weather-service";

interface UseWeatherResult {
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
  currentCondition: string;
  currentIcon: string;
  forecast: Array<{
    day: string;
    icon: string;
    temp: number;
  }>;
  sunrise: string;
  sunset: string;
  refresh: () => void;
}

interface WeatherState {
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
}

function getInitialState(): WeatherState {
  return {
    weather: null,
    loading: true,
    error: null,
  };
}

// The app serves Masbate, so weather is always for Masbate City (not the device location).
export const MASBATE_LOCATION = { latitude: 12.3711, longitude: 123.6239 };
export const MASBATE_LABEL = "Masbate City, Masbate";

export function useWeather(): UseWeatherResult {
  const [state, setState] = useState<WeatherState>(getInitialState);
  const [reloadCount, setReloadCount] = useState(0);
  const { weather, loading, error } = state;

  useEffect(() => {
    let cancelled = false;

    const loadWeather = async () => {
      try {
        const { data } = await apiClient<{ data: WeatherData }>("weather", {
          method: "POST",
          body: JSON.stringify(MASBATE_LOCATION),
        });
        if (!cancelled) setState({ weather: data, loading: false, error: null });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to fetch weather";
        if (!cancelled) setState({ weather: null, loading: false, error: errorMsg });
      }
    };

    loadWeather();

    return () => {
      cancelled = true;
    };
  }, [reloadCount]);

  const refresh = useCallback(() => {
    setState({ weather: null, loading: true, error: null });
    setReloadCount((n) => n + 1);
  }, []);

  const currentCondition = weather
    ? getWeatherLabel(weather.current.weatherCode)
    : "";

  const currentIcon = weather
    ? getWeatherIconName(weather.current.weatherCode)
    : "";

  const forecast = weather
    ? weather.daily.slice(1, 4).map((day) => ({
        day: formatDay(day.date),
        icon: getWeatherIconName(day.weatherCode),
        temp: day.tempMax,
      }))
    : [];

  const sunrise = weather?.daily[0]?.sunrise || "";
  const sunset = weather?.daily[0]?.sunset || "";

  return {
    weather,
    loading,
    error,
    currentCondition,
    currentIcon,
    forecast,
    sunrise,
    sunset,
    refresh,
  };
}