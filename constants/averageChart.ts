import type {
  AverageMetric,
  AverageMetricKey,
} from "~/interfaces/averageChart";

/** View selector value showing every player at once; otherwise a player id. */
export const AVERAGE_VIEW_BOTH = "both";

/**
 * Chart colors. chart.js needs literal color strings, so these mirror the
 * tailwind theme rather than using classes.
 *
 * ponytail: the dartboard values are duplicated from `tailwind.config.js`.
 * Ceiling — renaming a token there drifts silently. Upgrade path: move the
 * palette into one module that both this file and `tailwind.config.js` read.
 */
export const CHART_COLORS = {
  /** `dartboard.red.DEFAULT` */
  playerOne: "#c62828",
  /** `dartboard.blue.bright` */
  playerTwo: "#1a6fe8",
  /** `dartboard.white` */
  tooltipTitle: "#f9fafb",
  axis: "rgb(156, 163, 175)",
  grid: "rgba(75, 85, 99, 0.35)",
  border: "rgba(75, 85, 99, 0.5)",
  setBreak: "rgba(156, 163, 175, 0.55)",
  tooltipBackground: "rgba(17, 24, 39, 0.92)",
  tooltipBody: "rgb(229, 231, 235)",
  annotationBackground: "rgba(17, 24, 39, 0.75)",
} as const;

/** Player 1 warm/red family; player 2 cool/blue family. */
export const AVERAGE_PLAYER_COLORS = [
  CHART_COLORS.playerOne,
  CHART_COLORS.playerTwo,
] as const;

export const AVERAGE_METRICS: AverageMetric[] = [
  {
    key: "matchAverage",
    label: "Match",
    borderDash: [],
    borderWidth: 4,
  },
  {
    key: "legAverage",
    label: "Leg",
    borderDash: [],
    borderWidth: 2.5,
  },
  {
    key: "legScoringDartsAverage",
    label: "Scoring",
    borderDash: [6, 4],
    borderWidth: 1.5,
  },
  {
    key: "legFirstNineAverage",
    label: "First 9",
    borderDash: [2, 3],
    borderWidth: 1.5,
  },
];

/** Metrics toggled off when the chart opens. */
export const DEFAULT_HIDDEN_AVERAGE_METRICS = new Set<AverageMetricKey>([
  "matchAverage",
  "legFirstNineAverage",
]);

/** Line draw-in, skipped entirely under `prefers-reduced-motion`. */
export const AVERAGE_CHART_ANIMATION = {
  duration: 750,
  easing: "easeOutQuart",
} as const;
