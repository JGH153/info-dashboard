import { differenceInSeconds } from "date-fns";
import { postJsonResponse } from "../fetch";

export enum EnturStops {
  Folkvangveien = "NSR:StopPlace:5680",
}

export type BusDataResponse = {
  data: BusData[];
  groupedByLine: Partial<Record<`${number} ${string}`, BusData[]>>;
};

type BusData = {
  lineNumber: number;
  destinationName: string;
  expectedDepartureTime: string;
  secondsToDeparture: number;
  delaySeconds: number;
};

type EnturResponse = {
  data: {
    board1: Array<{
      name: string;
      estimatedCalls: Array<{
        realtime: boolean;
        cancellation: boolean;
        serviceJourney: {
          id: string;
          line: {
            id: string;
            publicCode: string;
            transportMode: string;
          };
        };
        destinationDisplay: {
          frontText: string;
        };
        situations: Array<unknown>;
        quay: {
          publicCode: string;
          id: string;
          stopPlace: {
            parent: null;
            id: string;
          };
        };
        expectedDepartureTime: string;
        actualDepartureTime: unknown; // TODO
        aimedDepartureTime: string;
      }>;
    }>;
  };
};

// TODO use https://github.com/graffle-js/graffle ?
function getQuery(stop: EnturStops) {
  const query = `
fragment estimatedCallsParts on EstimatedCall {
  realtime
  cancellation
  serviceJourney {
    id
  }
  destinationDisplay {
    frontText
  }
  situations {
    severity
    situationNumber
    reportType
    summary {
      value
      language
    }
    description {
      value
      language
    }
    validityPeriod {
      startTime
      endTime
    }
  }
  quay {
    publicCode
    id
    stopPlace {
      parent {
        id
      }
      id
    }
  }
  expectedDepartureTime
  actualDepartureTime
  aimedDepartureTime
  serviceJourney {
    id
    line {
      id
      publicCode
      transportMode
    }
  }
}

query {
  board1: stopPlaces(ids: ["${stop}"]) {
    name
    estimatedCalls(
      whiteListedModes: [rail, bus, metro, tram, water, coach]
      numberOfDepartures: 20
      arrivalDeparture: departures
      includeCancelledTrips: true
      timeRange: 14400
    ) {
      ...estimatedCallsParts
    }
  }
}
`;

  return {
    query: query,
  };
}

const apiUrl = "https://api.entur.io/journey-planner/v3/graphql";

export async function getTripsForStop(stop: EnturStops): Promise<BusDataResponse | null> {
  console.log("Get trips for stop: ", stop);

  const response = await postJsonResponse<EnturResponse>(apiUrl, getQuery(stop));

  if (response.status !== 200) {
    console.error("Failed to fetch bus data", response);
    return null;
  }

  const busData = parseEnturResponse(response.data);
  const groupedByLine = Object.groupBy(busData, (bus) => `${bus.lineNumber} ${bus.destinationName}`);
  console.log(groupedByLine);

  const result: BusDataResponse = {
    data: busData,
    groupedByLine: groupedByLine,
  };

  return result;
}

function parseEnturResponse(response: EnturResponse): BusData[] {
  return response.data.board1.flatMap((board) => {
    return board.estimatedCalls.map((estimatedCall) => {
      const expectedDepartureTime = new Date(estimatedCall.expectedDepartureTime);
      const aimedDepartureTime = new Date(estimatedCall.aimedDepartureTime);
      return {
        lineNumber: parseInt(estimatedCall.serviceJourney.line.publicCode),
        destinationName: estimatedCall.destinationDisplay.frontText,
        expectedDepartureTime: estimatedCall.expectedDepartureTime,
        delaySeconds: differenceInSeconds(expectedDepartureTime, aimedDepartureTime),
        secondsToDeparture: differenceInSeconds(expectedDepartureTime, new Date()),
      } satisfies BusData;
    });
  });
}
