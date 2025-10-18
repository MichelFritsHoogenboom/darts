import type { Leg } from "./leg";
import type { PlayerStats } from "./player";

export interface Set {
  id: number;
  matchId: number;
  createdAt: Date;
  updatedAt: Date;
  players: Array<PlayerStats>;
  startingPlayer: number;
  legs: Array<Leg>;
  winner: number;
}
