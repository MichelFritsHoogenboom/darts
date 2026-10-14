import type { Score } from "~/interfaces/leg";

/** One average metric plotted as a line. */
export type AverageMetricKey =
  | "matchAverage"
  | "legAverage"
  | "legScoringDartsAverage"
  | "legFirstNineAverage";

/** Line style catalog entry for one metric. */
export type AverageMetric = {
  key: AverageMetricKey;
  label: string;
  borderDash: number[];
  borderWidth: number;
};

/** Per-leg averages plus the cumulative match average through that leg. */
export type AverageSeriesPoint = {
  legIndex: number;
  legAverage: number;
  matchAverage: number;
  legScoringDartsAverage: number;
  legFirstNineAverage: number;
  setIndex?: number;
};

/** Flat leg row used to build a series (scores for one player). */
export type AverageSeriesLegInput = {
  scores: Score[];
  setIndex?: number;
};

/** One toggleable legend entry. */
export type LegendItem = {
  key: string;
  label: string;
  color: string;
  borderDash: number[];
  borderWidth: number;
  hidden: boolean;
};

/** Legend entries belonging to one player. */
export type LegendRow = {
  playerLabel: string | null;
  items: LegendItem[];
};

/** chart.js annotation marking the leg where a new set starts. */
export type SetBreakAnnotation = {
  type: "line";
  xMin: number;
  xMax: number;
  borderColor: string;
  borderWidth: number;
  borderDash: number[];
  label: {
    display: boolean;
    content: string;
    position: "start";
    color: string;
    backgroundColor: string;
    font: { size: number };
  };
};
