import { toRaw } from "vue";
import type {
  Competition,
  CompetitionConfig,
  CompetitionEdition,
} from "../interfaces/competition";

/** Plain copy safe for IndexedDB (no Vue reactive proxies). */
export function cloneCompetitionConfig(
  config: CompetitionConfig
): CompetitionConfig {
  const raw = toRaw(config);
  return {
    amountMatches: raw.amountMatches,
    gameType: raw.gameType,
    matchConfig: raw.matchConfig
      ? { ...toRaw(raw.matchConfig) }
      : undefined,
  };
}

export function cloneCompetitionEdition(
  edition: CompetitionEdition
): CompetitionEdition {
  const raw = toRaw(edition);
  return {
    id: raw.id,
    competitionId: raw.competitionId,
    editionNumber: raw.editionNumber,
    createdAt: raw.createdAt,
    updatedAt: new Date(),
    playerIds: [...toRaw(raw.playerIds)],
    matches: [...toRaw(raw.matches)],
    playerStats: [...toRaw(raw.playerStats)],
    winner: raw.winner,
    competitionConfig: cloneCompetitionConfig(raw.competitionConfig),
  };
}

export function cloneCompetition(competition: Competition): Competition {
  const raw = toRaw(competition);
  return {
    id: raw.id,
    createdAt: raw.createdAt,
    updatedAt: new Date(),
    competitionType: raw.competitionType,
    name: raw.name,
    defaultCompetitionConfig: raw.defaultCompetitionConfig
      ? cloneCompetitionConfig(raw.defaultCompetitionConfig)
      : undefined,
  };
}
