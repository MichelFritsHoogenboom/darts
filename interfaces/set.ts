import type { Leg } from "./leg";

export interface Set {
  id: number;
  matchId: number;
  createdAt: Date;
  updatedAt: Date;
  startingPlayer: number;
  legs: Array<Leg>;
  winner: number;
}
