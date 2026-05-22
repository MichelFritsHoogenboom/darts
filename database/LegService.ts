import { BaseService } from "./BaseService";
import type { Leg } from "~/interfaces/leg";
import { sortByCreatedAt } from "~/utils/array";

export class LegService extends BaseService<Leg> {
  protected getTableName(): string {
    return "legs";
  }

  async getLegsForSet(setId: string, _sortOrder?: string[]): Promise<Leg[]> {
    const table = await this.getTable();
    const legs = await table.where("setId").equals(setId).toArray();
    return sortByCreatedAt(legs);
  }

  async getLegsForMatch(matchId: string, _sortOrder?: string[]): Promise<Leg[]> {
    const table = await this.getTable();
    const legs = await table.where("matchId").equals(matchId).toArray();
    return sortByCreatedAt(legs);
  }
}
