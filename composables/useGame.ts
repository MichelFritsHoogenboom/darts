import type { Match } from "~/interfaces/match";

export const useGame = (match: Match) => {
  //composables
  const { players, loadPlayers } = usePlayers();
  const { saveMatch } = useMatches();

  // Refs
  const scoreInput = useTemplateRef<HTMLInputElement>("scoreInput");
  const currentScore = ref<number>();
  const currentPlayerId = ref<string>(match.players[0] as string); // Initialize with first player ID from match (before players are loaded)
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

  const handleMatchWin = async () => {
    match.winner = currentPlayerId.value;
    await saveMatch(match);
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
    await loadPlayers(match.players);
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
    scoreValidationMessage,
    currentScore,
    getNextPlayerId,
    getPreviousPlayerId,
    setNextPlayer,
    setPreviousPlayer,
    canUndo,
    undoLastTurn,
    handleMatchWin,
    resetScore,
  };
};
