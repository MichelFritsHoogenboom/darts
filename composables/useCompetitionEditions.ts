import { ref, readonly } from "vue";
import { CompetitionEditionService } from "../database/CompetitionEditionService";
import { CompetitionService } from "../database/CompetitionService";
import { MatchService } from "../database/MatchService";
import type { Competition, CompetitionEdition } from "../interfaces/competition";
import {
  createCompetitionEdition,
} from "../interfaces/competition";
import { createMatch, GAME_TYPES } from "../interfaces/match";
import { defaultX01MatchConfig } from "../interfaces/x01MatchConfig";
import type { PlayerStats } from "../interfaces/stats";
import { createPlayerStats } from "../interfaces/stats";
import {
  getEditionMatchWinner,
  isEditionComplete,
  sortPlayerIds,
} from "../utils/rivalry";
import { calculateThreeDartAverage } from "../utils/averages";
import type { Match } from "../interfaces/match";
import type { x01MatchConfig } from "../interfaces/x01MatchConfig";
import { toRaw } from "vue";
import {
  cloneCompetition,
  cloneCompetitionConfig,
  cloneCompetitionEdition,
} from "../utils/competition";

const editionService = new CompetitionEditionService();
const competitionService = new CompetitionService();
const matchService = new MatchService();

export function useCompetitionEditions() {
  const loading = ref(false);
  const error = ref<string | null>(null);

  const saveEdition = async (edition: CompetitionEdition) => {
    loading.value = true;
    error.value = null;
    try {
      return await editionService.upsert(cloneCompetitionEdition(edition));
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to save edition";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getEditionsForCompetition = async (competitionId: string) => {
    return await editionService.getEditionsForCompetition(competitionId);
  };

  const getCurrentEdition = async (competitionId: string) => {
    return await editionService.getCurrentEdition(competitionId);
  };

  const findHead2HeadCompetitionForPair = async (
    playerId1: string,
    playerId2: string
  ) => {
    return await editionService.findHead2HeadCompetitionForPair(
      playerId1,
      playerId2
    );
  };

  const startNewEdition = async (
    competitionId: string,
    previousEdition: CompetitionEdition
  ): Promise<CompetitionEdition> => {
    const editions = await editionService.getEditionsForCompetition(
      competitionId
    );
    const maxNumber = editions.reduce(
      (max, e) => Math.max(max, e.editionNumber),
      0
    );

    const edition = createCompetitionEdition({
      competitionId,
      editionNumber: maxNumber + 1,
      playerIds: [...previousEdition.playerIds],
      competitionConfig: { ...previousEdition.competitionConfig },
    });

    return await saveEdition(edition);
  };

  const createH2HMatch = async (
    edition: CompetitionEdition,
    competition: Competition,
    matchConfigOverride?: x01MatchConfig
  ): Promise<Match> => {
    const config = cloneCompetitionConfig(
      toRaw(edition).competitionConfig
    );
    const matchConfig =
      matchConfigOverride ??
      config.matchConfig ??
      defaultX01MatchConfig;

    const gameType = config.gameType ?? GAME_TYPES.x01;

    const match = createMatch({
      gameType,
      matchConfig: { ...matchConfig },
      competitionEditionId: edition.id,
    });

    match.playerStats = await Promise.all(
      edition.playerIds.map(async (playerId) => {
        const stats = await createPlayerStats({
          playerId,
          matchId: match.id,
        });
        return stats.id;
      })
    );

    const { saveMatch } = useMatches();
    const savedMatch = await saveMatch(toRaw(match));

    const updatedEdition = cloneCompetitionEdition(edition);
    updatedEdition.matches = [...updatedEdition.matches, savedMatch.id];
    await saveEdition(updatedEdition);

    await competitionService.upsert(cloneCompetition(competition));

    return savedMatch;
  };

  const ensureEditionPlayerStats = async (
    edition: CompetitionEdition,
  ): Promise<CompetitionEdition> => {
    if (edition.playerStats.length >= edition.playerIds.length) {
      return edition;
    }

    const editionToSave = cloneCompetitionEdition(edition);
    const statsIds = await Promise.all(
      edition.playerIds.map((playerId) =>
        createPlayerStats({ playerId }).then((stats) => stats.id),
      ),
    );
    editionToSave.playerStats = statsIds;
    return await saveEdition(editionToSave);
  };

  const updateEditionPlayerStatsAverages = async (
    edition: CompetitionEdition,
    matches: Match[],
  ): Promise<void> => {
    const { getPlayerStatsById, savePlayerStats } = usePlayerStats();
    const { getScoresForMatch } = useScores();
    const editionMatchIds = new Set(edition.matches);

    for (const statsId of edition.playerStats) {
      const stat = await getPlayerStatsById(statsId);
      if (!stat) continue;

      const allScores = (
        await Promise.all(
          matches
            .filter((match) => editionMatchIds.has(match.id))
            .map((match) => getScoresForMatch(match.id)),
        )
      )
        .flat()
        .filter((score) => score.playerId === stat.playerId);

      stat.average = calculateThreeDartAverage(allScores);
      await savePlayerStats(stat);
    }
  };

  const loadEditionPlayerStats = async (
    edition: CompetitionEdition,
    matches: Match[],
  ): Promise<PlayerStats[]> => {
    const editionWithStats = await ensureEditionPlayerStats(edition);
    await updateEditionPlayerStatsAverages(editionWithStats, matches);

    const { getPlayerStatsById } = usePlayerStats();
    return (
      await Promise.all(
        editionWithStats.playerStats.map((statsId) =>
          getPlayerStatsById(statsId),
        ),
      )
    ).filter((stat): stat is PlayerStats => stat !== undefined);
  };

  const onEditionMatchFinished = async (match: Match): Promise<{
    editionComplete: boolean;
    competitionId?: string;
  }> => {
    if (!match.competitionEditionId) {
      return { editionComplete: false };
    }

    const edition = await editionService.get(match.competitionEditionId);
    if (!edition) return { editionComplete: false };

    const competition = await competitionService.get(edition.competitionId);
    if (!competition) return { editionComplete: false };

    const matches = await matchService.getMatchesForCompetitionEdition(edition);

    const editionToSave = cloneCompetitionEdition(edition);
    if (isEditionComplete(editionToSave, matches) && !editionToSave.winner) {
      const championId = getEditionMatchWinner(editionToSave, matches);
      if (championId) {
        editionToSave.winner = championId;
      }
    }

    const savedEdition = await saveEdition(editionToSave);
    const editionWithStats = await ensureEditionPlayerStats(savedEdition);
    await updateEditionPlayerStatsAverages(editionWithStats, matches);
    await competitionService.upsert(cloneCompetition(competition));

    return {
      editionComplete: !!editionToSave.winner,
      competitionId: editionToSave.competitionId,
    };
  };

  return {
    loading: readonly(loading),
    error: readonly(error),
    saveEdition,
    getEditionsForCompetition,
    getCurrentEdition,
    findHead2HeadCompetitionForPair,
    startNewEdition,
    createH2HMatch,
    loadEditionPlayerStats,
    onEditionMatchFinished,
  };
}
