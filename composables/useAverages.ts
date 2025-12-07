import type { PlayerStats } from "~/interfaces/stats";
import type { PlayerLeg } from "~/interfaces/leg";

const { getScoresForMatch, getScoresForPlayerLeg } = useScores();
const { getPlayerStatsForMatch, savePlayerStats, getPlayerStatsByPlayerLegId } =
  usePlayerStats();
const { getPlayerLegsForLeg } = usePlayerLegs();

export const useAverages = () => {
  const loading = ref(false);
  const error = ref<string | null>(null);

  const calculateAndUpdateMatchPlayerStatAverage = async (
    playerStat: PlayerStats
  ): Promise<void> => {
    // Only calculate if playerStat has a matchId and playerId
    if (!playerStat.matchId || !playerStat.playerId) {
      return;
    }

    // Get all scores for this match, filtered by player
    const allScores = await getScoresForMatch(playerStat.matchId);
    const scores = allScores.filter(
      (score) => score.playerId === playerStat.playerId
    );

    if (scores.length === 0) {
      // No scores, average remains 0
      return;
    }

    // Sum up all totalScores for this player
    const totalScoreSum = scores.reduce(
      (sum, score) => sum + score.totalScore,
      0
    );

    // Calculate average: sum / (number of scores * 3 darts per score)
    // This gives average per dart
    const average = totalScoreSum / scores.length;

    // Update playerStats.average
    playerStat.average = average;

    // Save the updated playerStats
    await savePlayerStats(playerStat);
  };

  const calculateAndUpdateMatchPlayerStatsAverages = async (
    matchId: string
  ): Promise<void> => {
    loading.value = true;
    error.value = null;
    try {
      const playerStats = await getPlayerStatsForMatch(matchId);
      // getPlayerStatsForMatch already returns only match-level stats
      for (const playerStat of playerStats) {
        await calculateAndUpdateMatchPlayerStatAverage(playerStat);
      }
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to calculate and update match player stats averages";
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
    const playerStats = await getPlayerStatsByPlayerLegId(playerLeg.id);

    if (!playerStats) {
      console.error("Player stats not found for player leg:", playerLeg.id);
      return;
    }
    // Update playerStats.average
    playerStats.average = average;

    // Save the updated playerStats
    await savePlayerStats(playerStats);
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
    loading: readonly(loading),
    error: readonly(error),
    calculateAndUpdateMatchPlayerStatAverage,
    calculateAndUpdateMatchPlayerStatsAverages,
    calculateAndUpdatePlayerLegAverage,
    calculateAndUpdatePlayerLegAverages,
  };
};
