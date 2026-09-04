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
