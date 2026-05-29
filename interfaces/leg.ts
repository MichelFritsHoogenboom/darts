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
import { createPlayerStats } from "./stats";
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
  matchId: string;
  setId?: string;
  playerId: string;
  playerLegId: string;
  createdAt: Date;
  updatedAt: Date;
  startScore: number;
  totalScore: number;
  dartsThrown?: 1 | 2 | 3;
  isGoldenCamel?: boolean;
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
  stats: string; // Stats ID
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
  matchId: string;
  setId?: string;
  playerId: string;
  playerLegId: string;
  startScore: number;
  totalScore: number;
  dartsThrown?: 1 | 2 | 3;
  isGoldenCamel?: boolean;
}): Promise<Score> {
  const score: Score = {
    id: uuid(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
    dartsThrown: overrides.dartsThrown ?? 3,
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
  matchId: string;
  setId?: string;
}): Promise<PlayerLeg> {
  // Generate playerLeg ID first so we can use it for PlayerStats
  const playerLegId = uuid();

  // Create PlayerStats with playerLegId
  const playerStats = await createPlayerStats({
    playerId: overrides.playerId,
    playerLegId: playerLegId,
    matchId: overrides.matchId,
    setId: overrides.setId || "",
  });

  const playerLeg = {
    id: playerLegId,
    createdAt: new Date(),
    updatedAt: new Date(),
    scores: [],
    stats: playerStats.id,
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
