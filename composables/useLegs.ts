import { ref, readonly } from "vue";
import { LegService } from "~/database/LegService";
import type { Leg } from "~/interfaces/leg";

const legService = new LegService();

export const useLegs = () => {
  const legs = ref<Leg[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const loadLegs = async () => {
    loading.value = true;
    error.value = null;
    try {
      legs.value = await legService.getAll();
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to load legs";
      console.error("Error loading legs:", err);
    } finally {
      loading.value = false;
    }
  };

  const saveLeg = async (leg: Leg): Promise<Leg | null> => {
    loading.value = true;
    error.value = null;
    try {
      const savedLeg = await legService.upsert(leg);
      // Update local state
      const index = legs.value.findIndex((l) => l.id === leg.id);
      if (index >= 0) {
        legs.value[index] = savedLeg;
      } else {
        legs.value.push(savedLeg);
      }
      return savedLeg;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to save leg";
      console.error("Error saving leg:", err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  const deleteLeg = async (id: string): Promise<boolean> => {
    loading.value = true;
    error.value = null;
    try {
      await legService.delete(id);
      legs.value = legs.value.filter((leg) => leg.id !== id);
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to delete leg";
      console.error("Error deleting leg:", err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const getLegsForSet = async (setId: string): Promise<Leg[]> => {
    loading.value = true;
    error.value = null;
    try {
      const setLegs = await legService.getLegsForSet(setId);
      return setLegs;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to load legs for set";
      console.error("Error loading legs for set:", err);
      return [];
    } finally {
      loading.value = false;
    }
  };

  const getLegsForMatch = async (matchId: string): Promise<Leg[]> => {
    loading.value = true;
    error.value = null;
    try {
      const matchLegs = await legService.getLegsForMatch(matchId);
      return matchLegs;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to load legs for match";
      console.error("Error loading legs for match:", err);
      return [];
    } finally {
      loading.value = false;
    }
  };

  return {
    legs: readonly(legs),
    loading: readonly(loading),
    error: readonly(error),
    loadLegs,
    saveLeg,
    deleteLeg,
    getLegsForSet,
    getLegsForMatch,
  };
};
