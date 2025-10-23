import { BaseService } from "./BaseService";
import type { Score } from "~/interfaces/leg";

export class ScoreService extends BaseService<Score> {
  protected getTableName(): string {
    return "scores";
  }

  async getScoresForPlayerLeg(playerLegId: string): Promise<Score[]> {
    const table = await this.getTable();
    return await table.where("playerLegId").equals(playerLegId).toArray();
  }

  async getScoresForPlayer(playerId: string): Promise<Score[]> {
    const table = await this.getTable();
    return await table.where("playerId").equals(playerId).toArray();
  }
}
