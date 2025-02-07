import { getMetWeather, WeatherMetadata } from "@/shared/external-api/metWeather";
import { NextResponse } from "next/server";

// TODO support errors
export type ApiWeatherResponse = WeatherMetadata | null;

export async function GET(request: Request): Promise<NextResponse<ApiWeatherResponse>> {
  const { searchParams } = new URL(request.url);
  const nameQuery = searchParams.get("name");
  console.log(nameQuery);

  const weatherData = await getMetWeather();

  return NextResponse.json(weatherData);
}
