import { IsoDate } from "../date";
import { getAsJson } from "../fetch";
import { differenceInHours, differenceInMinutes } from "date-fns";

// some props missing
type MetWeatherApiResponse = {
  type: string;
  geometry: {
    type: string;
    coordinates: Array<number>;
  };
  properties: {
    meta: {
      updated_at: string;
      units: {
        air_pressure_at_sea_level: string;
        air_temperature: string;
        cloud_area_fraction: string;
        precipitation_amount: string;
        relative_humidity: string;
        wind_from_direction: string;
        wind_speed: string;
      };
    };
    timeseries: Array<{
      time: string;
      data: {
        instant?: {
          details: {
            air_pressure_at_sea_level: number;
            air_temperature: number;
            cloud_area_fraction: number;
            relative_humidity: number;
            wind_from_direction: number;
            wind_speed: number;
          };
        };
        next_1_hours?: {
          summary: {
            symbol_code: string;
          };
          details: {
            precipitation_amount: number;
          };
        };
      };
    }>;
  };
};

export type WeatherMetadata = {
  forecastNow: WeatherMappedData;
  forecastFuture: WeatherMappedData[];
};

type WeatherMappedData = {
  forecastDate: IsoDate;
  forecastHoursFromNow: number;
  forecastMinFromNow: number;
  temp: number | undefined;
  windSpeed: number | undefined;
  precipitation: number | undefined;
};

function parseWeatherApiResponse(weatherApiResponse: MetWeatherApiResponse): WeatherMappedData[] {
  const mappedData = weatherApiResponse.properties.timeseries.map((timeSeries) => {
    return {
      forecastDate: timeSeries.time as IsoDate,
      forecastHoursFromNow: differenceInHours(new Date(timeSeries.time), new Date()),
      forecastMinFromNow: differenceInMinutes(new Date(timeSeries.time), new Date()),
      temp: timeSeries.data.instant?.details.air_temperature,
      windSpeed: timeSeries.data.instant?.details.wind_speed,
      precipitation: timeSeries.data.next_1_hours?.details.precipitation_amount,
    } satisfies WeatherMappedData;
  });

  return mappedData;
}

export async function getMetWeather(): Promise<WeatherMetadata | null> {
  // TODO ZOD validation
  const weatherApiResponse = await getAsJson<MetWeatherApiResponse>(
    `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=59.5628&lon=10.5530`,
    {
      "User-Agent": "https://github.com/JGH153/info-dashboard", // Required by Yr/MET API
    }
  );

  if (weatherApiResponse.status !== 200) {
    console.error("Failed to fetch weather data", weatherApiResponse);
    return null;
  }

  const parsedData = parseWeatherApiResponse(weatherApiResponse.data);
  const forecastNow = parsedData.shift();
  if (forecastNow === undefined) {
    console.error("No weather data found", weatherApiResponse);
    return null;
  }

  const response: WeatherMetadata = {
    forecastNow: forecastNow,
    forecastFuture: parsedData,
  };

  return response;
}
