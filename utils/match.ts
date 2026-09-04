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
export function getPlayerWinnerCount(
  playerId: string,
  games: Array<Set | Leg>
): number {
  return games?.filter((game) => game.winner === playerId).length || 0;
}

/** e.g. "501 • First to 2 sets • 3 legs to win set" */
export function formatX01MatchConfigSummary(config: x01MatchConfig): string {
  if (config.gamePlayedIn === X01_GAME_PLAYED_IN.sets) {
    return [
      `${config.gameType}`,
      `${config.gameWinDefinition} ${config.setsToWin} sets`,
      `${config.legsToWinParent} legs to win set`,
    ].join(" • ");
  }

  return [
    `${config.gameType}`,
    `${config.gameWinDefinition} ${config.legsToWinParent} legs`,
  ].join(" • ");
}

// Default export for compatibility
export default {
  getPlayerWinnerCount,
};
