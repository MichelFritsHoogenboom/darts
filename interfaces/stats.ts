import { v4 as uuid } from "uuid";
import { toRaw } from "vue";
import { PlayerStatsService } from "~/database/PlayerStatsService";

const playerStatsService = new PlayerStatsService();

export interface CheckoutRanges {
  "0-40": number;
  "41-60": number;
  "61-80": number;
  "81-100": number;
  "101-130": number;
  "131-150": number;
  "151-170": number;
}

export interface ScoreRanges {
  "0-9": number;
  "10-19": number;
  "20-29": number;
  "30-39": number;
  "40-53": number; // 2 well aimed scoring darts and a loose dart
  "54-65": number; // three single darts of at least 18
  "66-89": number; // 1 triple and 1 single of at least 18, 1 loose dart
  "90-125": number; // one triple and two singles of at least 18
  "126-161": number; // 2 triples and one single dart of at least 18
  "162-179": number; // 3 triples (perfect aimed)
  "180": number; // 3 triple 20's (perfect aimed)
}

export interface DartsThrownHit {
  thrown: number;
  hit: number;
}

export interface PlayerStats {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  playerId: string;
  matchId?: string;
  setId?: string;
  playerLegId?: string;
  average: number;
  scoringDartsAverage: number;
  scores: ScoreRanges;
  checkouts: CheckoutRanges;
  highestCheckout: number;
  doubles: DartsThrownHit;
  setDarts?: DartsThrownHit;
  matchDarts?: DartsThrownHit;
}

// Factory functions to create new instances
export function createCheckoutRanges(): CheckoutRanges {
  return {
    "0-40": 0,
    "41-60": 0,
    "61-80": 0,
    "81-100": 0,
    "101-130": 0,
    "131-150": 0,
    "151-170": 0,
  };
}

export function createScoreRanges(): ScoreRanges {
  return {
    "0-9": 0,
    "10-19": 0,
    "20-29": 0,
    "30-39": 0,
    "40-53": 0, // 2 well aimed scoring darts and a loose dart
    "54-65": 0, // three single darts of at least 18
    "66-89": 0, // 1 triple and 1 single of at least 18, 1 loose dart
    "90-125": 0, // one triple and two singles of at least 18
    "126-161": 0, // 2 triples and one single dart of at least 18
    "162-179": 0, // 3 triples (perfect aimed)
    "180": 0, // 3 triple 20's (perfect aimed)
  };
}

export function createDartsThrownHit(): DartsThrownHit {
  return {
    thrown: 0,
    hit: 0,
  };
}

export async function createPlayerStats(
  overrides: Partial<PlayerStats> & {
    playerId: string;
    matchId?: string;
    setId?: string;
    playerLegId?: string;
  }
): Promise<PlayerStats> {
  const playerStats = {
    id: uuid(),
    createdAt: new Date(),
    updatedAt: new Date(),
    average: 0,
    scoringDartsAverage: 0,
    scores: createScoreRanges(),
    checkouts: createCheckoutRanges(),
    highestCheckout: 0,
    doubles: createDartsThrownHit(),
    ...overrides,
  };

  // Save to database
  try {
    await playerStatsService.upsert(toRaw(playerStats));
  } catch (error) {
    console.error("Failed to save player stats to database:", error);
  }

  return playerStats;
}
