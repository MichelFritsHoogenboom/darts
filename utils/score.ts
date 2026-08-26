import type { Score } from "~/interfaces/leg";

export const isCheckoutScore = (score: Score) =>
  score.startScore === score.totalScore;
