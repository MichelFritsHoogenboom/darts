import { BaseService } from "./BaseService";
import type {
  Competition,
  CompetitionEdition,
} from "../interfaces/competition";
import { COMPETITION_TYPES } from "../interfaces/competition";
import { CompetitionService } from "./CompetitionService";
import { PlayerStatsService } from "./PlayerStatsService";
import {
  sortPlayerIds,
  playerIdsMatch,
} from "../utils/rivalry";
import { getPlayerIdsFromStats } from "../utils/player";

const competitionService = new CompetitionService();
const playerStatsService = new PlayerStatsService();

export class CompetitionEditionService extends BaseService<CompetitionEdition> {
  protected getTableName(): string {
    return "competitionEditions";
  }

  async getEditionsForCompetition(
    competitionId: string
  ): Promise<CompetitionEdition[]> {
    const table = await this.getTable();
    return await table
      .where("competitionId")
      .equals(competitionId)
      .sortBy("editionNumber");
  }

  async getCurrentEdition(
    competitionId: string
  ): Promise<CompetitionEdition | undefined> {
    const editions = await this.getEditionsForCompetition(competitionId);
    if (editions.length === 0) return undefined;

    const active = editions.filter((e) => !e.winner);
    if (active.length > 0) {
      return active.reduce((latest, e) =>
        e.editionNumber > latest.editionNumber ? e : latest
      );
    }

    return editions.reduce((latest, e) =>
      e.editionNumber > latest.editionNumber ? e : latest
    );
  }

  async findHead2HeadCompetitionForPair(
    playerId1: string,
    playerId2: string
  ): Promise<Competition | undefined> {
    const sorted = sortPlayerIds([playerId1, playerId2]);
    const statsForPlayer = await playerStatsService.getPlayerStatsForPlayer(
      sorted[0],
    );
    const editionStats = statsForPlayer.filter(
      (stat) => stat.competitionEditionId && !stat.matchId,
    );

    for (const stat of editionStats) {
      const edition = await this.get(stat.competitionEditionId!);
      if (!edition) continue;

      const editionPlayerStats =
        await playerStatsService.getPlayerStatsForCompetitionEdition(edition.id);
      const editionPlayerIds = getPlayerIdsFromStats(editionPlayerStats);
      if (!playerIdsMatch(editionPlayerIds, sorted)) continue;

      const competition = await competitionService.get(edition.competitionId);
      if (
        !competition ||
        competition.competitionType !== COMPETITION_TYPES.head2head
      ) {
        continue;
      }

      return competition;
    }

    return undefined;
  }
}
