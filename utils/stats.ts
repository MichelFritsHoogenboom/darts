import type {
  CheckoutRanges,
  CompareSide,
  DartsThrownHit,
  RangeBounds,
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

export const formatScoreRangeLabel = (key: keyof ScoreRanges): string => {
  if (key === "180") return "180's";
  if (key === "goldenCamel") return "Gouden kamelen";
  return key.replace("-", " - ");
};

export const formatCheckoutRangeKey = (key: keyof CheckoutRanges) =>
  key.replace("-", " - ");

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

/** Aggregate checkout buckets whose range min is above `minExclusive`. */
export const sumCheckoutsAbove = (
  checkouts: CheckoutRanges,
  minExclusive = 100,
): DartsThrownHit => {
  let thrown = 0;
  let hit = 0;

  for (const key of Object.keys(checkouts) as (keyof CheckoutRanges)[]) {
    if (Number(key.split("-")[0]) <= minExclusive) continue;
    thrown += checkouts[key].thrown;
    hit += checkouts[key].hit;
  }

  return { thrown, hit };
};

export const checkoutsAboveLabel = (
  checkouts: CheckoutRanges,
  minExclusive = 100,
): string => {
  const above = (Object.keys(checkouts) as (keyof CheckoutRanges)[]).filter(
    (key) => Number(key.split("-")[0]) > minExclusive,
  );
  if (!above.length) return `${minExclusive}+`;

  const min = Math.min(...above.map((key) => Number(key.split("-")[0])));
  const max = Math.max(...above.map((key) => Number(key.split("-")[1])));
  return `${min} - ${max}`;
};

export const scoreRangeValue = (
  scores: ScoreRanges,
  key: keyof ScoreRanges,
): number => scores[key];

export const sumLowScores = (scores: ScoreRanges): number =>
  scores["0-9"] + scores["10-19"];

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
