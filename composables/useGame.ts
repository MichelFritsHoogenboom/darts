import type { Match } from "~/interfaces/match";
import type { PlayerStats } from "~/interfaces/stats";

export const useGame = (match: Match) => {
  //composables
  const { players, loadPlayers } = usePlayers();
  const { getPlayerStatsById } = usePlayerStats();

  // Refs
  const scoreInput = useTemplateRef<HTMLInputElement>("scoreInput");
  const currentScore = ref<number>();
  const playerStats = ref<PlayerStats[]>([]);
  const currentPlayerId = ref<string>("");
  const scoreValidationMessage = ref<string>("");

  // computed
  const currentPlayer = computed(() => {
    // Always return a player - fallback to first player if current not found
    return (
      players.value.find((player) => player.id === currentPlayerId.value) ||
      players.value[0]
    );
  });

  const canUndo = computed(() => {
    return false;
  });

  // methods

  const undoLastTurn = () => {
    alert("Undo last turn hasnt been built yet!");
  };

  // Shared logic to get player ID at a relative index
  const getPlayerIdAtOffset = (playerId: string, offset: number) => {
    const currentIndex = players.value.findIndex(
      (player) => player.id === playerId
    );
    const newIndex =
      (currentIndex + offset + players.value.length) % players.value.length;
    return players.value[newIndex].id;
  };

  const getNextPlayerId = (playerId: string) => {
    return getPlayerIdAtOffset(playerId, 1);
  };

  const getPreviousPlayerId = (playerId: string) => {
    return getPlayerIdAtOffset(playerId, -1);
  };

  const setNextPlayer = (playerid: string = currentPlayerId.value) => {
    // Switch to next player
    const nextPlayerIndex = getNextPlayerId(playerid);
    currentPlayerId.value = nextPlayerIndex;
  };

  const setPreviousPlayer = (playerid: string = currentPlayerId.value) => {
    // Switch to previous player
    const previousPlayerIndex = getPreviousPlayerId(playerid);
    currentPlayerId.value = previousPlayerIndex;
  };

  const resetScore = () => {
    currentScore.value = undefined;
    scoreInput.value?.focus();
  };

  onBeforeMount(async () => {
    // Load PlayerStats in the order of match.playerStats IDs
    const statsPromises = match.playerStats.map((statsId) =>
      getPlayerStatsById(statsId)
    );
    const loadedStats = await Promise.all(statsPromises);
    // Filter out undefined values and maintain order
    playerStats.value = loadedStats.filter(
      (stat): stat is PlayerStats => stat !== undefined
    );

    // Get playerId from the first PlayerStats
    if (playerStats.value.length > 0 && playerStats.value[0]?.playerId) {
      currentPlayerId.value = playerStats.value[0].playerId;
    }

    // Load players using playerIds from PlayerStats (maintaining order)
    const playerIds = playerStats.value.map((stat) => stat.playerId);
    if (playerIds.length > 0) {
      await loadPlayers(playerIds);
    }
  });
  // Focus score input on page load
  onMounted(() => {
    scoreInput.value?.focus();
  });

  return {
    scoreInput,
    currentPlayerId,
    currentPlayer,
    players,
    playerStats,
    scoreValidationMessage,
    currentScore,
    getNextPlayerId,
    getPreviousPlayerId,
    setNextPlayer,
    setPreviousPlayer,
    canUndo,
    undoLastTurn,
    resetScore,
  };
};
