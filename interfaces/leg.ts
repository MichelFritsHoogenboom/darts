import { v4 as uuid } from "uuid";
import { LegService } from "~/database/LegService";
import { PlayerLegService } from "~/database/PlayerLegService";
import { ScoreService } from "~/database/ScoreService";
import { SingleDartScoreService } from "~/database/SingleDartScoreService";
const legService = new LegService();
const playerLegService = new PlayerLegService();
const scoreService = new ScoreService();
const singleDartScoreService = new SingleDartScoreService();
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
  scores: string[] | ReadonlyArray<string>; // Score IDs - accepts both mutable and readonly
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
  players: string[] | ReadonlyArray<string>; // PlayerLeg IDs - accepts both mutable and readonly
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
    await singleDartScoreService.upsert(singleDartScore);
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
    await scoreService.upsert(score);
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
    await playerLegService.upsert(playerLeg);
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
    players: Array<string>; // PlayerLeg IDs
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
    await legService.upsert(leg);
  } catch (error) {
    console.error("Failed to save leg to database:", error);
  }

  return leg;
}
