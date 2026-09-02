import type { Score } from "~/interfaces/leg";

export const getDartsThrownForScore = (score: Score): number =>
  score.dartsThrown ?? 3;

export const calculateThreeDartAverage = (scores: Score[]): number => {
  if (scores.length === 0) return 0;

  const totalScoreSum = scores.reduce((sum, score) => sum + score.totalScore, 0);
  const totalDarts = scores.reduce(
    (sum, score) => sum + getDartsThrownForScore(score),
    0,
  );

  if (totalDarts === 0) return 0;

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
  if (scores.length === 0) return 0;

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
      if (darts >= 9) break;
      firstNineScores.push(score);
      darts += getDartsThrownForScore(score);
    }
  }

  return calculateThreeDartAverage(firstNineScores);
};
