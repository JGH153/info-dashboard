"use client";

import { getAsJson } from "@/shared/fetch";
import { useEffect, useState } from "react";
import { FaCloud } from "react-icons/fa";
import { ApiWeatherResponse } from "./api/weather/route";

export const DashBoardPage = () => {
  const [weatherData, setWeatherData] = useState<ApiWeatherResponse>(null);

  async function getWeatherData() {
    const weatherApiResponse = await getAsJson<ApiWeatherResponse>("api/weather");
    setWeatherData(weatherApiResponse.data);
    console.log("Get weather data: ", weatherApiResponse);
  }

  // TODO tanstack query
  useEffect(() => {
    getWeatherData();
  }, []);

  return (
    <div>
      <h1>Dashboard page</h1>
      <p>Welcome to the weather dashboard.</p>
      <button
        onClick={() => getWeatherData()}
        className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
      >
        <span>Get weather data</span>
      </button>
      <div className="flex items-center gap-2">
        <div>Nå: </div>
        <FaCloud />
        <div>{weatherData?.forecastNow.temp} C</div>
        <div> Nedbør: {weatherData?.forecastNow.precipitation}mm</div>
        <div> Vind: {weatherData?.forecastNow.windSpeed}m/s</div>
      </div>
      <h2>Forecast neste 3 timer ca</h2>
      {/* TODO graf */}
      {weatherData?.forecastFuture.slice(0, 3).map((forecast) => (
        <div className="flex items-center gap-2" key={forecast.forecastDate}>
          <div>Neste time (om {forecast.forecastMinFromNow} min): </div>
          <FaCloud />
          <div>{forecast.temp} C</div>
          <div> Nedbør: {forecast.precipitation}mm</div>
          <div> Vind: {forecast.windSpeed}m/s</div>
        </div>
      ))}
    </div>
  );
};
