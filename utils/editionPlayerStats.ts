import type { Score } from "~/interfaces/leg";
import type { BestAverages, PlayerStats } from "~/interfaces/stats";
import { isCheckoutScore } from "~/utils/score";
import {
  buildBestAverages,
  calculateFirstNineAverage,
  calculateScoringDartsAverage,
  calculateThreeDartAverage,
  emptyBestAverages,
  maxAverage,
} from "~/utils/averages";
import { sumCheckoutRanges, sumScoreRanges } from "~/utils/stats";

/** @deprecated Prefer BestAverages from ~/interfaces/stats */
export type EditionBestAverages = BestAverages;
/** @deprecated Prefer emptyBestAverages from ~/utils/averages */
export const emptyEditionBestAverages = emptyBestAverages;
/** @deprecated Prefer buildBestAverages from ~/utils/averages */
export const buildEditionBestAverages = buildBestAverages;

export const highestCheckoutFromScores = (scores: Score[]): number => {
  const checkouts = scores.filter(isCheckoutScore);
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
