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
