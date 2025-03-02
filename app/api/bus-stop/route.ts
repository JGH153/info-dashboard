import { BusDataResponse, EnturStops, getTripsForStop } from "@/shared/external-api/enturJourneyPlanner";
import { NextResponse } from "next/server";

// TODO support errors
export type ApiBusStopResponse = BusDataResponse | null;

export async function GET(): Promise<NextResponse<ApiBusStopResponse>> {
  const stopData = await getTripsForStop(EnturStops.Folkvangveien);

  return NextResponse.json(stopData);
}
