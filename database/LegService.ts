import { BaseService } from "./BaseService";
import type { Leg } from "~/interfaces/leg";

export class LegService extends BaseService<Leg> {
  protected getTableName(): string {
    return "legs";
  }

  async getLegsForSet(setId: string): Promise<Leg[]> {
    const table = await this.getTable();
    return await table.where("setId").equals(setId).toArray();
  }

  async getLegsForMatch(matchId: string): Promise<Leg[]> {
    const table = await this.getTable();
    return await table.where("matchId").equals(matchId).toArray();
  }
}
