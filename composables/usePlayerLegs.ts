import { ref, readonly } from "vue";
import { PlayerLegService } from "~/database/PlayerLegService";
import type { PlayerLeg } from "~/interfaces/leg";

const playerLegService = new PlayerLegService();
const { getScoresForPlayerLeg, deleteScore } = useScores();

export const usePlayerLegs = () => {
  const playerLegs = ref<PlayerLeg[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const loadPlayerLegs = async () => {
    loading.value = true;
    error.value = null;
    try {
      playerLegs.value = await playerLegService.getAll();
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to load player legs";
      console.error("Error loading player legs:", err);
    } finally {
      loading.value = false;
    }
  };

  const savePlayerLeg = async (
    playerLeg: PlayerLeg
  ): Promise<PlayerLeg | null> => {
    loading.value = true;
    error.value = null;

    try {
      const savedPlayerLeg = await playerLegService.upsert(toRaw(playerLeg));
      // Update local state
      const index = playerLegs.value.findIndex((pl) => pl.id === playerLeg.id);
      if (index >= 0) {
        playerLegs.value[index] = savedPlayerLeg;
      } else {
        playerLegs.value.push(savedPlayerLeg);
      }
      return savedPlayerLeg;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to save player leg";
      console.error("Error saving player leg:", err, playerLeg);
      return null;
    } finally {
      loading.value = false;
    }
  };

  const deletePlayerLeg = async (id: string): Promise<boolean> => {
    loading.value = true;
    error.value = null;
    try {
      // First delete all related scores (which will also delete related single dart scores)
      const scores = await getScoresForPlayerLeg(id);
      for (const score of scores) {
        await deleteScore(score.id);
      }

      // Then delete the player leg itself
      await playerLegService.delete(id);
      removeObjectById(playerLegs.value, id);
      return true;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to delete player leg";
      console.error("Error deleting player leg:", err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const getPlayerLegsForLeg = async (legId: string): Promise<PlayerLeg[]> => {
    loading.value = true;
    error.value = null;
    try {
      const legPlayerLegs = await playerLegService.getPlayerLegsForLeg(legId);
      return legPlayerLegs;
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to load player legs for leg";
      console.error("Error loading player legs for leg:", err);
      return [];
    } finally {
      loading.value = false;
    }
  };

  const getPlayerLegsForPlayer = async (
    playerId: string
  ): Promise<PlayerLeg[]> => {
    loading.value = true;
    error.value = null;
    try {
      const playerPlayerLegs = await playerLegService.getPlayerLegsForPlayer(
        playerId
      );
      return playerPlayerLegs;
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to load player legs for player";
      console.error("Error loading player legs for player:", err);
      return [];
    } finally {
      loading.value = false;
    }
  };

  const calculateAndUpdatePlayerLegAverage = async (
    playerLeg: PlayerLeg
  ): Promise<void> => {
    // Get all scores for this playerleg
    const scores = await getScoresForPlayerLeg(playerLeg.id);

    if (scores.length === 0) {
      // No scores, average remains 0
      return;
    }

    // Sum up all totalScores
    const totalScoreSum = scores.reduce(
      (sum, score) => sum + score.totalScore,
      0
    );

    // Calculate average: sum / (number of scores * 3 darts per score)
    // This gives average per dart
    const average = totalScoreSum / scores.length;

    // Update playerleg.stats.average
    playerLeg.stats.average = average;

    // Save the updated playerleg
    await savePlayerLeg(playerLeg);
  };

  const calculateAndUpdatePlayerLegAverages = async (
    legId: string
  ): Promise<void> => {
    loading.value = true;
    error.value = null;
    try {
      // Get all playerlegs for the leg
      const playerLegs = await getPlayerLegsForLeg(legId);

      // Loop over each playerleg and calculate/update average
      for (const playerLeg of playerLegs) {
        await calculateAndUpdatePlayerLegAverage(playerLeg);
      }
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to calculate and update player leg averages";
      console.error("Error calculating player leg averages:", err);
    } finally {
      loading.value = false;
    }
  };

  return {
    playerLegs: readonly(playerLegs),
    loading: readonly(loading),
    error: readonly(error),
    loadPlayerLegs,
    savePlayerLeg,
    deletePlayerLeg,
    getPlayerLegsForLeg,
    getPlayerLegsForPlayer,
    calculateAndUpdatePlayerLegAverage,
    calculateAndUpdatePlayerLegAverages,
  };
};
