import { ref, computed, readonly } from "vue";
import { PlayerService } from "../database/PlayerService";
import type { Player } from "../interfaces/player";

/**
 * Composable for player management
 */
export function usePlayers() {
  const players = ref<Player[]>([]);
  const loading = ref(true); // Start with loading true
  const error = ref<string | null>(null);

  /**
   * Load all players from IndexedDB
   */
  const loadPlayers = async () => {
    try {
      loading.value = true;
      error.value = null;
      players.value = await PlayerService.getAllPlayers();
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to load players";
      console.error("Error loading players:", err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Save or update a player
   */
  const savePlayer = async (player: Player) => {
    try {
      loading.value = true;
      error.value = null;
      const savedPlayer = await PlayerService.upsertPlayer(player);

      // Update local players array
      const existingIndex = players.value.findIndex(
        (p) => p.id === savedPlayer.id
      );
      if (existingIndex >= 0) {
        players.value[existingIndex] = savedPlayer;
      } else {
        players.value.push(savedPlayer);
      }

      return savedPlayer;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to save player";
      console.error("Error saving player:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Delete a player
   */
  const deletePlayer = async (id: string) => {
    try {
      loading.value = true;
      error.value = null;
      await PlayerService.deletePlayer(id);

      // Remove from local players array
      players.value = players.value.filter((p) => p.id !== id);
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to delete player";
      console.error("Error deleting player:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Search players
   */
  const searchPlayers = async (searchTerm: string) => {
    try {
      loading.value = true;
      error.value = null;
      return await PlayerService.searchPlayers(searchTerm);
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to search players";
      console.error("Error searching players:", err);
      return [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * Get player by ID
   */
  const getPlayer = async (id: string) => {
    try {
      loading.value = true;
      error.value = null;
      return await PlayerService.getPlayer(id);
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to get player";
      console.error("Error getting player:", err);
      return undefined;
    } finally {
      loading.value = false;
    }
  };

  // Computed properties
  const playerCount = computed(() => players.value.length);
  const hasPlayers = computed(() => players.value.length > 0);

  return {
    // State
    players: readonly(players),
    loading: readonly(loading),
    error: readonly(error),

    // Computed
    playerCount,
    hasPlayers,

    // Methods
    loadPlayers,
    savePlayer,
    deletePlayer,
    searchPlayers,
    getPlayer,
  };
}
