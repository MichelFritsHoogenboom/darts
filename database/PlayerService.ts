import { DatabaseService } from "./DatabaseService";
import type { Player } from "../interfaces/player";

/**
 * Player-specific database operations
 */
export class PlayerService {
  /**
   * Add or update a player
   */
  static async upsertPlayer(player: Player): Promise<Player> {
    const db = await DatabaseService.ensureDatabase();
    return await DatabaseService.upsert<Player>(db.players, player);
  }

  /**
   * Get a player by ID
   */
  static async getPlayer(id: string): Promise<Player | undefined> {
    const db = await DatabaseService.ensureDatabase();
    return await DatabaseService.getById<Player>(db.players, id);
  }

  /**
   * Get all players
   */
  static async getAllPlayers(): Promise<Player[]> {
    const db = await DatabaseService.ensureDatabase();
    return await DatabaseService.getAll<Player>(db.players);
  }

  /**
   * Delete a player by ID
   */
  static async deletePlayer(id: string): Promise<void> {
    const db = await DatabaseService.ensureDatabase();
    await DatabaseService.deleteById(db.players, id);
  }

  /**
   * Search players by name or alias
   */
  static async searchPlayers(searchTerm: string): Promise<Player[]> {
    const db = await DatabaseService.ensureDatabase();
    return await DatabaseService.search<Player>(db.players, searchTerm, [
      "firstName",
      "lastName",
      "alias",
    ]);
  }

  /**
   * Check if a player exists by ID
   */
  static async playerExists(id: string): Promise<boolean> {
    const player = await this.getPlayer(id);
    return !!player;
  }
}
