import { ref, readonly } from "vue";
import { SetService } from "~/database/SetService";
import type { Set } from "~/interfaces/set";

const setService = new SetService();

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
      const savedSet = await setService.upsert(set);
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
      await setService.delete(id);
      sets.value = sets.value.filter((set) => set.id !== id);
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to delete set";
      console.error("Error deleting set:", err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const getSetsForMatch = async (matchId: string): Promise<Set[]> => {
    loading.value = true;
    error.value = null;
    try {
      const matchSets = await setService.getSetsForMatch(matchId);
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

  return {
    sets: readonly(sets),
    loading: readonly(loading),
    error: readonly(error),
    loadSets,
    saveSet,
    deleteSet,
    getSetsForMatch,
  };
};
