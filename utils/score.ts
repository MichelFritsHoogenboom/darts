import type { Score } from "~/interfaces/leg";
import { maxAverage } from "~/utils/averages";

export const isCheckoutScore = (score: Score) =>
  score.startScore === score.totalScore;

/** Highest checkout hit in these scores; 0 when none were hit. */
export const highestCheckoutFromScores = (scores: Score[]): number =>
  maxAverage(scores.filter(isCheckoutScore).map((score) => score.totalScore));
