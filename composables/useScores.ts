import { ref, readonly } from "vue";
import { ScoreService } from "~/database/ScoreService";
import type { Score } from "~/interfaces/leg";

const scoreService = new ScoreService();

const { getSingleDartScoresForScore, deleteSingleDartScore } =
  useSingleDartScores();

export const useScores = () => {
  const scores = ref<Score[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const loadScores = async () => {
    loading.value = true;
    error.value = null;
    try {
      scores.value = await scoreService.getAll();
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to load scores";
      console.error("Error loading scores:", err);
    } finally {
      loading.value = false;
    }
  };

  const saveScore = async (score: Score): Promise<Score | null> => {
    loading.value = true;
    error.value = null;

    try {
      const savedScore = await scoreService.upsert(toRaw(score));
      // Update local state
      const index = scores.value.findIndex((s) => s.id === score.id);
      if (index >= 0) {
        scores.value[index] = savedScore;
      } else {
        scores.value.push(savedScore);
      }
      return savedScore;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to save score";
      console.error("Error saving score:", err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  const deleteScore = async (id: string): Promise<boolean> => {
    loading.value = true;
    error.value = null;
    try {
      // First delete all related single dart scores
      const singleDartScores = await getSingleDartScoresForScore(id);
      for (const singleDartScore of singleDartScores) {
        await deleteSingleDartScore(singleDartScore.id);
      }

      // Then delete the score itself
      await scoreService.delete(id);
      removeObjectById(scores.value, id);
      return true;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to delete score";
      console.error("Error deleting score:", err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const getScoresForPlayerLeg = async (
    playerLegId: string
  ): Promise<Score[]> => {
    loading.value = true;
    error.value = null;
    try {
      const playerLegScores = await scoreService.getScoresForPlayerLeg(
        playerLegId
      );

      return playerLegScores;
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to load scores for player leg";
      console.error("Error loading scores for player leg:", err);
      return [];
    } finally {
      loading.value = false;
    }
  };

  const getScoresForPlayer = async (playerId: string): Promise<Score[]> => {
    loading.value = true;
    error.value = null;
    try {
      const playerScores = await scoreService.getScoresForPlayer(playerId);
      return playerScores;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to load scores for player";
      console.error("Error loading scores for player:", err);
      return [];
    } finally {
      loading.value = false;
    }
  };

  const getScoresForMatch = async (matchId: string): Promise<Score[]> => {
    loading.value = true;
    error.value = null;
    try {
      const matchScores = await scoreService.getScoresForMatch(matchId);
      return matchScores;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to load scores for match";
      console.error("Error loading scores for match:", err);
      return [];
    } finally {
      loading.value = false;
    }
  };

  const getScoresForSet = async (setId: string): Promise<Score[]> => {
    loading.value = true;
    error.value = null;
    try {
      const setScores = await scoreService.getScoresForSet(setId);
      return setScores;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to load scores for set";
      console.error("Error loading scores for set:", err);
      return [];
    } finally {
      loading.value = false;
    }
  };

  return {
    scores: readonly(scores),
    loading: readonly(loading),
    error: readonly(error),
    loadScores,
    saveScore,
    deleteScore,
    getScoresForPlayerLeg,
    getScoresForPlayer,
    getScoresForMatch,
    getScoresForSet,
  };
};
