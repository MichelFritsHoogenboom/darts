import { BaseService } from "./BaseService";
import type { PlayerStats } from "~/interfaces/stats";

export class PlayerStatsService extends BaseService<PlayerStats> {
  protected getTableName(): string {
    return "playerStats";
  }

  async getPlayerStatsForPlayer(playerId: string): Promise<PlayerStats[]> {
    const table = await this.getTable();
    return await table.where("playerId").equals(playerId).toArray();
  }

  async getPlayerStatsForMatch(matchId: string): Promise<PlayerStats[]> {
    const table = await this.getTable();
    return await table.where("matchId").equals(matchId).toArray();
  }

  async getPlayerStatsForSet(setId: string): Promise<PlayerStats[]> {
    const table = await this.getTable();
    return await table.where("setId").equals(setId).toArray();
  }

  async getPlayerStatsForPlayerLeg(
    playerLegId: string
  ): Promise<PlayerStats[]> {
    const table = await this.getTable();
    return await table.where("playerLegId").equals(playerLegId).toArray();
  }
}
