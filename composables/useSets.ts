import { ref, readonly, toRaw } from "vue";
import { SetService } from "~/database/SetService";
import type { Set } from "~/interfaces/set";
import type { Leg } from "~/interfaces/leg";

const setService = new SetService();
const { getLegsForSet, deleteLeg } = useLegs();
const { getPlayerStatsForSet, deletePlayerStats } = usePlayerStats();

export const useSets = () => {
  const sets = ref<Set[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const loadSets = async () => {
    loading.value = true;
    error.value = null;
    try {
      sets.value = await setService.getAll();
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to load sets";
      console.error("Error loading sets:", err);
    } finally {
      loading.value = false;
    }
  };

  const saveSet = async (set: Set): Promise<Set | null> => {
    loading.value = true;
    error.value = null;
    try {
      // Convert reactive proxy to plain object for IndexedDB
      const savedSet = await setService.upsert(toRaw(set));
      // Update local state
      const index = sets.value.findIndex((s) => s.id === set.id);
      if (index >= 0) {
        sets.value[index] = savedSet;
      } else {
        sets.value.push(savedSet);
      }
      return savedSet;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to save set";
      console.error("Error saving set:", err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  const deleteSet = async (id: string): Promise<boolean> => {
    loading.value = true;
    error.value = null;
    try {
      // First delete all related legs (which will also delete their player legs, scores, and single dart scores)
      const legs = await getLegsForSet(id);
      for (const leg of legs) {
        await deleteLeg(leg.id);
      }

      // Delete all playerStats for this set
      const setPlayerStats = await getPlayerStatsForSet(id);
      for (const playerStat of setPlayerStats) {
        await deletePlayerStats(playerStat.id);
      }

      // Then delete the set itself
      await setService.delete(id);
      removeObjectById(sets.value, id);
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to delete set";
      console.error("Error deleting set:", err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const getSetsForMatch = async (
    matchId: string,
    sortOrder?: string[]
  ): Promise<Set[]> => {
    loading.value = true;
    error.value = null;
    try {
      const matchSets = await setService.getSetsForMatch(matchId, sortOrder);
      return matchSets;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to load sets for match";
      console.error("Error loading sets for match:", err);
      return [];
    } finally {
      loading.value = false;
    }
  };

  const entityGamesWonByPlayer = (
    entity: Set[] | Leg[],
    playerId: string
  ): number => {
    const f = entity.filter((game) => game.winner === playerId).length;

    return f;
  };

  return {
    sets: readonly(sets),
    loading: readonly(loading),
    error: readonly(error),
    loadSets,
    saveSet,
    deleteSet,
    getSetsForMatch,
    entityGamesWonByPlayer,
  };
};
