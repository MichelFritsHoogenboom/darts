import type { CheckoutRanges, ScoreRanges } from "~/interfaces/stats";

/** Match board score rows (high → mid), before the special 20–29 + camel and 0–19 rows. */
export const MATCH_SCORE_COUNT_KEYS: (keyof ScoreRanges)[] = [
  "180",
  "162-179",
  "126-161",
  "90-125",
  "66-89",
  "54-65",
  "40-53",
  "30-39",
];

/** Season comparison score rows (includes golden camel as its own row). */
export const SEASON_SCORE_COMPARE_KEYS: (keyof ScoreRanges)[] = [
  "180",
  "162-179",
  "126-161",
  "90-125",
  "66-89",
  "54-65",
  "goldenCamel",
];

export const CHECKOUT_KEYS_UP_TO_100: (keyof CheckoutRanges)[] = [
  "0-40",
  "41-60",
  "61-80",
  "81-100",
];
