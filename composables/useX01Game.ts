//vendor
import { v4 as uuid } from "uuid";

//interfaces
import type { Match } from "~/interfaces/match";
import type { Set } from "~/interfaces/set";
import type { Leg } from "~/interfaces/leg";
import type { PlayerLeg } from "~/interfaces/leg";
import type { Score } from "~/interfaces/leg";

// utils
import { getPlayerWinnerCount } from "~/utils/match";

//factories
import { createSet } from "~/interfaces/set";
import { createLeg } from "~/interfaces/leg";
import { createScore } from "~/interfaces/leg";
import { createPlayerLeg } from "~/interfaces/leg";
import { createPlayerStats } from "~/interfaces/stats";

//enums
import { X01_GAME_PLAYED_IN } from "~/interfaces/x01MatchConfig";

// utils
import { isAchievableScore } from "~/utils/dartScoring.js";

export const useX01Game = (
  match: Match,
  gameState: ReturnType<typeof useGame>,
) => {
  //composables
  // Use game state passed from component
  const {
    currentScore,
    scoreValidationMessage,
    resetScore,
    playerStats,
    currentPlayerId,
    setPreviousPlayer,
    getNextPlayerId,
    setNextPlayer,
  } = gameState;
  const { savePlayerLeg, getPlayerLegsForLeg } = usePlayerLegs();
  const {
    calculateAndUpdatePlayerLegAverages,
    calculateAndUpdateMatchPlayerStatsAverages,
    calculateAndUpdateSetPlayerStatsAverages,
  } = useAverages();
  const { getLegsForSet, saveLeg, getLegsForMatch, deleteLeg } = useLegs();
  const { getSetsForMatch, saveSet, deleteSet } = useSets();
  const { getScoresForPlayerLeg, deleteScore } = useScores();
  const { saveMatch } = useMatches();
  // factory functions
  const createNewSet = async (
    startingPlayer: string = currentPlayerId.value,
  ) => {
    // Create PlayerStats for each player in the same order as playerIds

    const set = await createSet({
      matchId: match.id,
      playerStats: [],
      startingPlayer: startingPlayer,
    });

    const playerStatsIds = await Promise.all(
      playerIds.value.map(async (playerId) => {
        const playerStats = await createPlayerStats({
          playerId: playerId,
          matchId: match.id,
          setId: set.id,
        });
        return playerStats.id;
      }),
    );

    set.playerStats = playerStatsIds;
    await saveSet(set);

    return set;
  };

  const createPlayerLegs = async (
    players: string[],
    legId: string,
    matchId: string,
    setId?: string,
  ) => {
    return await Promise.all(
      players.map((playerId) =>
        createPlayerLeg({
          legId: legId,
          playerId: playerId,
          matchId: matchId,
          setId: setId,
        }).then((playerLeg) => playerLeg.id),
      ),
    );
  };

  const createNewleg = async (
    startingPlayer: string = currentPlayerId.value,
  ) => {
    const legId = uuid();
    const setId = currentSet.value?.id;

    const legSettings = {
      id: legId,
      matchId: match.id,
      gameType: match.matchConfig.gameType,
      players: await createPlayerLegs(playerIds.value, legId, match.id, setId),
      startingPlayer: startingPlayer,
      ...(setId && { setId: setId }),
    };

    return await createLeg(legSettings);
  };

  // Get event emitter from plugin
  const { $event } = useNuxtApp();

  // game state refs - initialize as null/empty, will be set in initializeGame
  const currentSet = ref<Set | null>(null);
  const currentSetGame = ref<Leg[]>([]);
  const currentLeg = ref<Leg | null>(null);
  const currentPlayerLegs = ref<PlayerLeg[]>([]);
  const currentPlayerLegScores = ref<Record<string, Score[]>>({});
  const matchGame = ref<Set[] | Leg[]>([]);

  const playerIds = computed(() => {
    // Use playerStats to get playerIds (loaded in onBeforeMount, so always available)
    return playerStats?.value?.map((stat) => stat.playerId) ?? [];
  });

  const isValidScore = computed(() => {
    const score = currentScore.value ?? 0;
    if (isNaN(score)) {
      scoreValidationMessage.value = "";
      return false;
    }
    if (score > 180) {
      scoreValidationMessage.value = "Maximum score is 180. Did you mistype?";
      return false;
    } else if (score < 0) {
      scoreValidationMessage.value = "Score cannot be negative.";
      return false;
    } else if (!isAchievableScore(score)) {
      scoreValidationMessage.value = `Score ${score} is not achievable with 3 darts.`;
      return false;
    } else {
      scoreValidationMessage.value = "";
      return true;
    }
  });

  // computed
  const realTimePlayerScore = computed(() => {
    return (playerId: string) => {
      const scores = currentPlayerLegScores.value[playerId];
      const totalScoreThrown =
        scores?.reduce((total, score) => total + score.totalScore, 0) || 0;

      return currentLeg.value
        ? currentLeg.value.gameType - totalScoreThrown
        : 0;
    };
  });

  // Computed function to get player leg by playerId
  const getCurrentPlayerLeg = computed(() => {
    return (playerId: string): PlayerLeg | undefined => {
      return currentPlayerLegs.value.find((pl) => pl.playerId === playerId);
    };
  });

  // Computed to get the correct legs array for display
  const legsToDisplay = computed(() => {
    return currentSet.value ? currentSetGame.value : matchGame.value;
  });

  // Check if undo is available
  const canUndo = computed(() => {
    // Check if match has more than 1 leg/set
    if (matchGame.value.length > 1 || currentSetGame.value?.length > 1) {
      return true;
    }

    // Check if any playerLeg in the current leg has scores
    if (currentLeg.value) {
      return currentPlayerLegs.value.some(
        (playerLeg) => playerLeg.scores.length > 0,
      );
    }

    return false;
  });

  const removeLastScore = async (playerLeg: PlayerLeg) => {
    const lastScore = playerLeg.scores[playerLeg.scores.length - 1];
    if (lastScore) {
      await deleteScore(lastScore);
      removeValueById(playerLeg.scores, lastScore);
      await savePlayerLeg(playerLeg);
      return true;
    }
    return false;
  };

  const initPreviousLeg = async (previousLeg: Leg) => {
    const winner = previousLeg.winner;
    currentLeg.value = previousLeg;
    currentLeg.value!.winner = undefined;
    await saveLeg(currentLeg.value!);

    currentPlayerLegs.value = await getPlayerLegsForLeg(previousLeg.id);
    currentPlayerLegScores.value = {};
    await Promise.all(
      currentPlayerLegs.value.map(async (playerLeg) => {
        const scores = await getScoresForPlayerLeg(playerLeg.id);
        currentPlayerLegScores.value[playerLeg.playerId] = scores;
      }),
    );

    let previousPlayerLeg = getCurrentPlayerLeg.value(winner!);
    if (!previousPlayerLeg) return;

    await removeLastScore(previousPlayerLeg);
    currentPlayerId.value = previousPlayerLeg.playerId;
  };

  const undoLastTurn = async () => {
    if (!currentLeg.value || !canUndo.value) return;

    if (match.winner) {
      match.winner = undefined;
      currentSet.value!.winner = undefined;
      currentLeg.value!.winner = undefined;
      await saveLeg(currentLeg.value!);
      await saveSet(currentSet.value!);
      await saveMatch(match);

      await loadMatchGame();

      const playerLeg = getCurrentPlayerLeg.value(currentPlayerId.value);
      if (!playerLeg) return;

      await removeLastScore(playerLeg);
      await loadMatchGame();
      $event("undo-last-turn");

      resetScore();
      return;
    }

    setPreviousPlayer();

    const playerLeg = getCurrentPlayerLeg.value(currentPlayerId.value);
    if (!playerLeg) return;

    const lastScoreRemoved = await removeLastScore(playerLeg);

    if (lastScoreRemoved) {
      $event("undo-last-turn");
      resetScore();
      return;
    }

    if (!lastScoreRemoved) {
      // Delete the leg first
      if (!currentLeg.value || !currentSet.value) return;

      await deleteLeg(currentLeg.value.id);
      removeObjectById(currentSetGame.value, currentLeg.value.id);
      removeValueById(currentSet.value?.game ?? [], currentLeg.value.id);
      await saveSet(currentSet.value);

      // Reload to get updated leg count
      await loadMatchGame();

      // Check if there are remaining legs in the set AFTER deletion
      if (currentSetGame.value && currentSetGame.value.length > 0) {
        const previousLeg = currentSetGame.value.at(-1)!;
        await initPreviousLeg(previousLeg);
        await loadMatchGame();
        $event("undo-last-turn");
        resetScore();
      } else {
        // no more legs exist in the set, delete the set and re-activate the previous set
        if (!currentSet.value) return;
        await deleteSet(currentSet.value.id);

        removeValueById(match.game, currentSet.value.id);
        await saveMatch(match);

        // Reload match game to get updated sets
        await loadMatchGame();

        // Get the latest set from match.game (if any sets remain)
        const updatedSets = matchGame.value as Set[];

        const latestSet = updatedSets[updatedSets.length - 1];
        currentSet.value = latestSet;
        currentSetGame.value = await getLegsForSet(latestSet.id);
        currentSet.value!.winner = undefined;
        await saveSet(latestSet);

        const previousLeg =
          currentSetGame.value[currentSetGame.value.length - 1];

        await initPreviousLeg(previousLeg);

        // Reload match game to get updated sets
        await loadMatchGame();
        $event("undo-last-turn");
        resetScore();
      }
    }
  };

  const validateScore = () => {
    // Trigger validation by accessing the computed property
    isValidScore.value;
  };

  // Async initialization function
  const initializeMatch = async () => {
    // Initialize currentSet if needed
    await loadMatchGame();

    if (matchGame.value.length === 0) {
      if (match.matchConfig.gamePlayedIn === X01_GAME_PLAYED_IN.sets) {
        currentSet.value = await createNewSet();
      }

      // Initialize currentLeg
      currentLeg.value = await createNewleg();

      // Push IDs to match.game (which stores IDs)
      match.game.push(
        currentSet.value ? currentSet.value.id : currentLeg.value.id,
      );
      if (currentSet.value) {
        currentSet.value.game.push(currentLeg.value.id);
        await saveSet(currentSet.value);
      }

      // Save match to persist the first set/leg in match.game
      await saveMatch(match);
    } else {
      // Match already has a winner, reinitialize from database
      await reinitializeMatch();
    }
  };

  const reinitializeMatch = async () => {
    if (match.matchConfig.gamePlayedIn === X01_GAME_PLAYED_IN.sets) {
      // Sets mode: load sets and find the last set without a winner
      const sets = await getSetsForMatch(match.id);
      matchGame.value = sets;
      currentSet.value = sets.filter((set) => !set.winner).at(-1) ?? null;

      if (currentSet.value) {
        currentSetGame.value = await getLegsForSet(currentSet.value.id);
        currentLeg.value =
          currentSetGame.value.filter((leg) => !leg.winner).at(-1) ?? null;
      } else {
        currentSetGame.value = [];
        currentLeg.value = null;
      }
    } else {
      // Direct legs mode: load legs and find the last leg without a winner
      const legs = await getLegsForMatch(match.id);
      matchGame.value = legs;
      currentLeg.value = legs.filter((leg) => !leg.winner).at(-1) ?? null;
    }

    // Load player legs and scores for the current leg
    if (currentLeg.value) {
      currentPlayerLegs.value = await getPlayerLegsForLeg(currentLeg.value.id);

      // Load scores for each player leg
      currentPlayerLegScores.value = {};
      await Promise.all(
        currentPlayerLegs.value.map(async (playerLeg) => {
          const scores = await getScoresForPlayerLeg(playerLeg.id);
          currentPlayerLegScores.value[playerLeg.playerId] = scores;
        }),
      );

      // Determine the current player based on scores
      // Find the player with the most recent score by checking createdAt timestamps
      let lastScoreTime: Date | null = null;
      let lastPlayerId: string | null = null;

      for (const [playerId, scores] of Object.entries(
        currentPlayerLegScores.value,
      )) {
        if (scores.length > 0) {
          // Get the most recent score for this player
          const mostRecentScore = scores[scores.length - 1];
          if (!lastScoreTime || mostRecentScore.createdAt > lastScoreTime) {
            lastScoreTime = mostRecentScore.createdAt;
            lastPlayerId = playerId;
          }
        }
      }

      // If there are scores, set the next player after the last one who threw
      // Otherwise, use the leg's starting player
      if (lastPlayerId) {
        currentPlayerId.value = getNextPlayerId(lastPlayerId);
      } else {
        currentPlayerId.value = currentLeg.value.startingPlayer;
      }
    } else {
      currentPlayerLegs.value = [];
      currentPlayerLegScores.value = {};
      // If no leg, default to first player
      currentPlayerId.value = "";
    }
  };

  // Function to load match game (sets or legs) and current set game
  const loadMatchGame = async () => {
    if (match.matchConfig.gamePlayedIn === X01_GAME_PLAYED_IN.sets) {
      matchGame.value = await getSetsForMatch(match.id);
      // Also reload current set's legs if there's a current set
      if (currentSet.value) {
        currentSetGame.value = await getLegsForSet(currentSet.value.id);
      }
    } else {
      matchGame.value = await getLegsForMatch(match.id);
    }
  };

  const handleMatchWin = async () => {
    await calculateAndUpdateMatchPlayerStatsAverages(match.id);

    match.winner = currentPlayerId.value;
    await saveMatch(match);
  };

  const handleSetWin = async () => {
    if (!currentSet.value) {
      return;
    }

    await calculateAndUpdateSetPlayerStatsAverages(currentSet.value.id);

    currentSet.value.winner = currentPlayerId.value;
    await saveSet(currentSet.value);
    $event("set-finished");

    // Reload current set's legs to get updated winner info
    await loadMatchGame();

    const setsWon = getPlayerWinnerCount(
      currentPlayerId.value,
      matchGame.value,
    );

    if (setsWon === match.matchConfig.setsToWin) {
      await handleMatchWin();
    } else {
      const newSet = await createNewSet(
        getNextPlayerId(currentSet.value.startingPlayer),
      );
      currentSet.value = newSet;
      const newLeg = await createNewleg(newSet.startingPlayer);
      match.game.push(newSet.id);
      currentSet.value.game.push(newLeg.id);

      // Save set and match to persist the new set/leg in their game arrays
      await saveSet(currentSet.value);
      await saveMatch(match);

      currentLeg.value = newLeg;
      currentPlayerId.value = newLeg.startingPlayer;
      resetScore();
    }
  };

  const handleLegWin = async (createdScore: Score) => {
    if (!currentLeg.value) return;

    // Calculate and update averages for all playerlegs in this leg
    await calculateAndUpdatePlayerLegAverages(currentLeg.value.id);

    currentLeg.value.winner = currentPlayerId.value;
    await saveLeg(currentLeg.value);

    // Reload current legs to get updated winner info
    await loadMatchGame();

    const legsWon = getPlayerWinnerCount(
      currentPlayerId.value,
      currentSet.value ? currentSetGame.value : matchGame.value,
    );

    if (legsWon === match.matchConfig.legsToWinParent) {
      if (currentSet.value) {
        await handleSetWin();
      } else {
        await handleMatchWin();
      }
    } else {
      const newLeg = await createNewleg(
        getNextPlayerId(currentLeg.value.startingPlayer),
      );
      if (currentSet.value) {
        currentSet.value.game.push(newLeg.id);
        await saveSet(currentSet.value);
      } else {
        match.game.push(newLeg.id);
        await saveMatch(match);
      }
      currentLeg.value = newLeg;
      currentPlayerId.value = newLeg.startingPlayer;
      resetScore();
    }
  };

  const submitScore = async () => {
    if (!isValidScore.value) return;

    const score = currentScore.value;

    if (score === undefined) {
      alert("Score cannot be empty!");
      return;
    }

    // Check if score would go below 0
    if (realTimePlayerScore.value(currentPlayerId.value) - score < 0) {
      alert("Score cannot go below zero!");
      return;
    }

    // Check if score would result in 1 (bust)
    if (realTimePlayerScore.value(currentPlayerId.value) - score === 1) {
      alert("Bust! Cannot finish on 1. Score not counted.");
      return;
    }

    const playerLeg = getCurrentPlayerLeg.value(currentPlayerId.value);
    if (!playerLeg) return;

    const createdScore = await createScore({
      matchId: match.id,
      setId: currentSet.value?.id ?? "",
      playerId: currentPlayerId.value,
      playerLegId: playerLeg.id,
      startScore: realTimePlayerScore.value(currentPlayerId.value),
      totalScore: score,
    });

    playerLeg.scores.push(createdScore.id);
    await savePlayerLeg(playerLeg);

    $event("score-submitted");

    // Clear validation message
    scoreValidationMessage.value = "";

    // Check for win condition
    if (realTimePlayerScore.value(currentPlayerId.value) === 0) {
      await handleLegWin(createdScore);
      $event("leg-finished");
      return;
    }

    setNextPlayer();
    // Focus on score input for next player
    nextTick(() => {
      resetScore();
    });
  };

  return {
    currentSet,
    currentSetGame,
    currentLeg,
    currentPlayerLegs,
    currentPlayerLegScores,
    canUndo,
    undoLastTurn,
    matchGame,
    isValidScore,
    realTimePlayerScore,
    getCurrentPlayerLeg,
    initializeMatch,
    loadMatchGame,
    handleSetWin,
    handleLegWin,
    legsToDisplay,
    validateScore,
    submitScore,
  };
};
