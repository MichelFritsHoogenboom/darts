import { BaseService } from "./BaseService";
import type { Match } from "../interfaces/match";
import type { PlayerStats } from "../interfaces/player";

/**
 * Match-specific database operations
 */
export class MatchService extends BaseService<Match> {
  protected getTableName(): string {
    return "matches";
  }

  /**
   * Search matches by player names or game type
   */
  async searchMatches(searchTerm: string): Promise<Match[]> {
    return await this.search(searchTerm, ["gameType"]);
  }

  /**
   * Check if a match exists by ID
   */
  async matchExists(id: string): Promise<boolean> {
    const match = await this.get(id);
    return !!match;
  }

  /**
   * Get matches for a specific player
   */
  async getMatchesForPlayer(playerId: string): Promise<Match[]> {
    const allMatches = await this.getAll();
    return allMatches.filter((match: Match) =>
      match.players.some((player: PlayerStats) => player.id === playerId)
    );
  }
}
