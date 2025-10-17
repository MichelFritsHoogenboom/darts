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
  "40-54": number;
  "54-65": number;
  "66-89": number;
  "90-125": number;
  "126-161": number;
  "162-180": number;
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
