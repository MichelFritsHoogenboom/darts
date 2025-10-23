import { v4 as uuid } from "uuid";
import { LegService } from "~/database/LegService";
import { PlayerLegService } from "~/database/PlayerLegService";
import { ScoreService } from "~/database/ScoreService";
import { SingleDartScoreService } from "~/database/SingleDartScoreService";

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

export async function createSingleDartScore(overrides: {
  scoreId: string;
  score: number;
}): Promise<SingleDartScore> {
  const singleDartScore = {
    id: uuid(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };

  // Save to database
  try {
    await SingleDartScoreService.upsert(singleDartScore);
  } catch (error) {
    console.error("Failed to save single dart score to database:", error);
  }

  return singleDartScore;
}

export async function createScore(overrides: {
  playerId: string;
  playerLegId: string;
  totalScore: number;
}): Promise<Score> {
  const score = {
    id: uuid(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };

  // Save to database
  try {
    await ScoreService.upsert(score);
  } catch (error) {
    console.error("Failed to save score to database:", error);
  }

  return score;
}

export async function createPlayerLeg(overrides: {
  legId: string;
  playerId: string;
}): Promise<PlayerLeg> {
  const playerLeg = {
    id: uuid(),
    createdAt: new Date(),
    updatedAt: new Date(),
    scores: [],
    ...overrides,
  };

  // Save to database
  try {
    await PlayerLegService.upsert(playerLeg);
  } catch (error) {
    console.error("Failed to save player leg to database:", error);
  }

  return playerLeg;
}

export async function createLeg(
  overrides: Partial<Leg> & {
    matchId: string;
    setId?: string;
    gameType: X01GameType;
    players: Array<PlayerLeg>;
    startingPlayer: string;
  }
): Promise<Leg> {
  const leg = {
    id: uuid(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };

  // Save to database
  try {
    await LegService.upsert(leg);
  } catch (error) {
    console.error("Failed to save leg to database:", error);
  }

  return leg;
}
