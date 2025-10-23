import { ref, readonly } from "vue";
import { SingleDartScoreService } from "~/database/SingleDartScoreService";
import type { SingleDartScore } from "~/interfaces/leg";

const singleDartScoreService = new SingleDartScoreService();

export const useSingleDartScores = () => {
  const singleDartScores = ref<SingleDartScore[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const loadSingleDartScores = async () => {
    loading.value = true;
    error.value = null;
    try {
      singleDartScores.value = await singleDartScoreService.getAll();
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to load single dart scores";
      console.error("Error loading single dart scores:", err);
    } finally {
      loading.value = false;
    }
  };

  const saveSingleDartScore = async (
    singleDartScore: SingleDartScore
  ): Promise<SingleDartScore | null> => {
    loading.value = true;
    error.value = null;
    try {
      const savedSingleDartScore = await singleDartScoreService.upsert(
        singleDartScore
      );
      // Update local state
      const index = singleDartScores.value.findIndex(
        (sds) => sds.id === singleDartScore.id
      );
      if (index >= 0) {
        singleDartScores.value[index] = savedSingleDartScore;
      } else {
        singleDartScores.value.push(savedSingleDartScore);
      }
      return savedSingleDartScore;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to save single dart score";
      console.error("Error saving single dart score:", err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  const deleteSingleDartScore = async (id: string): Promise<boolean> => {
    loading.value = true;
    error.value = null;
    try {
      await singleDartScoreService.delete(id);
      singleDartScores.value = singleDartScores.value.filter(
        (singleDartScore) => singleDartScore.id !== id
      );
      return true;
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to delete single dart score";
      console.error("Error deleting single dart score:", err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const getSingleDartScoresForScore = async (
    scoreId: string
  ): Promise<SingleDartScore[]> => {
    loading.value = true;
    error.value = null;
    try {
      const scoreSingleDartScores =
        await singleDartScoreService.getSingleDartScoresForScore(scoreId);
      return scoreSingleDartScores;
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to load single dart scores for score";
      console.error("Error loading single dart scores for score:", err);
      return [];
    } finally {
      loading.value = false;
    }
  };

  const getSingleDartScoresForPlayer = async (
    playerId: string
  ): Promise<SingleDartScore[]> => {
    loading.value = true;
    error.value = null;
    try {
      const playerSingleDartScores =
        await singleDartScoreService.getSingleDartScoresForPlayer(playerId);
      return playerSingleDartScores;
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to load single dart scores for player";
      console.error("Error loading single dart scores for player:", err);
      return [];
    } finally {
      loading.value = false;
    }
  };

  return {
    singleDartScores: readonly(singleDartScores),
    loading: readonly(loading),
    error: readonly(error),
    loadSingleDartScores,
    saveSingleDartScore,
    deleteSingleDartScore,
    getSingleDartScoresForScore,
    getSingleDartScoresForPlayer,
  };
};
