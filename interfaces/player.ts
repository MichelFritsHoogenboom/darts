import type { PlayerStats } from "./stats";
import { v4 as uuid } from "uuid";
import { createPlayerStats } from "./stats";

export interface Player {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  firstName: string;
  lastName?: string;
  alias?: string;
  avatar?: Blob;
  city?: string;
  country?: string;
  birthDate?: Date;
  typeOfDarts?: string;
  dartsWeightInGrams?: number;
  flightColor?: string;
  allTimeStats: string;
}

export async function createPlayer(
  overrides: Partial<Player> = {}
): Promise<Player> {
  const playerId = uuid();

  return {
    id: playerId,
    createdAt: new Date(),
    updatedAt: new Date(),
    firstName: "",
    lastName: "",
    alias: "",
    city: "",
    country: "",
    birthDate: undefined,
    typeOfDarts: "",
    dartsWeightInGrams: undefined,
    flightColor: "",
    allTimeStats: await createPlayerStats({ playerId: playerId }).then(
      (stats) => stats.id
    ),

    ...overrides,
  };
}
