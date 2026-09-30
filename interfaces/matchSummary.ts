import { MATCH_PANEL } from "~/constants/matchSummary";
import type { Score } from "~/interfaces/leg";

export type MatchPanel = (typeof MATCH_PANEL)[keyof typeof MATCH_PANEL];

export type MatchAverageChartPoint = {
  legIndex: number;
  setIndex?: number;
  legAverage: number;
  matchAverage: number;
  legScoringDartsAverage: number;
  legFirstNineAverage: number;
};

/** Flat leg row used to build chart series (scores for one player). */
export type MatchAverageChartLegInput = {
  scores: Score[];
  setIndex?: number;
};
