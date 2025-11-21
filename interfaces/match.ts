import { v4 as uuid } from "uuid";
import type { x01MatchConfig } from "./x01MatchConfig";
import { defaultX01MatchConfig } from "./x01MatchConfig";

export const GAME_TYPES = {
  x01: "x01",
  tactics: "tactics",
  halveIt: "halve-it",
};

export type GameType = (typeof GAME_TYPES)[keyof typeof GAME_TYPES];

export interface Match {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  gameType: GameType;
  matchConfig: x01MatchConfig;
  players: Array<string>; // PlayerStats IDs
  game: Array<string>; // Leg or Set IDs
  winner?: string;
}

export function createMatch(overrides: Partial<Match> = {}): Match {
  return {
    id: uuid(),
    createdAt: new Date(),
    updatedAt: new Date(),
    gameType: GAME_TYPES.x01,
    matchConfig: defaultX01MatchConfig,
    players: [],
    game: [],
    ...overrides,
  };
}
