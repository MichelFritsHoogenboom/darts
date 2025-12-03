import { BaseService } from "./BaseService";
import type { Match } from "../interfaces/match";

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
   * Optimized: Uses IndexedDB multi-entry index for O(log n) lookup
   * The *players index allows efficient querying of array values
   */
  async getMatchesForPlayer(playerId: string): Promise<Match[]> {
    const table = await this.getTable();
    // Use multi-entry index for optimal performance with thousands of matches
    return await table.where("players").equals(playerId).toArray();
  }

  /**
   * Retrieves all matches that are not yet finished (no winner assigned)
   * @returns Promise resolving to an array of unfinished Match objects
   */
  async getAllUnfinishedMatches(): Promise<Match[]> {
    const table = await this.getTable();
    const allMatches = await table.toArray();
    return allMatches.filter((match: Match) => !match.winner);
  }

  /**
   * Get the last N finished matches (matches with a winner)
   * Sorted by most recent first (by updatedAt)
   * Optimized: Fetches a small batch of recent matches instead of all matches
   */
  async getLastFinishedMatches(limit: number = 10): Promise<Match[]> {
    const table = await this.getTable();

    // Fetch a reasonable batch size (3x the limit) of most recent matches
    // This assumes roughly 1/3 of matches are finished, so we should get enough
    const batchSize = limit * 3;

    // Get the most recent matches sorted by updatedAt descending
    const recentMatches = await table
      .orderBy("updatedAt")

      .limit(batchSize)
      .toArray();

    // Filter for matches with winners and take only what we need
    return recentMatches
      .filter((match: Match) => !!match.winner)
      .slice(0, limit);
  }
}
