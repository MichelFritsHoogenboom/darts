import { ref, readonly } from "vue";
import { CompetitionEditionService } from "../database/CompetitionEditionService";
import { CompetitionService } from "../database/CompetitionService";
import { MatchService } from "../database/MatchService";
import type {
  Competition,
  CompetitionEdition,
} from "../interfaces/competition";
import { createCompetitionEdition } from "../interfaces/competition";
import { createMatch } from "../interfaces/match";
import { GAME_TYPES } from "../constants/match";
import { defaultX01MatchConfig } from "../interfaces/x01MatchConfig";
import type { PlayerStats } from "../interfaces/stats";
import { routes } from "../utils/routes";
import {
  createPlayerStats,
  createEditionPlayerStats,
} from "../interfaces/stats";
import { getEditionMatchWinner, isEditionComplete } from "../utils/rivalry";
import { getPlayerIdsFromStats } from "../utils/player";
import {
  buildEditionPlayerStatMetrics,
  tallyCamelMatchWins,
  sumCamelCountsByPlayer,
  camelSeasonWinnerId,
} from "../utils/editionPlayerStats";
import {
  buildBestAverages,
} from "../utils/averages";
import type { BestAverages } from "../interfaces/stats";
import type { Match } from "../interfaces/match";
import type { Score } from "../interfaces/leg";
import type { x01MatchConfig } from "../interfaces/x01MatchConfig";
import { X01_GAME_PLAYED_IN } from "../interfaces/x01MatchConfig";
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
  const { getPlayerStatsForCompetitionEdition } = usePlayerStats();
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
    playerId2: string,
  ) => {
    return await editionService.findHead2HeadCompetitionForPair(
      playerId1,
      playerId2,
    );
  };

  const loadEditionPlayerStatsRecords = async (
    edition: CompetitionEdition,
  ): Promise<PlayerStats[]> => {
    const stats = await getPlayerStatsForCompetitionEdition(edition.id);
    const byId = new Map(stats.map((stat) => [stat.id, stat]));
    return edition.playerStats
      .map((statsId) => byId.get(statsId))
      .filter((stat): stat is PlayerStats => stat !== undefined);
  };

  const startNewEdition = async (
    competitionId: string,
    previousEdition: CompetitionEdition,
  ): Promise<CompetitionEdition> => {
    const editions =
      await editionService.getEditionsForCompetition(competitionId);
    const maxNumber = editions.reduce(
      (max, e) => Math.max(max, e.editionNumber),
      0,
    );

    const previousStats = await loadEditionPlayerStatsRecords(previousEdition);
    const playerIds = getPlayerIdsFromStats(previousStats);

    const edition = createCompetitionEdition({
      competitionId,
      editionNumber: maxNumber + 1,
      competitionConfig: { ...previousEdition.competitionConfig },
    });

    edition.playerStats = await createEditionPlayerStats(edition.id, playerIds);

    return await saveEdition(edition);
  };

  const createH2HMatch = async (
    edition: CompetitionEdition,
    competition: Competition,
    matchConfigOverride?: x01MatchConfig,
  ): Promise<Match> => {
    const config = cloneCompetitionConfig(toRaw(edition).competitionConfig);
    const matchConfig =
      matchConfigOverride ?? config.matchConfig ?? defaultX01MatchConfig;

    const gameType = config.gameType ?? GAME_TYPES.x01;

    const match = createMatch({
      gameType,
      matchConfig: { ...matchConfig },
      competitionEditionId: edition.id,
    });

    const editionStats = await loadEditionPlayerStatsRecords(edition);
    match.playerStats = await Promise.all(
      editionStats.map(async (stat) => {
        const matchStats = await createPlayerStats({
          playerId: stat.playerId,
          matchId: match.id,
        });
        return matchStats.id;
      }),
    );

    const { saveMatch } = useMatches();
    const savedMatch = await saveMatch(toRaw(match));

    const updatedEdition = cloneCompetitionEdition(edition);
    updatedEdition.matches = [...updatedEdition.matches, savedMatch.id];
    await saveEdition(updatedEdition);

    await competitionService.upsert(cloneCompetition(competition));

    return savedMatch;
  };

  const updateEditionPlayerStats = async (
    edition: CompetitionEdition,
    matches: Match[],
  ): Promise<void> => {
    const { getPlayerStatsById, getPlayerStatsForMatch, savePlayerStats } =
      usePlayerStats();
    const { getScoresForMatch } = useScores();

    const editionMatchIds = new Set(edition.matches);
    const finishedMatches = matches.filter(
      (match) => editionMatchIds.has(match.id) && !!match.winner,
    );

    for (const statsId of edition.playerStats) {
      const stat = await getPlayerStatsById(statsId);
      if (!stat) continue;

      const playerId = stat.playerId;
      const allScores: Score[] = [];
      const matchStatsForPlayer: PlayerStats[] = [];

      for (const match of finishedMatches) {
        const [scores, matchStats] = await Promise.all([
          getScoresForMatch(match.id),
          getPlayerStatsForMatch(match.id),
        ]);

        allScores.push(
          ...scores.filter((score) => score.playerId === playerId),
        );

        const playerMatchStats = matchStats.find(
          (matchStat) => matchStat.playerId === playerId,
        );
        if (playerMatchStats) {
          matchStatsForPlayer.push(playerMatchStats);
        }
      }

      Object.assign(
        stat,
        buildEditionPlayerStatMetrics({
          scores: allScores,
          matchStats: matchStatsForPlayer,
        }),
      );
      await savePlayerStats(stat);
    }
  };

  const queryEditionBestAverages = async (
    playerId: string,
    matches: Match[],
  ): Promise<BestAverages> => {
    const {
      getPlayerStatsForMatch,
      getPlayerStatsForSet,
      getPlayerStatsByPlayerLegId,
    } = usePlayerStats();
    const { getLegsForMatch } = useLegs();
    const { getSetsForMatch } = useSets();
    const { getPlayerLegsForLeg } = usePlayerLegs();

    const finishedMatches = matches.filter((match) => !!match.winner);
    const wonLegAverages: number[] = [];
    const wonSetAverages: number[] = [];
    const matchAverages: number[] = [];

    for (const match of finishedMatches) {
      const matchStats = await getPlayerStatsForMatch(match.id);
      const playerMatchStats = matchStats.find(
        (matchStat) => matchStat.playerId === playerId,
      );
      if (playerMatchStats) {
        matchAverages.push(playerMatchStats.average);
      }

      const legs = await getLegsForMatch(match.id);
      for (const leg of legs.filter((l) => l.winner === playerId)) {
        const playerLegs = await getPlayerLegsForLeg(leg.id);
        const playerLeg = playerLegs.find((pl) => pl.playerId === playerId);
        if (!playerLeg) continue;
        const legStats = await getPlayerStatsByPlayerLegId(playerLeg.id);
        if (legStats) wonLegAverages.push(legStats.average);
      }

      if (match.matchConfig.gamePlayedIn === X01_GAME_PLAYED_IN.sets) {
        const sets = await getSetsForMatch(match.id);
        for (const set of sets.filter((s) => s.winner === playerId)) {
          const setStats = await getPlayerStatsForSet(set.id);
          const playerSetStats = setStats.find(
            (setStat) => setStat.playerId === playerId,
          );
          if (playerSetStats) wonSetAverages.push(playerSetStats.average);
        }
      }
    }

    return buildBestAverages({
      wonLegAverages,
      ...(wonSetAverages.length ? { wonSetAverages } : {}),
      matchAverages,
    });
  };

  const collectMatchCamelCounts = async (
    playerIds: string[],
    matches: Match[],
  ): Promise<Array<Record<string, number>>> => {
    const { getPlayerStatsForMatch } = usePlayerStats();
    const finishedMatches = matches.filter((match) => !!match.winner);
    const matchCamelCounts: Array<Record<string, number>> = [];

    for (const match of finishedMatches) {
      const matchStats = await getPlayerStatsForMatch(match.id);
      const counts: Record<string, number> = {};
      for (const playerId of playerIds) {
        const playerMatchStats = matchStats.find(
          (stat) => stat.playerId === playerId,
        );
        counts[playerId] = playerMatchStats?.scores.goldenCamel ?? 0;
      }
      matchCamelCounts.push(counts);
    }

    return matchCamelCounts;
  };

  const queryEditionCamelMatchWins = async (
    playerIds: string[],
    matches: Match[],
  ): Promise<Record<string, number>> => {
    const matchCamelCounts = await collectMatchCamelCounts(playerIds, matches);
    return Object.fromEntries(
      playerIds.map((playerId) => [
        playerId,
        tallyCamelMatchWins(playerId, matchCamelCounts),
      ]),
    );
  };

  const queryRivalryCamelSeasonWins = async (
    playerIds: string[],
    competitionEditions: CompetitionEdition[],
  ): Promise<Record<string, number>> => {
    const wins = Object.fromEntries(playerIds.map((id) => [id, 0]));

    for (const competitionEdition of competitionEditions) {
      if (!competitionEdition.winner) continue;

      const editionMatches =
        await matchService.getMatchesForCompetitionEdition(competitionEdition);
      const matchCamelCounts = await collectMatchCamelCounts(
        playerIds,
        editionMatches,
      );
      const camelMatchWins = Object.fromEntries(
        playerIds.map((playerId) => [
          playerId,
          tallyCamelMatchWins(playerId, matchCamelCounts),
        ]),
      );
      const seasonCamelTotals = sumCamelCountsByPlayer(matchCamelCounts);
      const winnerId = camelSeasonWinnerId(
        playerIds,
        camelMatchWins,
        seasonCamelTotals,
      );
      if (winnerId) wins[winnerId] += 1;
    }

    return wins;
  };

  const loadEditionPlayerStats = async (
    edition: CompetitionEdition,
    matches: Match[],
  ): Promise<PlayerStats[]> => {
    await updateEditionPlayerStats(edition, matches);
    return loadEditionPlayerStatsRecords(edition);
  };

  const getEdition = async (editionId: string) => {
    return await editionService.get(editionId);
  };

  const getEditionSetupPath = async (editionId: string) => {
    const edition = await getEdition(editionId);
    if (!edition) return undefined;

    return routes.head2head.setup(edition.competitionId);
  };

  const removeMatchFromEdition = async (match: Match) => {
    if (!match.competitionEditionId) return;

    const edition = await getEdition(match.competitionEditionId);
    if (!edition) return;

    const updatedEdition = cloneCompetitionEdition(edition);
    updatedEdition.matches = updatedEdition.matches.filter(
      (id) => id !== match.id,
    );
    await saveEdition(updatedEdition);
  };

  const onEditionMatchFinished = async (
    match: Match,
  ): Promise<{
    editionComplete: boolean;
    competitionId?: string;
    editionNumber?: number;
  }> => {
    if (!match.competitionEditionId) {
      return { editionComplete: false };
    }

    const edition = await getEdition(match.competitionEditionId);
    if (!edition) return { editionComplete: false };

    const competition = await competitionService.get(edition.competitionId);
    if (!competition) return { editionComplete: false };

    const matches = await matchService.getMatchesForCompetitionEdition(edition);
    const editionStats = await loadEditionPlayerStatsRecords(edition);
    const playerIds = getPlayerIdsFromStats(editionStats);

    const editionToSave = cloneCompetitionEdition(edition);
    if (isEditionComplete(editionToSave, matches) && !editionToSave.winner) {
      const championId = getEditionMatchWinner(
        editionToSave,
        matches,
        playerIds,
      );
      if (championId) {
        editionToSave.winner = championId;
      }
    }

    const savedEdition = await saveEdition(editionToSave);
    await updateEditionPlayerStats(savedEdition, matches);
    await competitionService.upsert(cloneCompetition(competition));

    return {
      editionComplete: !!editionToSave.winner,
      competitionId: editionToSave.competitionId,
      editionNumber: editionToSave.editionNumber,
    };
  };

  return {
    loading: readonly(loading),
    error: readonly(error),
    saveEdition,
    getEditionSetupPath,
    removeMatchFromEdition,
    getEditionsForCompetition,
    getCurrentEdition,
    findHead2HeadCompetitionForPair,
    startNewEdition,
    createH2HMatch,
    loadEditionPlayerStats,
    queryEditionBestAverages,
    queryEditionCamelMatchWins,
    queryRivalryCamelSeasonWins,
    onEditionMatchFinished,
  };
}
