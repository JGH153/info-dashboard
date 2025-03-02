import { useEffect, useState } from "react";
import { ApiBusStopResponse } from "./api/bus-stop/route";
import { getAsJson } from "@/shared/fetch";
import { BusLineNumber } from "@/components/BusLineNumber";

export const BusStop = () => {
  const [busData, setBusData] = useState<ApiBusStopResponse | null>(null);

  async function getBusData() {
    const busDataResponse = await getAsJson<ApiBusStopResponse>("api/bus-stop");
    setBusData(busDataResponse.data);
  }

  // TODO tanstack query (then re-fetch each 10 seconds)
  useEffect(() => {
    getBusData();
  }, []);

  function displayDepartureTime(secondsToDeparture: number | undefined): string {
    if (secondsToDeparture === undefined) {
      return "N/A";
    }
    // TODO show NOW? as anything less than 1 min is just estimate and it's not guaranteed to be accurate
    if (secondsToDeparture < 60) {
      return secondsToDeparture + " sek";
    }
    return Math.floor(secondsToDeparture / 60) + " min";
  }

  const busOslo110 = busData?.groupedByLine["110 Oslo bussterminal"];
  const busOslo100 = busData?.groupedByLine["100 Oslo bussterminal"];

  return (
    <div className="mt-4">
      <h1 className="text-2xl">Next bus 110 Oslo</h1>
      <div className="flex items-center gap-4 text-2xl">
        <div className="flex items-center gap-2">
          <BusLineNumber lineNumber="110" /> {busOslo110?.at(0)?.destinationName}:
        </div>
        <p>
          {displayDepartureTime(busOslo110?.at(0)?.secondsToDeparture)},{" "}
          {displayDepartureTime(busOslo110?.at(1)?.secondsToDeparture)}
        </p>
      </div>

      <h1 className="text-2xl">Next bus 100 Oslo</h1>
      <div className="flex items-center gap-4 text-2xl">
        <div className="flex items-center gap-2">
          <BusLineNumber lineNumber="110" /> {busOslo100?.at(0)?.destinationName}:
        </div>
        <p>
          {displayDepartureTime(busOslo100?.at(0)?.secondsToDeparture)},{" "}
          {displayDepartureTime(busOslo100?.at(1)?.secondsToDeparture)}
        </p>
      </div>
    </div>
  );
};
