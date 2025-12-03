import { ref, readonly } from "vue";
import { MatchService } from "../database/MatchService";
import type { Match } from "../interfaces/match";
import { X01_GAME_PLAYED_IN } from "../interfaces/x01MatchConfig";

const matchService = new MatchService();
const { getSetsForMatch, deleteSet } = useSets();
const { getLegsForMatch, deleteLeg } = useLegs();

export function useMatches() {
  const matches = ref<Match[]>([]);
  const unfinishedMatches = ref<Match[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const loadMatches = async () => {
    try {
      loading.value = true;
      error.value = null;
      matches.value = await matchService.getAll();
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to load matches";
      console.error("Failed to load matches:", err);
    } finally {
      loading.value = false;
    }
  };

  const saveMatch = async (match: Match) => {
    try {
      loading.value = true;
      error.value = null;
      const savedMatch = await matchService.upsert(toRaw(match));

      // Update local state
      const index = matches.value.findIndex((m) => m.id === match.id);
      if (index > -1) {
        matches.value[index] = savedMatch;
      } else {
        matches.value.push(savedMatch);
      }

      return savedMatch;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to save match";
      console.error("Failed to save match:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getMatch = async (id: string) => {
    try {
      loading.value = true;
      error.value = null;
      return await matchService.get(id);
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to get match";
      console.error("Failed to get match:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteMatch = async (id: string) => {
    try {
      loading.value = true;
      error.value = null;

      // Get the match to check its game mode
      const match = await matchService.get(id);
      if (!match) {
        throw new Error("Match not found");
      }

      // First delete all related sets or legs (which will cascade to all related data)
      if (match.matchConfig.gamePlayedIn === X01_GAME_PLAYED_IN.sets) {
        const sets = await getSetsForMatch(id);
        for (const set of sets) {
          await deleteSet(set.id);
        }
      } else {
        const legs = await getLegsForMatch(id);
        for (const leg of legs) {
          await deleteLeg(leg.id);
        }
      }

      // Then delete the match itself
      await matchService.delete(id);

      // Remove from local state (both matches and unfinishedMatches)
      removeObjectById(matches.value, id);
      removeById(unfinishedMatches.value, id);
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to delete match";
      console.error("Failed to delete match:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const searchMatches = async (searchTerm: string) => {
    try {
      loading.value = true;
      error.value = null;
      return await matchService.search(searchTerm, ["gameType"]);
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to search matches";
      console.error("Failed to search matches:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getMatchesForPlayer = async (playerId: string) => {
    try {
      loading.value = true;
      error.value = null;
      return await matchService.getMatchesForPlayer(playerId);
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to get matches for player";
      console.error("Failed to get matches for player:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const loadLastFinishedMatches = async (limit: number = 10) => {
    matches.value = await matchService.getLastFinishedMatches(limit);
  };

  const loadUnfinishedMatches = async () => {
    unfinishedMatches.value = await matchService.getAllUnfinishedMatches();
  };

  return {
    matches: readonly(matches),
    unfinishedMatches: readonly(unfinishedMatches),
    loading: readonly(loading),
    error: readonly(error),
    loadMatches,
    saveMatch,
    getMatch,
    deleteMatch,
    searchMatches,
    getMatchesForPlayer,
    loadLastFinishedMatches,
    loadUnfinishedMatches,
  };
}
