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

export function useWeather(): UseWeatherResult {
  const [state, setState] = useState<WeatherState>(getInitialState);
  const { weather, loading, error } = state;

  const fetchWeatherData = useCallback(() => {
    if (!navigator.geolocation) {
      setState({ weather: null, loading: false, error: "Geolocation is not supported by your browser" });
      return;
    }

    setState({ weather: null, loading: true, error: null });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const { data } = await apiClient<{ data: WeatherData }>('weather', { method: 'POST', body: JSON.stringify({ latitude, longitude }) });
          setState({ weather: data, loading: false, error: null });
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : "Failed to fetch weather";
          setState({ weather: null, loading: false, error: errorMsg });
        }
      },
      (err) => {
        setState({ weather: null, loading: false, error: `Location access denied: ${err.message}` });
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  useEffect(() => {
    fetchWeatherData();
  }, [fetchWeatherData]);

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
    refresh: fetchWeatherData,
  };
}