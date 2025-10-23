export interface CheckoutRanges {
  "0-40": number;
  "41-60": number;
  "61-80": number;
  "81-100": number;
  "101-130": number;
  "131-150": number;
  "151-170": number;
}

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
  "162-180": number; // 3 triples (perfect aimed)
}

export interface DartsThrownHit {
  thrown: number;
  hit: number;
}

export interface Stats {
  average: number;
  scoringDartsAverage: number;
  scores: ScoreRanges;
  checkouts: CheckoutRanges;
  highestCheckout: number;
  doubles: DartsThrownHit;
  setDarts?: DartsThrownHit;
  matchDarts?: DartsThrownHit;
}
