export interface DartsThrownHit {
  thrown: number;
  hit: number;
}

export const createDartsThrownHit = (): DartsThrownHit => ({
  thrown: 0,
  hit: 0,
});

export interface CheckoutRanges {
  "0-40": DartsThrownHit;
  "41-60": DartsThrownHit;
  "61-80": DartsThrownHit;
  "81-100": DartsThrownHit;
  "101-130": DartsThrownHit;
  "131-150": DartsThrownHit;
  "151-170": DartsThrownHit;
}

export const createCheckoutRanges = (): CheckoutRanges => ({
  "0-40": createDartsThrownHit(),
  "41-60": createDartsThrownHit(),
  "61-80": createDartsThrownHit(),
  "81-100": createDartsThrownHit(),
  "101-130": createDartsThrownHit(),
  "131-150": createDartsThrownHit(),
  "151-170": createDartsThrownHit(),
});

export interface ScoreRanges {
  "0-9": number;
  "10-19": number;
  "20-29": number;
  "30-39": number;
  "40-53": number; // 2 well aimed scoring darts and a loose dart
  "54-65": number; // three single darts of at least 18
  "66-89": number; // 1 triple and 1 single of at least 18, 1 loose dart
  "90-125": number; // one triple and two singles of at least 18
  "126-161": number; // 2 triples and one single dart of at least 18
  "162-179": number; // 3 triples (perfect aimed)
  "180": number; // 3 triple 20's (perfect aimed)
  goldenCamel: number;
}

export const createScoreRanges = (): ScoreRanges => ({
  "0-9": 0,
  "10-19": 0,
  "20-29": 0,
  "30-39": 0,
  "40-53": 0,
  "54-65": 0,
  "66-89": 0,
  "90-125": 0,
  "126-161": 0,
  "162-179": 0,
  "180": 0,
  goldenCamel: 0,
});

export type RangeBounds = { key: string; min: number; max: number };

/** One or more stored buckets shown as a single UI row. */
export type DisplayRange<TRanges extends object> = {
  keys: (keyof TRanges)[];
};

export type ScoreDisplayRange = DisplayRange<ScoreRanges> & {
  /** Show golden-camel counts next to this row (match score board). */
  showCamel?: boolean;
};
