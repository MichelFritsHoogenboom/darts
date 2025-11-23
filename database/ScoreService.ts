import { BaseService } from "./BaseService";
import type { Score } from "~/interfaces/leg";

export class ScoreService extends BaseService<Score> {
  protected getTableName(): string {
    return "scores";
  }

  /**
   * Sort scores by createdAt to ensure chronological order
   */
  private sortScoresByCreatedAt(scores: Score[]): Score[] {
    return scores.sort((a: Score, b: Score) => {
      const dateA =
        a.createdAt instanceof Date
          ? a.createdAt.getTime()
          : new Date(a.createdAt).getTime();
      const dateB =
        b.createdAt instanceof Date
          ? b.createdAt.getTime()
          : new Date(b.createdAt).getTime();
      return dateA - dateB;
    });
  }

  async getScoresForPlayerLeg(playerLegId: string): Promise<Score[]> {
    const table = await this.getTable();
    const scores = await table
      .where("playerLegId")
      .equals(playerLegId)
      .toArray();
    return this.sortScoresByCreatedAt(scores);
  }

  async getScoresForPlayer(playerId: string): Promise<Score[]> {
    const table = await this.getTable();
    const scores = await table.where("playerId").equals(playerId).toArray();
    return this.sortScoresByCreatedAt(scores);
  }
}
