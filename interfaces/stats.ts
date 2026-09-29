import { v4 as uuid } from "uuid";
import { toRaw } from "vue";
import { PlayerStatsService } from "~/database/PlayerStatsService";
import {
  STATS_COMPARE_KIND,
  STAT_VALUE_FORMAT,
} from "~/constants/stats";
import {
  createCheckoutRanges,
  createDartsThrownHit,
  createScoreRanges,
  type CheckoutRanges,
  type DartsThrownHit,
  type ScoreRanges,
} from "~/interfaces/statsRanges";

const playerStatsService = new PlayerStatsService();

/** Best averages for whatever scope is relevant (leg / set / match). Omit unused keys. */
export type BestAverages = {
  bestLegAverage?: number;
  bestSetAverage?: number;
  bestMatchAverage?: number;
};

/** Ranked highlight row (checkout, match average, …). */
export type LeaderboardEntry = {
  id: string;
  playerId: string;
  value: number;
  date: Date;
  /** Match average from a lost match — muted in the UI. */
  lost?: boolean;
};

/** Match-level average with win/loss for highlights leaderboard. */
export type TopMatchAverage = {
  stats: PlayerStats;
  won: boolean;
};

export type CompareSide = "player1" | "player2" | null;

export type ComparePair<T> = {
  label: string;
  player1: T;
  player2: T;
};

export type StatsCompareKind =
  (typeof STATS_COMPARE_KIND)[keyof typeof STATS_COMPARE_KIND];

export type StatValueFormat =
  (typeof STAT_VALUE_FORMAT)[keyof typeof STAT_VALUE_FORMAT];

export type StatsCompareNumberRow = ComparePair<number> & {
  kind: typeof STATS_COMPARE_KIND.number;
  format?: StatValueFormat;
};

export type StatsCompareCheckoutRow = ComparePair<DartsThrownHit> & {
  kind: typeof STATS_COMPARE_KIND.checkout;
};

export type StatsCompareCamelRow = ComparePair<number> & {
  kind: typeof STATS_COMPARE_KIND.camel;
};

export type StatsCompareRow =
  | StatsCompareNumberRow
  | StatsCompareCheckoutRow
  | StatsCompareCamelRow;

export type StatsCompareSection = {
  title: string;
  rows: StatsCompareRow[];
};

export interface PlayerStats {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  playerId: string;
  matchId?: string;
  setId?: string;
  playerLegId?: string;
  competitionEditionId?: string;
  average: number;
  scoringDartsAverage: number;
  firstNineAverage: number;
  scores: ScoreRanges;
  checkouts: CheckoutRanges;
  highestCheckout: number;
  doubles: DartsThrownHit;
  setDarts?: DartsThrownHit;
  matchDarts?: DartsThrownHit;
}

export const createPlayerStats = async (
  overrides: Partial<PlayerStats> & {
    playerId: string;
    matchId?: string;
    setId?: string;
    playerLegId?: string;
  },
): Promise<PlayerStats> => {
  const playerStats = {
    id: uuid(),
    createdAt: new Date(),
    updatedAt: new Date(),
    average: 0,
    scoringDartsAverage: 0,
    firstNineAverage: 0,
    scores: createScoreRanges(),
    checkouts: createCheckoutRanges(),
    highestCheckout: 0,
    doubles: createDartsThrownHit(),
    ...overrides,
  };

  try {
    await playerStatsService.upsert(toRaw(playerStats));
  } catch (error) {
    console.error("Failed to save player stats to database:", error);
  }

  return playerStats;
};

export const createEditionPlayerStats = async (
  editionId: string,
  playerIds: string[],
): Promise<string[]> =>
  Promise.all(
    playerIds.map((playerId) =>
      createPlayerStats({ playerId, competitionEditionId: editionId }).then(
        (stats) => stats.id,
      ),
    ),
  );
