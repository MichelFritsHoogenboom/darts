import type { Set } from "~/interfaces/set";
import type { Leg } from "~/interfaces/leg";
import type { x01MatchConfig } from "~/interfaces/x01MatchConfig";
import { X01_GAME_PLAYED_IN } from "~/interfaces/x01MatchConfig";

/**
 * Counts how many games (sets or legs) a player has won
 * @param playerId - The ID of the player
 * @param games - Array of Sets or Legs with a winner property
 * @returns The number of games won by the player
 */
export const getPlayerWinnerCount = (
  playerId: string,
  games: Array<Set | Leg>,
): number =>
  games?.filter((game) => game.winner === playerId).length || 0;

/** Full: "501 • First to 2 sets • 3 legs to win set". Compact: "501 First to 2 sets" */
export const formatX01MatchConfigSummary = (
  config: x01MatchConfig,
  compact = false,
): string => {
  if (config.gamePlayedIn === X01_GAME_PLAYED_IN.sets) {
    if (compact) {
      return `${config.gameType} ${config.gameWinDefinition} ${config.setsToWin} ${config.gamePlayedIn}`;
    }

    return [
      `${config.gameType}`,
      `${config.gameWinDefinition} ${config.setsToWin} sets`,
      `${config.legsToWinParent} legs to win set`,
    ].join(" • ");
  }

  if (compact) {
    return `${config.gameType} ${config.gameWinDefinition} ${config.legsToWinParent} ${config.gamePlayedIn}`;
  }

  return [
    `${config.gameType}`,
    `${config.gameWinDefinition} ${config.legsToWinParent} legs`,
  ].join(" • ");
};
