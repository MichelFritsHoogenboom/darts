import { BaseService } from "./BaseService";
import type { Leg } from "~/interfaces/leg";

export class LegService extends BaseService<Leg> {
  protected getTableName(): string {
    return "legs";
  }

  async getLegsForSet(setId: string, sortOrder?: string[]): Promise<Leg[]> {
    const table = await this.getTable();
    const legs = await table.where("setId").equals(setId).toArray();

    // If sortOrder is provided, sort legs according to that order
    if (sortOrder && sortOrder.length > 0) {
      return legs.sort((a: Leg, b: Leg) => {
        const indexA = sortOrder.indexOf(a.id);
        const indexB = sortOrder.indexOf(b.id);
        // If not found in sortOrder, sort by updatedAt as fallback
        if (indexA === -1 && indexB === -1) {
          return a.updatedAt.getTime() - b.updatedAt.getTime();
        }
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
    }

    return legs;
  }

  async getLegsForMatch(matchId: string): Promise<Leg[]> {
    const table = await this.getTable();
    return await table.where("matchId").equals(matchId).toArray();
  }
}
