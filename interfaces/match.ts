import { v4 as uuid } from "uuid";
import type { Leg } from "./leg";
import type { PlayerStats } from "./player";
import type { Set } from "./set";
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
  players: Array<PlayerStats>;
  game: Array<Leg | Set>;
  winner?: number;
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
