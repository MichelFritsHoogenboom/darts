import type { Stats } from "./stats";
import { v4 as uuid } from "uuid";

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
  allTimeStats?: Stats;
}

export interface PlayerStats {
  id: string;
  stats?: Stats;
}

export function createPlayer(overrides: Partial<Player> = {}): Player {
  const playerId = uuid();
  console.log(
    "createPlayer - generated id:",
    playerId,
    "type:",
    typeof playerId
  );

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

    ...overrides,
  };
}
