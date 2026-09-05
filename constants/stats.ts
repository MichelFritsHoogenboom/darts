import type {
  CheckoutRanges,
  DisplayRange,
  ScoreDisplayRange,
} from "~/interfaces/stats";

/** Match board score rows (high → low), including merged 0–19 and camel on 20–29. */
export const MATCH_SCORE_DISPLAY_RANGES: ScoreDisplayRange[] = [
  { keys: ["180"] },
  { keys: ["162-179"] },
  { keys: ["126-161"] },
  { keys: ["90-125"] },
  { keys: ["66-89"] },
  { keys: ["54-65"] },
  { keys: ["40-53"] },
  { keys: ["30-39"] },
  { keys: ["20-29"], showCamel: true },
  { keys: ["0-9", "10-19"] },
];

/** Season comparison score rows (golden camel as its own row). */
export const SEASON_SCORE_DISPLAY_RANGES: ScoreDisplayRange[] = [
  { keys: ["180"] },
  { keys: ["162-179"] },
  { keys: ["126-161"] },
  { keys: ["90-125"] },
  { keys: ["66-89"] },
  { keys: ["54-65"] },
  { keys: ["goldenCamel"] },
];

/** Checkout rows: single buckets plus merged 101–170. */
export const CHECKOUT_DISPLAY_RANGES: DisplayRange<CheckoutRanges>[] = [
  { keys: ["0-40"] },
  { keys: ["41-60"] },
  { keys: ["61-80"] },
  { keys: ["81-100"] },
  { keys: ["101-130", "131-150", "151-170"] },
];
