import { BaseService } from "./BaseService";
import type { Score } from "~/interfaces/leg";
import { isCheckoutScore } from "~/utils/score";

export class ScoreService extends BaseService<Score> {
  protected getTableName(): string {
    return "scores";
  }

  /**
   * Sort scores by createdAt to ensure chronological order
   */
  private sortScoresByCreatedAt(scores: Score[]): Score[] {
    return scores.sort(
      (a: Score, b: Score) => a.createdAt.getTime() - b.createdAt.getTime(),
    );
  }

  async getCheckouts(limit?: number): Promise<Score[]> {
    const table = await this.getTable();
    const checkouts = await table
      .filter((score: Score) => isCheckoutScore(score))
      .toArray();

    checkouts.sort((a: Score, b: Score) => {
      const scoreDiff = b.totalScore - a.totalScore;
      if (scoreDiff !== 0) return scoreDiff;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    return limit !== undefined ? checkouts.slice(0, limit) : checkouts;
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

  async getScoresForMatch(matchId: string): Promise<Score[]> {
    const table = await this.getTable();
    const scores = await table.where("matchId").equals(matchId).toArray();
    return this.sortScoresByCreatedAt(scores);
  }

  async getScoresForSet(setId: string): Promise<Score[]> {
    const table = await this.getTable();
    const scores = await table.where("setId").equals(setId).toArray();
    return this.sortScoresByCreatedAt(scores);
  }
}
