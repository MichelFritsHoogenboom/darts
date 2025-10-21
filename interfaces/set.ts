import { v4 as uuid } from "uuid";

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

export function createSet(
  overrides: Partial<Set> & {
    matchId: string;
    players: Array<PlayerStats>;
    startingPlayer: string;
  }
): Set {
  return {
    id: uuid(),
    createdAt: new Date(),
    updatedAt: new Date(),
    legs: [],
    ...overrides,
  };
}
