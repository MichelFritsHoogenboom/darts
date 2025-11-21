import { ref, readonly } from "vue";
import { PlayerLegService } from "~/database/PlayerLegService";
import type { PlayerLeg } from "~/interfaces/leg";

const playerLegService = new PlayerLegService();
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
      await playerLegService.delete(id);
      playerLegs.value = playerLegs.value.filter(
        (playerLeg) => playerLeg.id !== id
      );
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

  return {
    playerLegs: readonly(playerLegs),
    loading: readonly(loading),
    error: readonly(error),
    loadPlayerLegs,
    savePlayerLeg,
    deletePlayerLeg,
    getPlayerLegsForLeg,
    getPlayerLegsForPlayer,
  };
};
