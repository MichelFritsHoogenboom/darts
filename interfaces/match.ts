import type { Leg } from "./leg";
import type { PlayerStats } from "./player";
import type { Set } from "./set";
import type { x01MatchConfig } from "./x01MatchConfig";

export const GAME_TYPES = {
  x01: "x01",
  tactics: "tactics",
  halveIt: "halve-it",
};

export interface Match {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  gameType: keyof typeof GAME_TYPES;
  matchConfig: x01MatchConfig;
  players: Array<Player>;
  game: Array<Leg | Set>;
  winner: number;
}
