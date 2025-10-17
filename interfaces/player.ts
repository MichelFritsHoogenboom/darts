import type { Stats } from "./stats";

export interface Player {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  firstName: string;
  lastName: string;
  city: string;
  country: string;
  birthDate: Date;
  typeOfDarts: string;
  dartsWeightInGrams: number;
  flightColor: string;
  allTimeStats: Stats;
}

export interface PlayerStats {
  id: number;
  stats: Stats;
}
