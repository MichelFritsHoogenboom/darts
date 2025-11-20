import { v4 as uuid } from "uuid";
import { SetService } from "~/database/SetService";
import { toRaw } from "vue";
import type { Leg } from "./leg";
import type { PlayerStats } from "./player";

const setService = new SetService();

export interface Set {
  id: string;
  matchId: string;
  createdAt: Date;
  updatedAt: Date;
  players: Array<PlayerStats>;
  startingPlayer: string;
  game: Array<Leg>;
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
