import { NextRequest, NextResponse } from "next/server";
import { fetchWeather } from "@/lib/weather-service";
import type { WeatherData } from "@/lib/types/weather";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { latitude, longitude } = body;

    if (
      typeof latitude !== 'number' || typeof longitude !== 'number' ||
      latitude < -90 || latitude > 90 ||
      longitude < -180 || longitude > 180
    ) {
      return NextResponse.json(
        { error: "Invalid coordinates: latitude must be -90 to 90, longitude -180 to 180" },
        { status: 400 }
      );
    }

    const weather: WeatherData = await fetchWeather(latitude, longitude);
    return NextResponse.json({ data: weather });
  } catch (err) {
    console.error("Weather API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch weather data" },
      { status: 500 }
    );
  }
}