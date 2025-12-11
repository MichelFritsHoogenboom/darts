import { BaseService } from "./BaseService";
import type { Leg } from "~/interfaces/leg";
import { sortByOrder } from "~/utils/array";

export class LegService extends BaseService<Leg> {
  protected getTableName(): string {
    return "legs";
  }

  async getLegsForSet(setId: string, sortOrder?: string[]): Promise<Leg[]> {
    const table = await this.getTable();
    const legs = await table.where("setId").equals(setId).toArray();

    // If sortOrder is provided, sort legs according to that order
    if (sortOrder && sortOrder.length > 0) {
      return sortByOrder(legs, sortOrder, true);
    }

    return legs;
  }

  async getLegsForMatch(matchId: string, sortOrder?: string[]): Promise<Leg[]> {
    const table = await this.getTable();
    const legs = await table.where("matchId").equals(matchId).toArray();

    if (sortOrder && sortOrder.length > 0) {
      return sortByOrder(legs, sortOrder, false);
    }

    return legs;
  }
}
