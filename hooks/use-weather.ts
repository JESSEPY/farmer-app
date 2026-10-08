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

// Masbate City, used when the device location is unavailable or not yet allowed.
const DEFAULT_LOCATION = { latitude: 12.3711, longitude: 123.6239 };

export function useWeather(): UseWeatherResult {
  const [state, setState] = useState<WeatherState>(getInitialState);
  const { weather, loading, error } = state;

  const loadWeather = useCallback(async (latitude: number, longitude: number) => {
    try {
      const { data } = await apiClient<{ data: WeatherData }>("weather", {
        method: "POST",
        body: JSON.stringify({ latitude, longitude }),
      });
      setState({ weather: data, loading: false, error: null });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to fetch weather";
      setState({ weather: null, loading: false, error: errorMsg });
    }
  }, []);

  const fetchWeatherData = useCallback(async () => {
    // Use the device location only if the user has already allowed it; otherwise show
    // Masbate City right away instead of waiting on (or nagging with) a permission prompt.
    let usePosition = false;
    try {
      if (navigator.geolocation && navigator.permissions) {
        const status = await navigator.permissions.query({ name: "geolocation" });
        usePosition = status.state === "granted";
      }
    } catch {
      usePosition = false;
    }

    if (!usePosition) {
      loadWeather(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude);
      return;
    }

    // Some desktops never answer a position request, so fall back to Masbate City
    // if it takes too long. Whichever finishes first wins.
    let settled = false;
    const settle = (lat: number, lng: number) => {
      if (settled) return;
      settled = true;
      clearTimeout(fallbackTimer);
      loadWeather(lat, lng);
    };
    const fallbackTimer = setTimeout(
      () => settle(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude),
      4000
    );

    navigator.geolocation.getCurrentPosition(
      (position) => settle(position.coords.latitude, position.coords.longitude),
      () => settle(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }, [loadWeather]);

  useEffect(() => {
    fetchWeatherData();
  }, [fetchWeatherData]);

  const refresh = useCallback(() => {
    setState({ weather: null, loading: true, error: null });
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
    refresh,
  };
}