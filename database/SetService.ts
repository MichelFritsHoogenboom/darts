import { BaseService } from "./BaseService";
import type { Set } from "~/interfaces/set";
import { sortByCreatedAt } from "~/utils/array";

export class SetService extends BaseService<Set> {
  protected getTableName(): string {
    return "sets";
  }

  async getSetsForMatch(matchId: string, _sortOrder?: string[]): Promise<Set[]> {
    const table = await this.getTable();
    const sets = await table.where("matchId").equals(matchId).toArray();
    return sortByCreatedAt(sets);
  }
}
