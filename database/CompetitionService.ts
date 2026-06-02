import { BaseService } from "./BaseService";
import type { Competition } from "../interfaces/competition";
import { COMPETITION_TYPES } from "../interfaces/competition";

export class CompetitionService extends BaseService<Competition> {
  protected getTableName(): string {
    return "competitions";
  }

  async getHead2HeadCompetitions(): Promise<Competition[]> {
    const table = await this.getTable();
    return await table
      .where("competitionType")
      .equals(COMPETITION_TYPES.head2head)
      .toArray();
  }
}
