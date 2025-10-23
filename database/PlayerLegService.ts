import { BaseService } from "./BaseService";
import type { PlayerLeg } from "~/interfaces/leg";

export class PlayerLegService extends BaseService<PlayerLeg> {
  protected getTableName(): string {
    return "playerLegs";
  }

  async getPlayerLegsForLeg(legId: string): Promise<PlayerLeg[]> {
    const table = await this.getTable();
    return await table.where("legId").equals(legId).toArray();
  }

  async getPlayerLegsForPlayer(playerId: string): Promise<PlayerLeg[]> {
    const table = await this.getTable();
    return await table.where("playerId").equals(playerId).toArray();
  }
}
