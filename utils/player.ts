import type { Player } from "~/interfaces/player";

/**
 * Get the full name of a player
 * Returns formatted name: "FirstName LastName" or "FirstName" if no lastName
 * Falls back to alias if no name, or "Unknown" if nothing available
 */
export function getPlayerFullName(player: Player): string {
  if (!player) return "Unknown";
  return `${player.firstName} ${player.lastName || ""}`;
}

/**
 * Get a short display name for a player
 * Returns alias if available, otherwise full name
 */
export function getPlayerDisplayName(player: Player): string {
  if (!player) return "Unknown";
  return player.alias || player.firstName;
}
