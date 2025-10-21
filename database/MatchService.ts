import { DatabaseService } from "./DatabaseService";
import type { Match } from "../interfaces/match";

/**
 * Match-specific database operations
 */
export class MatchService {
  /**
   * Add or update a match
   */
  static async upsertMatch(match: Match): Promise<Match> {
    const db = await DatabaseService.ensureDatabase();
    return await DatabaseService.upsert<Match>(db.matches, match);
  }

  /**
   * Get a match by ID
   */
  static async getMatch(id: string): Promise<Match | undefined> {
    const db = await DatabaseService.ensureDatabase();
    return await DatabaseService.getById<Match>(db.matches, id);
  }

  /**
   * Get all matches
   */
  static async getAllMatches(): Promise<Match[]> {
    const db = await DatabaseService.ensureDatabase();
    return await DatabaseService.getAll<Match>(db.matches);
  }

  /**
   * Delete a match by ID
   */
  static async deleteMatch(id: string): Promise<void> {
    const db = await DatabaseService.ensureDatabase();
    await DatabaseService.deleteById(db.matches, id);
  }

  /**
   * Search matches by player names or game type
   */
  static async searchMatches(searchTerm: string): Promise<Match[]> {
    const db = await DatabaseService.ensureDatabase();
    return await DatabaseService.search<Match>(db.matches, searchTerm, [
      "gameType",
      "players.firstName",
      "players.lastName",
    ]);
  }

  /**
   * Check if a match exists by ID
   */
  static async matchExists(id: string): Promise<boolean> {
    const match = await this.getMatch(id);
    return !!match;
  }

  /**
   * Get matches for a specific player
   */
  static async getMatchesForPlayer(playerId: string): Promise<Match[]> {
    const db = await DatabaseService.ensureDatabase();
    const allMatches = await DatabaseService.getAll<Match>(db.matches);
    return allMatches.filter((match) =>
      match.players.some((player) => player.id === playerId)
    );
  }
}
