import type { Score } from "~/interfaces/leg";
import type { BestAverages, PlayerStats } from "~/interfaces/stats";
import type {
  AverageSeriesLegInput,
  AverageSeriesPoint,
} from "~/interfaces/averageChart";

export const getDartsThrownForScore = (score: Score): number =>
  score.dartsThrown ?? 3;

export const maxAverage = (averages: number[]) =>
  averages.length ? Math.max(...averages) : 0;

export const emptyBestAverages = (): BestAverages => ({});

/**
 * Checkouts were counted per range before the highest one was stored, so hits
 * without a highest checkout mean the stat row predates that field. A player
 * who never checked out keeps a legitimate 0 and is left alone.
 */
const hasUncountedCheckouts = (stat: PlayerStats): boolean =>
  stat.highestCheckout === 0 &&
  Object.values(stat.checkouts).some((range) => range.hit > 0);

/** Legacy match stats from before a metric was stored. */
export const needsMatchStatsBackfill = (
  stats: readonly PlayerStats[],
): boolean => {
  const isUnset = (value: number | undefined) => value == null || value === 0;

  return stats.some(
    (stat) =>
      (stat.average > 0 &&
        (isUnset(stat.firstNineAverage) ||
          isUnset(stat.scoringDartsAverage))) ||
      hasUncountedCheckouts(stat),
  );
};

/** Only includes keys for which an averages list was provided. */
export const buildBestAverages = (input: {
  wonLegAverages?: number[];
  wonSetAverages?: number[];
  matchAverages?: number[];
}): BestAverages => {
  const result: BestAverages = {};
  if (input.wonLegAverages) {
    result.bestLegAverage = maxAverage(input.wonLegAverages);
  }
  if (input.wonSetAverages) {
    result.bestSetAverage = maxAverage(input.wonSetAverages);
  }
  if (input.matchAverages) {
    result.bestMatchAverage = maxAverage(input.matchAverages);
  }
  return result;
};

export const calculateThreeDartAverage = (scores: Score[]): number => {
  if (scores.length === 0) {
    return 0;
  }

  const totalScoreSum = scores.reduce(
    (sum, score) => sum + score.totalScore,
    0,
  );
  const totalDarts = scores.reduce(
    (sum, score) => sum + getDartsThrownForScore(score),
    0,
  );

  if (totalDarts === 0) {
    return 0;
  }

  return totalScoreSum / (totalDarts / 3);
};

/** Visits with remaining score above 170 (pure scoring phase). */
export const calculateScoringDartsAverage = (scores: Score[]): number =>
  calculateThreeDartAverage(scores.filter((score) => score.startScore > 170));

const scoreTime = (score: Score): number => {
  const createdAt = score.createdAt;
  return createdAt instanceof Date
    ? createdAt.getTime()
    : new Date(createdAt).getTime();
};

/**
 * First 9 darts average: first visits of each leg until 9 darts (or fewer if
 * the leg ends earlier), aggregated across all legs.
 */
export const calculateFirstNineAverage = (scores: Score[]): number => {
  if (scores.length === 0) {
    return 0;
  }

  const byPlayerLeg = new Map<string, Score[]>();
  for (const score of scores) {
    const list = byPlayerLeg.get(score.playerLegId) ?? [];
    list.push(score);
    byPlayerLeg.set(score.playerLegId, list);
  }

  const firstNineScores: Score[] = [];
  for (const legScores of byPlayerLeg.values()) {
    const sorted = [...legScores].sort((a, b) => scoreTime(a) - scoreTime(b));
    let darts = 0;
    for (const score of sorted) {
      if (darts >= 9) {
        break;
      }
      firstNineScores.push(score);
      darts += getDartsThrownForScore(score);
    }
  }

  return calculateThreeDartAverage(firstNineScores);
};

/**
 * Per-leg averages plus cumulative match average through each leg. Legs get
 * both a running number for the x axis and a number within their set, which is
 * how the scores panel counts them. A leg the player has not thrown in yet
 * yields `null` rather than `0`, which would read as a real average on a chart.
 */
export const buildAverageSeries = (
  legs: readonly AverageSeriesLegInput[],
): AverageSeriesPoint[] => {
  const cumulativeScores: Score[] = [];
  const points: AverageSeriesPoint[] = [];

  let setLegNumber = 0;
  let previousSetIndex: number | undefined;

  legs.forEach((leg, index) => {
    cumulativeScores.push(...leg.scores);
    setLegNumber = leg.setIndex === previousSetIndex ? setLegNumber + 1 : 1;
    previousSetIndex = leg.setIndex;

    const thrown = leg.scores.length > 0;

    points.push({
      legIndex: index + 1,
      setLegIndex: setLegNumber,
      setIndex: leg.setIndex,
      legAverage: thrown ? calculateThreeDartAverage(leg.scores) : null,
      matchAverage: cumulativeScores.length
        ? calculateThreeDartAverage(cumulativeScores)
        : null,
      legScoringDartsAverage: thrown
        ? calculateScoringDartsAverage(leg.scores)
        : null,
      legFirstNineAverage: thrown
        ? calculateFirstNineAverage(leg.scores)
        : null,
    });
  });

  return points;
};
