import { BaseService } from "./BaseService";
import type { Player } from "../interfaces/player";

/**
 * Player-specific database operations
 */
export class PlayerService extends BaseService<Player> {
  protected getTableName(): string {
    return "players";
  }

  /**
   * Check if a player exists by ID
   */
  async playerExists(id: string): Promise<boolean> {
    const player = await this.get(id);
    return !!player;
  }
  /**
   * Search players by name or alias
   */
  async searchPlayers(searchTerm: string): Promise<Player[]> {
    return await this.search(searchTerm, ["firstName", "lastName", "alias"]);
  }
}
