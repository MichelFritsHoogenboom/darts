import { BaseService } from "./BaseService";
import type { Set } from "~/interfaces/set";

export class SetService extends BaseService<Set> {
  protected getTableName(): string {
    return "sets";
  }

  async getSetsForMatch(matchId: string): Promise<Set[]> {
    const table = await this.getTable();
    return await table.where("matchId").equals(matchId).toArray();
  }
}
