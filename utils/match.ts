import type { Set } from "~/interfaces/set";
import type { Leg } from "~/interfaces/leg";

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

// Default export for compatibility
export default {
  getPlayerWinnerCount,
};
