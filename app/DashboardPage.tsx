"use client";

import { BusStop } from "./BusStop";
import { Weather } from "./Weather";

export const DashBoardPage = () => {
  return (
    <div>
      <h1>Dashboard page</h1>

      <Weather />
      <BusStop />
    </div>
  );
};
