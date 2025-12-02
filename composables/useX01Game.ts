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

//enums
import { X01_GAME_PLAYED_IN } from "~/interfaces/x01MatchConfig";

// utils
import { isAchievableScore } from "~/utils/dartScoring.js";

export const useX01Game = (
  match: Match,
  gameState: ReturnType<typeof useGame>
) => {
  //composables
  // Use game state passed from component
  const {
    currentScore,
    scoreValidationMessage,
    handleMatchWin,
    resetScore,
    currentPlayerId,
    getNextPlayerId,
    setNextPlayer,
  } = gameState;
  const { savePlayerLeg } = usePlayerLegs();
  const { getLegsForSet, saveLeg } = useLegs();
  const { getLegsForMatch } = useLegs();
  const { getSetsForMatch, saveSet } = useSets();

  // factory functions
  const createNewSet = async (startingPlayer: string = match.players[0]) => {
    const set = createSet({
      matchId: match.id,
      players: toRaw(match.players),
      startingPlayer: startingPlayer,
    });

    return set;
  };

  const createPlayerLegs = async (players: string[], legId: string) => {
    return await Promise.all(
      players.map((playerId) =>
        createPlayerLeg({
          legId: legId,
          playerId: playerId,
        }).then((playerLeg) => playerLeg.id)
      )
    );
  };

  const createNewleg = async (startingPlayer: string = match.players[0]) => {
    const legId = uuid();

    const legSettings = {
      id: legId,
      matchId: match.id,
      gameType: match.matchConfig.gameType,
      players: await createPlayerLegs(match.players, legId),
      startingPlayer: startingPlayer,
      ...(currentSet.value && { setId: currentSet.value.id }),
    };

    return await createLeg(legSettings);
  };

  // game state refs - initialize as null/empty, will be set in initializeGame
  const currentSet = ref<Set | null>(null);
  const currentSetGame = ref<Leg[]>([]);
  const currentLeg = ref<Leg | null>(null);
  const currentPlayerLegs = ref<PlayerLeg[]>([]);
  const currentPlayerLegScores = ref<Record<string, Score[]>>({});
  const matchGame = ref<Set[] | Leg[]>([]);

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

  const validateScore = () => {
    // Trigger validation by accessing the computed property
    isValidScore.value;
  };

  // Async initialization function
  const initializeMatch = async () => {
    // Initialize currentSet if needed
    if (match.matchConfig.gamePlayedIn === X01_GAME_PLAYED_IN.sets) {
      currentSet.value = await createNewSet();
    }

    // Initialize currentLeg
    currentLeg.value = await createNewleg();

    // Push IDs to match.game (which stores IDs)
    match.game.push(
      currentSet.value ? currentSet.value.id : currentLeg.value.id
    );
    if (currentSet.value) {
      currentSet.value.game.push(currentLeg.value.id);
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

  const handleSetWin = async () => {
    if (!currentSet.value) {
      return;
    }
    currentSet.value.winner = currentPlayerId.value;
    await saveSet(currentSet.value);

    // Reload current set's legs to get updated winner info
    await loadMatchGame();

    const setsWon = getPlayerWinnerCount(
      currentPlayerId.value,
      matchGame.value
    );

    if (setsWon === match.matchConfig.setsToWin) {
      await handleMatchWin();
    } else {
      const newSet = await createNewSet(
        getNextPlayerId(currentSet.value.startingPlayer)
      );
      currentSet.value = newSet;
      const newLeg = await createNewleg(newSet.startingPlayer);
      match.game.push(newSet.id);
      currentSet.value.game.push(newLeg.id);

      currentLeg.value = newLeg;
      currentPlayerId.value = newLeg.startingPlayer;
      resetScore();
    }
  };

  const handleLegWin = async () => {
    if (!currentLeg.value) return;

    currentLeg.value.winner = currentPlayerId.value;
    await saveLeg(currentLeg.value);

    // Reload current legs to get updated winner info
    await loadMatchGame();

    const legsWon = getPlayerWinnerCount(
      currentPlayerId.value,
      currentSet.value ? currentSetGame.value : matchGame.value
    );

    if (legsWon === match.matchConfig.legsToWinParent) {
      if (currentSet.value) {
        await handleSetWin();
      } else {
        await handleMatchWin();
      }
    } else {
      const newLeg = await createNewleg(
        getNextPlayerId(currentLeg.value.startingPlayer)
      );
      if (currentSet.value) {
        currentSet.value.game.push(newLeg.id);
      } else {
        match.game.push(newLeg.id);
      }
      currentLeg.value = newLeg;
      currentPlayerId.value = newLeg.startingPlayer;
      resetScore();
    }
  };

  const submitScore = async () => {
    if (!isValidScore.value) return;

    const score = currentScore.value;

    if (!score) {
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
      playerId: currentPlayerId.value,
      playerLegId: playerLeg.id,
      totalScore: score,
    });

    playerLeg.scores.push(createdScore.id);
    await savePlayerLeg(playerLeg);

    // Clear validation message
    scoreValidationMessage.value = "";

    // Check for win condition
    if (realTimePlayerScore.value(currentPlayerId.value) === 0) {
      await handleLegWin();
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
