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

  const getNextPlayerId = (playerId: string) => {
    const currentIndex = players.value.findIndex(
      (player) => player.id === playerId
    );
    const nextIndex = (currentIndex + 1) % players.value.length;
    return players.value[nextIndex].id;
  };

  const setNextPlayer = (playerid: string = currentPlayerId.value) => {
    // Switch to next player
    const nextPlayerIndex = getNextPlayerId(playerid);
    currentPlayerId.value = nextPlayerIndex;
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
    setNextPlayer,
    canUndo,
    undoLastTurn,
    handleMatchWin,
    resetScore,
  };
};
