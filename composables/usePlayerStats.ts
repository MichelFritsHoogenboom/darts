import { ref, readonly, toRaw } from "vue";
import { PlayerStatsService } from "~/database/PlayerStatsService";
import type { PlayerStats } from "~/interfaces/stats";
import { removeObjectById } from "~/utils/array";

const playerStatsService = new PlayerStatsService();

export const usePlayerStats = () => {
  const playerStats = ref<PlayerStats[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const loadPlayerStats = async () => {
    loading.value = true;
    error.value = null;
    try {
      playerStats.value = await playerStatsService.getAll();
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to load player stats";
      console.error("Error loading player stats:", err);
    } finally {
      loading.value = false;
    }
  };

  const getPlayerStatsById = async (
    id: string
  ): Promise<PlayerStats | undefined> => {
    loading.value = true;
    error.value = null;
    try {
      return await playerStatsService.get(id);
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to load player stats by id";
      console.error("Error loading player stats by id:", err);
      return undefined;
    } finally {
      loading.value = false;
    }
  };

  const getPlayerStatsByPlayerLegId = async (
    playerLegId: string
  ): Promise<PlayerStats | null> => {
    loading.value = true;
    error.value = null;
    try {
      const stats = await playerStatsService.getPlayerStatsForPlayerLeg(
        playerLegId
      );
      // Return the first PlayerStats if found, or null if none
      return stats.length > 0 ? stats[0] : null;
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to load player stats for player leg";
      console.error("Error loading player stats for player leg:", err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  const getPlayerStatsForPlayer = async (
    playerId: string
  ): Promise<PlayerStats[]> => {
    loading.value = true;
    error.value = null;
    try {
      const stats = await playerStatsService.getPlayerStatsForPlayer(playerId);
      return stats;
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to load player stats for player";
      console.error("Error loading player stats for player:", err);
      return [];
    } finally {
      loading.value = false;
    }
  };

  const getPlayerStatsForMatch = async (
    matchId: string
  ): Promise<PlayerStats[]> => {
    loading.value = true;
    error.value = null;
    try {
      const allStats = await playerStatsService.getPlayerStatsForMatch(matchId);
      const filteredStats = allStats.filter(
        (stat) => !stat.playerLegId && !stat.setId
      );
      return filteredStats;
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to load player stats for match";
      console.error("Error loading player stats for match:", err);
      return [];
    } finally {
      loading.value = false;
    }
  };

  const getPlayerStatsForSet = async (
    setId: string
  ): Promise<PlayerStats[]> => {
    loading.value = true;
    error.value = null;
    try {
      const allStats = await playerStatsService.getPlayerStatsForSet(setId);
      // Only return set-level stats (those without playerLegId)
      const filteredStats = allStats.filter((stat) => !stat.playerLegId);
      return filteredStats;
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to load player stats for set";
      console.error("Error loading player stats for set:", err);
      return [];
    } finally {
      loading.value = false;
    }
  };

  const savePlayerStats = async (
    stats: PlayerStats
  ): Promise<PlayerStats | null> => {
    loading.value = true;
    error.value = null;

    try {
      const savedPlayerStats = await playerStatsService.upsert(toRaw(stats));
      // Update local state
      const index = playerStats.value.findIndex((ps) => ps.id === stats.id);
      if (index >= 0) {
        playerStats.value[index] = savedPlayerStats;
      } else {
        playerStats.value.push(savedPlayerStats);
      }
      return savedPlayerStats;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to save player stats";
      console.error("Error saving player stats:", err, stats);
      return null;
    } finally {
      loading.value = false;
    }
  };

  const deletePlayerStats = async (id: string): Promise<boolean> => {
    loading.value = true;
    error.value = null;
    try {
      await playerStatsService.delete(id);
      removeObjectById(playerStats.value, id);
      return true;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to delete player stats";
      console.error("Error deleting player stats:", err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  return {
    playerStats: readonly(playerStats),
    loading: readonly(loading),
    error: readonly(error),
    loadPlayerStats,
    getPlayerStatsById,
    getPlayerStatsByPlayerLegId,
    getPlayerStatsForPlayer,
    getPlayerStatsForMatch,
    getPlayerStatsForSet,
    savePlayerStats,
    deletePlayerStats,
  };
};
