import type {
  CheckoutRanges,
  CompareSide,
  DartsThrownHit,
  DisplayRange,
  RangeBounds,
  ScoreDisplayRange,
  ScoreRanges,
} from "~/interfaces/stats";
import {
  createCheckoutRanges,
  createScoreRanges,
} from "~/interfaces/stats";

export const parseRangeKey = (key: string): { min: number; max: number } => {
  if (key === "180") return { min: 180, max: 180 };
  const [min, max] = key.split("-").map(Number);
  return { min, max };
};

const formatMergedRangeLabel = (keys: string[]): string => {
  const bounds = keys.map(parseRangeKey);
  const min = Math.min(...bounds.map((bound) => bound.min));
  const max = Math.max(...bounds.map((bound) => bound.max));
  return `${min} - ${max}`;
};

export const formatScoreRangeLabel = (key: keyof ScoreRanges): string => {
  if (key === "180") return "180's";
  if (key === "goldenCamel") return "Gouden kamelen";
  return key.replace("-", " - ");
};

export const formatCheckoutRangeKey = (key: keyof CheckoutRanges) =>
  key.replace("-", " - ");

export const formatScoreDisplayRangeLabel = (
  range: ScoreDisplayRange,
): string => {
  if (range.keys.length === 1) return formatScoreRangeLabel(range.keys[0]);
  return formatMergedRangeLabel(range.keys);
};

export const formatCheckoutDisplayRangeLabel = (
  range: DisplayRange<CheckoutRanges>,
): string => {
  if (range.keys.length === 1) return formatCheckoutRangeKey(range.keys[0]);
  return formatMergedRangeLabel(range.keys);
};

export const sumScoreDisplayRange = (
  scores: ScoreRanges,
  range: ScoreDisplayRange,
): number => range.keys.reduce((sum, key) => sum + scores[key], 0);

export const sumCheckoutDisplayRange = (
  checkouts: CheckoutRanges,
  range: DisplayRange<CheckoutRanges>,
): DartsThrownHit =>
  range.keys.reduce(
    (acc, key) => ({
      thrown: acc.thrown + checkouts[key].thrown,
      hit: acc.hit + checkouts[key].hit,
    }),
    { thrown: 0, hit: 0 },
  );

export const resolveCheckoutDisplayRange = (
  checkouts: CheckoutRanges,
  range: DisplayRange<CheckoutRanges>,
) => ({
  label: formatCheckoutDisplayRangeLabel(range),
  stats: sumCheckoutDisplayRange(checkouts, range),
});

export const resolveScoreDisplayRange = (
  scores: ScoreRanges,
  range: ScoreDisplayRange,
) => ({
  label: formatScoreDisplayRangeLabel(range),
  value: sumScoreDisplayRange(scores, range),
});

const scoreRangeBounds = (): RangeBounds[] => {
  const keys = Object.keys(createScoreRanges()) as (keyof ScoreRanges)[];
  return keys
    .filter((key) => key !== "goldenCamel")
    .map((key) => {
      const { min, max } = parseRangeKey(key);
      return { key, min, max };
    })
    .sort((a, b) => b.min - a.min);
};

const SCORE_RANGE_BOUNDS = scoreRangeBounds();

export const getScoreRangeKey = (totalScore: number): keyof ScoreRanges => {
  for (const { key, min, max } of SCORE_RANGE_BOUNDS) {
    if (totalScore >= min && totalScore <= max) {
      return key as keyof ScoreRanges;
    }
  }
  return "0-9";
};

export const formatAverageDisplay = (
  value: number,
  fractionDigits = 1,
): string => (value > 0 ? value.toFixed(fractionDigits) : "—");

/** 1-dart average from a 3-dart average; `—` when missing/zero. */
export const formatOneDartAverage = (
  threeDartAverage: number,
  fractionDigits = 2,
): string => formatAverageDisplay(threeDartAverage / 3, fractionDigits);

export const formatStatCount = (value: number) =>
  value > 0 ? String(value) : "0";

export const formatCheckoutHitThrown = (value: DartsThrownHit) =>
  `${value.hit}/${value.thrown}`;

/** Percentage string; `—` when nothing thrown. */
export const formatCheckoutPercentage = (
  value: DartsThrownHit,
  fractionDigits = 0,
): string => {
  if (!value.thrown) return "—";
  const factor = 10 ** fractionDigits;
  const pct = Math.round((value.hit / value.thrown) * 100 * factor) / factor;
  return `${pct}%`;
};

export const checkoutRate = (value: DartsThrownHit): number | undefined =>
  value.thrown > 0 ? value.hit / value.thrown : undefined;

export const betterNumber = (a: number, b: number): CompareSide => {
  if (a === b) return null;
  return a > b ? "left" : "right";
};

export const betterCheckout = (
  a: DartsThrownHit,
  b: DartsThrownHit,
): CompareSide => {
  const rateA = checkoutRate(a);
  const rateB = checkoutRate(b);
  if (rateA !== undefined && rateB !== undefined) {
    if (rateA === rateB) {
      if (a.hit === b.hit) return null;
      return a.hit > b.hit ? "left" : "right";
    }
    return rateA > rateB ? "left" : "right";
  }
  if (rateA !== undefined) return "left";
  if (rateB !== undefined) return "right";
  if (a.hit === b.hit) return null;
  return a.hit > b.hit ? "left" : "right";
};

export const sumScoreRanges = (ranges: ScoreRanges[]): ScoreRanges => {
  const result = createScoreRanges();
  for (const range of ranges) {
    for (const key of Object.keys(result) as (keyof ScoreRanges)[]) {
      result[key] += range[key];
    }
  }
  return result;
};

export const sumCheckoutRanges = (
  ranges: CheckoutRanges[],
): CheckoutRanges => {
  const result = createCheckoutRanges();
  for (const range of ranges) {
    for (const key of Object.keys(result) as (keyof CheckoutRanges)[]) {
      result[key].thrown += range[key].thrown;
      result[key].hit += range[key].hit;
    }
  }
  return result;
};
