import { v4 as uuid } from "uuid";
import { SetService } from "~/database/SetService";

import type { Leg } from "./leg";
import type { PlayerStats } from "./player";

export interface Set {
  id: string;
  matchId: string;
  createdAt: Date;
  updatedAt: Date;
  players: Array<PlayerStats>;
  startingPlayer: string;
  legs: Array<Leg>;
  winner?: string;
}

export async function createSet(
  overrides: Partial<Set> & {
    matchId: string;
    players: Array<PlayerStats>;
    startingPlayer: string;
  }
): Promise<Set> {
  const set = {
    id: uuid(),
    createdAt: new Date(),
    updatedAt: new Date(),
    legs: [],
    ...overrides,
  };

  // Save to database
  try {
    await SetService.upsertSet(set);
  } catch (error) {
    console.error("Failed to save set to database:", error);
  }

  return set;
}
