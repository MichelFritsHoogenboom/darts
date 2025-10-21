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

// Clean type definitions
export type X01GameType = (typeof X01_GAMETYPES)[keyof typeof X01_GAMETYPES];
export type X01GamePlayedIn =
  (typeof X01_GAME_PLAYED_IN)[keyof typeof X01_GAME_PLAYED_IN];
export type X01GameWinDefinition =
  (typeof GAME_WIN_DEFINITION)[keyof typeof GAME_WIN_DEFINITION];

export interface x01MatchConfig {
  gameType: X01GameType;
  gamePlayedIn: X01GamePlayedIn;
  gameWinDefinition: X01GameWinDefinition;
  tiebreak: boolean;
  legsToWinParent: number;
  setsToWin?: number;
}

export const defaultX01MatchConfig: x01MatchConfig = {
  gameType: X01_GAMETYPES[501],
  gamePlayedIn: X01_GAME_PLAYED_IN.sets,
  gameWinDefinition: GAME_WIN_DEFINITION.firstTo,
  tiebreak: false,
  setsToWin: 2,
  legsToWinParent: 3,
};
