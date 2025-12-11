import { BaseService } from "./BaseService";
import type { Set } from "~/interfaces/set";
import { sortByOrder } from "~/utils/array";

export class SetService extends BaseService<Set> {
  protected getTableName(): string {
    return "sets";
  }

  async getSetsForMatch(matchId: string, sortOrder?: string[]): Promise<Set[]> {
    const table = await this.getTable();
    const sets = await table.where("matchId").equals(matchId).toArray();

    if (sortOrder && sortOrder.length > 0) {
      return sortByOrder(sets, sortOrder, false);
    }

    return sets;
  }
}
