export interface WeatherData {
  current: {
    temperature: number;
    apparentTemperature: number;
    humidity: number;
    windSpeed: number;
    weatherCode: number;
  };
  hourly: Array<{
    time: string;
    temperature: number;
    weatherCode: number;
  }>;
  daily: Array<{
    date: string;
    tempMax: number;
    tempMin: number;
    weatherCode: number;
    sunrise: string;
    sunset: string;
  }>;
  location: {
    latitude: number;
    longitude: number;
    timezone: string;
  };
}