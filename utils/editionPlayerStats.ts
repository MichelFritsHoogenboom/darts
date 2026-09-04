import type { Score } from "~/interfaces/leg";
import type {
  CheckoutRanges,
  DartsThrownHit,
  PlayerStats,
  ScoreRanges,
} from "~/interfaces/stats";
import {
  createCheckoutRanges,
  createScoreRanges,
} from "~/interfaces/stats";
import {
  calculateFirstNineAverage,
  calculateScoringDartsAverage,
  calculateThreeDartAverage,
} from "~/utils/averages";

export type EditionBestAverages = {
  bestLegAverage: number;
  bestSetAverage: number;
  bestMatchAverage: number;
};

export const maxAverage = (averages: number[]) =>
  averages.length ? Math.max(...averages) : 0;

export const emptyEditionBestAverages = (): EditionBestAverages => ({
  bestLegAverage: 0,
  bestSetAverage: 0,
  bestMatchAverage: 0,
});

export const sumScoreRanges = (ranges: ScoreRanges[]): ScoreRanges => {
  const result = createScoreRanges();
  for (const range of ranges) {
    for (const key of Object.keys(result) as (keyof ScoreRanges)[]) {
      result[key] += range[key] ?? 0;
    }
  }
  return result;
};

export const sumCheckoutRanges = (
  ranges: CheckoutRanges[],
): CheckoutRanges => {
  const result = createCheckoutRanges();
  for (const range of ranges) {
    for (const key of Object.keys(result) as (keyof CheckoutRanges)[]) {
      const source = range[key] ?? ({ thrown: 0, hit: 0 } as DartsThrownHit);
      result[key].thrown += source.thrown;
      result[key].hit += source.hit;
    }
  }
  return result;
};

export const highestCheckoutFromScores = (scores: Score[]): number => {
  const checkouts = scores.filter(
    (score) => score.startScore === score.totalScore && score.totalScore > 0,
  );
  return maxAverage(checkouts.map((score) => score.totalScore));
};

export const buildEditionPlayerStatMetrics = (input: {
  scores: Score[];
  matchStats: PlayerStats[];
}) => {
  const { scores, matchStats } = input;

  return {
    average: calculateThreeDartAverage(scores),
    scoringDartsAverage: calculateScoringDartsAverage(scores),
    firstNineAverage: calculateFirstNineAverage(scores),
    scores: sumScoreRanges(matchStats.map((stat) => stat.scores)),
    checkouts: sumCheckoutRanges(matchStats.map((stat) => stat.checkouts)),
    highestCheckout: highestCheckoutFromScores(scores),
  };
};

export const buildEditionBestAverages = (input: {
  wonLegAverages: number[];
  wonSetAverages: number[];
  matchAverages: number[];
}): EditionBestAverages => ({
  bestLegAverage: maxAverage(input.wonLegAverages),
  bestSetAverage: maxAverage(input.wonSetAverages),
  bestMatchAverage: maxAverage(input.matchAverages),
});

/** Per finished match: player with strictly most golden camels wins that match. */
export const tallyCamelMatchWins = (
  playerId: string,
  matchCamelCounts: Array<Readonly<Record<string, number>>>,
): number => {
  let wins = 0;
  for (const counts of matchCamelCounts) {
    const own = counts[playerId] ?? 0;
    const others = Object.entries(counts)
      .filter(([id]) => id !== playerId)
      .map(([, count]) => count);
    if (!others.length) continue;
    if (own > Math.max(...others)) wins += 1;
  }
  return wins;
};

export const sumCamelCountsByPlayer = (
  matchCamelCounts: Array<Readonly<Record<string, number>>>,
): Record<string, number> => {
  const totals: Record<string, number> = {};
  for (const counts of matchCamelCounts) {
    for (const [playerId, count] of Object.entries(counts)) {
      totals[playerId] = (totals[playerId] ?? 0) + count;
    }
  }
  return totals;
};

/** Season camel champion: most small camels (match wins + season total bonus). */
export const camelSeasonWinnerId = (
  playerIds: string[],
  camelMatchWins: Readonly<Record<string, number>>,
  seasonCamelTotals: Readonly<Record<string, number>>,
): string | undefined => {
  const smallCounts = playerIds.map((playerId) => {
    const ownTotal = seasonCamelTotals[playerId] ?? 0;
    const otherTotals = playerIds
      .filter((id) => id !== playerId)
      .map((id) => seasonCamelTotals[id] ?? 0);
    const seasonBonus =
      otherTotals.length && ownTotal > Math.max(...otherTotals) ? 1 : 0;
    return {
      playerId,
      count: (camelMatchWins[playerId] ?? 0) + seasonBonus,
    };
  });

  const max = Math.max(0, ...smallCounts.map((entry) => entry.count));
  if (max === 0) return undefined;

  const winners = smallCounts.filter((entry) => entry.count === max);
  return winners.length === 1 ? winners[0].playerId : undefined;
};
