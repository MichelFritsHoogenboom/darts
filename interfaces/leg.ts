import type { GAME_TYPES } from "./match";

export interface SingleDartScore {
  id: number;
  scoreId: number;
  createdAt: Date;
  updatedAt: Date;
  score: number;
  doubleHit?: boolean;
  isSetDart?: boolean;
  isMatchDart?: boolean;
}

export interface Score {
  id: number;
  playerId: number;
  playerLegId: number;
  createdAt: Date;
  updatedAt: Date;
  totalScore: number;
  scoreDarts1?: SingleDartScore;
  scoreDarts2?: SingleDartScore;
  scoreDarts3?: SingleDartScore;
}

export interface PlayerLeg {
  id: number;
  legId: number;
  createdAt: Date;
  updatedAt: Date;
  playerId: number;
  scores: Array<Score>;
  average: number;
  checkout?: number;
}

export interface Leg {
  id: number;
  matchId?: number;
  setId?: number;
  createdAt: Date;
  updatedAt: Date;
  gameType: keyof typeof GAME_TYPES;
  players: Array<PlayerLeg>;
  startingPlayer: number;
  winner: number;
}
