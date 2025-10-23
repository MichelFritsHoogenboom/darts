import { BaseService } from "./BaseService";
import type { SingleDartScore } from "~/interfaces/leg";

export class SingleDartScoreService extends BaseService<SingleDartScore> {
  protected getTableName(): string {
    return "singleDartScores";
  }

  async getSingleDartScoresForScore(
    scoreId: string
  ): Promise<SingleDartScore[]> {
    const table = await this.getTable();
    return await table.where("scoreId").equals(scoreId).toArray();
  }

  async getSingleDartScoresForPlayer(
    playerId: string
  ): Promise<SingleDartScore[]> {
    const table = await this.getTable();
    return await table.where("playerId").equals(playerId).toArray();
  }
}
