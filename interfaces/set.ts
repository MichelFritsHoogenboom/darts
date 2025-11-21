import { v4 as uuid } from "uuid";
import { SetService } from "~/database/SetService";
import { toRaw } from "vue";
import type { Leg } from "./leg";

const setService = new SetService();

export interface Set {
  id: string;
  matchId: string;
  createdAt: Date;
  updatedAt: Date;
  players: Array<string>; // PlayerStats IDs
  startingPlayer: string;
  game: Array<string>; // Leg IDs
  winner?: string;
}

export async function createSet(
  overrides: Partial<Set> & {
    matchId: string;
    players: Array<string>; // PlayerStats IDs
    startingPlayer: string;
  }
): Promise<Set> {
  const set = {
    id: uuid(),
    createdAt: new Date(),
    updatedAt: new Date(),
    game: [],
    ...overrides,
  };

  // Save to database
  try {
    await setService.upsert(toRaw(set));
  } catch (error) {
    console.error("Failed to save set to database:", error);
  }

  return set;
}
