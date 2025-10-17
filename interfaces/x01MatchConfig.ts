export const X01_GAMETYPES = {
  1001: 1001,
  701: 701,
  501: 501,
  301: 301,
};

export const X01_GAME_PLAYED_IN = {
  sets: "sets",
  legs: "legs",
};

export const GAME_WIN_DEFINITION = {
  bestOf: "Best of",
  firstTo: "First to",
};

export const SETS_TO_WIN_OPTIONS = Object.fromEntries(
  Array.from({ length: 6 }, (_, i) => [i + 2, i + 2])
);

export const LEGS_TO_WIN_SET_OPTIONS = Object.fromEntries(
  Array.from({ length: 4 }, (_, i) => [i + 2, i + 2])
);

export const LEGS_TO_WIN_MATCH_OPTIONS = Object.fromEntries(
  Array.from({ length: 20 }, (_, i) => [i + 1, i + 1])
);

export interface x01MatchConfig {
  gameType: keyof typeof X01_GAMETYPES;
  gamePlayedIn: keyof typeof X01_GAME_PLAYED_IN;
  gameWinDefinition: keyof typeof GAME_WIN_DEFINITION;
  tiebreak: boolean;
  startingPlayer: number;
  setsToWin?: number;
  legsToWinSet?: number;
  legsToWinMatch?: number;
}
