import { v4 as uuid } from "uuid";

import type { X01GameType } from "./x01MatchConfig";
export interface SingleDartScore {
  id: string;
  scoreId: string;
  createdAt: Date;
  updatedAt: Date;
  score: number;
  doubleHit?: boolean;
  isSetDart?: boolean;
  isMatchDart?: boolean;
}

export interface Score {
  id: string;
  playerId: string;
  playerLegId: string;
  createdAt: Date;
  updatedAt: Date;
  totalScore: number;
  scoreDarts1?: SingleDartScore;
  scoreDarts2?: SingleDartScore;
  scoreDarts3?: SingleDartScore;
}

export interface PlayerLeg {
  id: string;
  legId: string;
  createdAt: Date;
  updatedAt: Date;
  playerId: string;
  scores: Array<Score>;
  average?: number;
  checkout?: number;
}

export interface Leg {
  id: string;
  matchId: string;
  setId?: string;
  createdAt: Date;
  updatedAt: Date;
  gameType: X01GameType;
  players: Array<PlayerLeg>;
  startingPlayer: string;
  winner?: string;
}

export function createSingleDartScore(overrides: {
  scoreId: string;
  score: number;
}): SingleDartScore {
  return {
    id: uuid(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createScore(overrides: {
  playerId: string;
  playerLegId: string;
  totalScore: number;
}): Score {
  return {
    id: uuid(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createPlayerLeg(overrides: {
  legId: string;
  playerId: string;
}): PlayerLeg {
  return {
    id: uuid(),
    createdAt: new Date(),
    updatedAt: new Date(),
    scores: [],
    ...overrides,
  };
}

export function createLeg(
  overrides: Partial<Leg> & {
    matchId: string;
    setId?: string;
    gameType: X01GameType;
    players: Array<PlayerLeg>;
    startingPlayer: string;
  }
): Leg {
  return {
    id: uuid(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
