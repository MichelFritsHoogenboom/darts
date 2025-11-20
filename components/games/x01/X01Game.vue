<script setup lang="ts">
import { v4 as uuid } from "uuid";
import type { Match } from "~/interfaces/match";
import type { Set } from "~/interfaces/set";
import type { Leg, Score } from "~/interfaces/leg";
import type { PlayerStats } from "~/interfaces/player";

import { X01_GAME_PLAYED_IN } from "~/interfaces/x01MatchConfig";
import { isAchievableScore } from "~/utils/dartScoring.js";
import { createSet } from "~/interfaces/set";
import { createLeg } from "~/interfaces/leg";
import { createScore } from "~/interfaces/leg";
import { createPlayerLeg } from "~/interfaces/leg";

import CheckoutSuggestions from "~/components/games/x01/CheckoutSuggestions.vue";

const { match } = defineProps<{ match: Match }>();
const { getPlayer } = usePlayers();
const { entityGamesWonByPlayer, saveSet } = useSets();
const { saveLeg } = useLegs();
const emit = defineEmits<{
  "game-reset": [];
}>();

const createNewSet = async (startingPlayer: string = match.players[0].id) => {
  const set = createSet({
    matchId: match.id,
    players: toRaw(match.players),
    startingPlayer: startingPlayer,
  });

  return set;
};

const createPlayerLegs = async (players: PlayerStats[], legId: string) => {
  return await Promise.all(
    players.map((player: PlayerStats) =>
      createPlayerLeg({
        legId: legId,
        playerId: player.id,
      })
    )
  );
};

const createNewleg = async (startingPlayer: string = match.players[0].id) => {
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
// Refs
const scoreInput = useTemplateRef("scoreInput");

const playerNames = ref<Record<string, string>>({});
// Game state refs
const currentSet = ref<Set | null>(
  match.matchConfig.gamePlayedIn === X01_GAME_PLAYED_IN.sets
    ? await createNewSet()
    : null
);
const currentLeg = ref<Leg>(await createNewleg());
const currentScore = ref<number>(0);
const currentPlayer = ref<string>(match.players[0].id);
const scoreValidationMessage = ref<string>("");
const legWinNotification = ref<boolean>(false);

match.game.push(currentSet.value ? currentSet.value : currentLeg.value);
if (currentSet.value) {
  currentSet.value.game.push(currentLeg.value);
}

const realTimePlayerScore = computed(() => {
  return (playerId: string) => {
    const scores = currentLeg.value.players.find(
      (player) => player.playerId === playerId
    )?.scores;
    const totalScoreThrown =
      scores?.reduce((total, score) => total + score.totalScore, 0) || 0;

    return currentLeg.value.gameType - totalScoreThrown;
  };
});

const getPlayerWinnerCountOf = computed(() => {
  return (playerId: string, entity: Array<Set | Leg>) => {
    return entity?.filter((entity) => entity.winner === playerId).length || 0;
  };
});

const playerLegScores = computed(() => {
  return (playerId: string) => {
    return (
      currentLeg.value.players.find((player) => player.playerId === playerId)
        ?.scores || []
    );
  };
});

const getPlayerName = (playerId: string) => {
  return playerNames.value[playerId] || "Loading...";
};

// Load player names
onMounted(async () => {
  for (const player of match.players) {
    const playerData = await getPlayer(player.id);
    playerNames.value[player.id] =
      playerData?.firstName + " " + playerData?.lastName || "Unknown";
  }
});

// Computed
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

const validateScore = () => {
  // Trigger validation by accessing the computed property
  isValidScore.value;
};

const handleMatchWin = async () => {
  match.winner = currentPlayer.value;
  alert("Match won by " + getPlayerName(currentPlayer.value) + "!");
};

const handleSetWin = async () => {
  console.log("handleSetWin");
  if (!currentSet.value) {
    return;
  }
  currentSet.value.winner = currentPlayer.value;
  await saveSet(currentSet.value);

  const setsWon = entityGamesWonByPlayer(match, currentPlayer.value);

  if (setsWon === match.matchConfig.setsToWin) {
    await handleMatchWin();
  } else {
    const newSet = await createNewSet(
      getNextPlayerId(currentSet.value.startingPlayer)
    );
    const newLeg = await createNewleg(newSet.startingPlayer);
    match.game.push(newSet);
    newSet.game.push(newLeg);
    currentSet.value = newSet;
    currentLeg.value = newLeg;
    currentPlayer.value = newLeg.startingPlayer;
    resetScore();
  }
};

const handleLegWin = async () => {
  currentLeg.value.winner = currentPlayer.value;
  await saveLeg(currentLeg.value);
  const legsWon = entityGamesWonByPlayer(
    currentSet.value ?? match,
    currentPlayer.value
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
      currentSet.value.game.push(newLeg);
    } else {
      match.game.push(newLeg);
    }
    currentLeg.value = newLeg;
    currentPlayer.value = newLeg.startingPlayer;
    resetScore();
  }
};

const submitScore = async () => {
  if (!isValidScore.value) return;

  const score = currentScore.value;

  // Check if score would go below 0
  if (realTimePlayerScore.value(currentPlayer.value) - score < 0) {
    alert("Score cannot go below zero!");
    return;
  }

  // Check if score would result in 1 (bust)
  if (realTimePlayerScore.value(currentPlayer.value) - score === 1) {
    alert("Bust! Cannot finish on 1. Score not counted.");
    return;
  }

  currentLeg.value.players
    .find((player) => player.playerId === currentPlayer.value)
    ?.scores.push(
      await createScore({
        playerId: currentPlayer.value,
        playerLegId: currentLeg.value.id,
        totalScore: score,
      })
    );

  // Clear validation message
  scoreValidationMessage.value = "";

  // Check for win condition
  if (realTimePlayerScore.value(currentPlayer.value) === 0) {
    await handleLegWin();
    return;
  }

  setNextPlayer();
  // Focus on score input for next player
  nextTick(() => {
    resetScore();
  });
};

const resetScore = () => {
  currentScore.value = 0;
  scoreInput.value?.focus();
};

const getNextPlayerId = (playerId: string) => {
  const currentIndex = match.players.findIndex(
    (player) => player.id === playerId
  );
  const nextIndex = (currentIndex + 1) % match.players.length;
  return match.players[nextIndex].id;
};

const setNextPlayer = (playerid: string = currentPlayer.value) => {
  // Switch to next player
  const nextPlayerIndex = getNextPlayerId(playerid);
  currentPlayer.value = nextPlayerIndex;
};

const canUndo = computed(() => {
  // If match has more than 1 game entity, can undo
  if (match.game.length > 1) return true;

  // If only 1 game entity, check if it's a set with multiple legs
  if (match.game.length === 1) {
    const gameEntity = match.game[0];
    if (gameEntity && "game" in gameEntity) {
      // It's a set - check if it has more than 1 leg
      if (gameEntity.game.length > 1) return true;
    }
  }

  // If no set or set has only 1 leg, check if current leg has any scores
  const hasScores = currentLeg.value.players.some(
    (player) => player.scores && player.scores.length > 0
  );

  return hasScores;
});

const undoLastTurn = () => {
  alert("Undo last turn hasnt been built yet!");
};

const resetGame = () => {
  emit("game-reset");
};
</script>

<template>
  <div class="max-w-6xl mx-auto">
    <!-- Game Board -->
    <div class="space-y-4">
      <!-- Match Status -->
      <div class="bg-gray-800 rounded-xl p-4 text-center">
        <div class="text-lg font-bold text-white mb-2">
          <span
            v-if="match.matchConfig.gamePlayedIn === X01_GAME_PLAYED_IN.sets"
          >
            Set {{ match.game.length }} - Leg
            {{ (match.game[match.game.length - 1] as Set).game.length }}
          </span>
          <span v-else>
            Leg
            {{ match.game.length + 1 }} of
            {{ match.matchConfig.legsToWinParent }}
          </span>
        </div>
        <div :class="`grid grid-cols-${match.players.length} gap-4 text-sm`">
          <div
            class="bg-gray-700 rounded-lg p-2"
            v-for="player in match.players"
            :key="player.id"
          >
            <div class="font-bold text-dartboard-red">
              {{ getPlayerName(player.id) }}
            </div>
            <div
              v-if="match.matchConfig.gamePlayedIn === X01_GAME_PLAYED_IN.sets"
            >
              Sets: {{ getPlayerWinnerCountOf(player.id, match.game) }}/{{
                match.matchConfig.setsToWin
              }}
            </div>
            <div>
              Current Set Legs:
              {{ getPlayerWinnerCountOf(player.id, currentSet?.game || []) }}/
              {{ match.matchConfig.legsToWinParent }}
            </div>
          </div>
        </div>
      </div>

      <!-- Current Scores -->
      <div :class="`grid grid-cols-${match.players.length} gap-4`">
        <div
          v-for="player in match.players"
          :key="player.id"
          :class="[
            'player-card',
            currentPlayer === player.id ? 'active' : 'inactive',
          ]"
        >
          <div class="text-center">
            <h3 class="text-xl font-bold mb-1">
              {{ getPlayerName(player.id) }}
            </h3>
            <div class="text-4xl font-bold text-dartboard-red mb-2">
              {{ realTimePlayerScore(player.id) }}
            </div>
            <div class="text-xs text-gray-400">
              Current Turn: {{ currentPlayer === player.id ? "Yes" : "No" }}
            </div>
          </div>
        </div>
      </div>

      <!-- Score Input -->
      <div class="bg-gray-800 rounded-xl p-4">
        <h3 class="text-xl font-bold text-center mb-3">
          {{ getPlayerName(currentPlayer) }}'s Turn
        </h3>
        <div class="max-w-md mx-auto">
          <input
            ref="scoreInput"
            v-model="currentScore"
            type="number"
            min="0"
            max="180"
            class="score-input w-full text-xl py-2"
            :class="{
              'border-yellow-500':
                scoreValidationMessage &&
                !scoreValidationMessage.includes('not achievable'),
              invalid:
                scoreValidationMessage &&
                scoreValidationMessage.includes('not achievable'),
            }"
            placeholder="Enter score"
            @keyup.enter="submitScore"
            @keydown.ctrl.z.prevent="undoLastTurn"
            @input="validateScore"
          />
          <div
            v-if="scoreValidationMessage"
            class="text-xs mt-1 text-center"
            :class="{
              'text-yellow-400':
                scoreValidationMessage.includes('mistype') ||
                scoreValidationMessage.includes('negative'),
              'text-red-400': scoreValidationMessage.includes('not achievable'),
            }"
          >
            {{ scoreValidationMessage }}
          </div>
          <div class="flex gap-2 mt-3">
            <button
              @click="submitScore"
              :disabled="!isValidScore"
              class="dartboard-button flex-1 py-2"
            >
              Submit Score
            </button>
            <button
              @click="undoLastTurn"
              :disabled="!canUndo"
              class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-3 rounded-lg transition-colors duration-200 text-sm"
              title="Undo last turn (Ctrl+Z)"
            >
              Undo
            </button>
            <button
              @click="resetGame"
              class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-3 rounded-lg transition-colors duration-200 text-sm"
            >
              New Game
            </button>
          </div>
        </div>
      </div>

      <!-- Leg Win Notification -->
      <div
        v-if="legWinNotification"
        class="bg-gradient-to-r from-yellow-900 to-yellow-800 rounded-xl p-3 border-2 border-yellow-600 text-center"
      >
        <div class="text-yellow-100 font-bold text-lg">
          🎯 {{ getPlayerName(currentPlayer) }} wins the leg!
        </div>
      </div>

      <!-- Checkout Suggestions -->
      <CheckoutSuggestions
        v-if="!match.winner"
        :player-name="getPlayerName(currentPlayer)"
        :score="realTimePlayerScore(currentPlayer)"
      />

      <!-- Score History -->
      <div :class="`grid grid-cols-${match.players.length} gap-4`">
        <div
          v-for="player in match.players"
          :key="player.id"
          class="bg-gray-800 rounded-xl p-3"
        >
          <h4 class="text-lg font-bold mb-2 text-center">
            {{ getPlayerName(player.id) }}'s Scores
          </h4>
          <div class="space-y-1 max-h-32 overflow-y-auto">
            <div
              v-for="(score, index) in playerLegScores(player.id)"
              :key="`p1-${index}`"
              class="flex justify-between items-center bg-gray-700 rounded px-2 py-1"
            >
              <span class="text-xs text-gray-400">{{ (index + 1) * 3 }}</span>

              <span class="font-bold text-sm">{{ score.totalScore }}</span>
            </div>
            <div
              v-if="playerLegScores(player.id).length === 0"
              class="text-center text-gray-500 py-2 text-sm"
            >
              No scores yet
            </div>
          </div>
        </div>
      </div>

      <!-- Game Over Modal -->
      <div
        v-if="match.winner"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div class="bg-gray-800 rounded-xl p-8 max-w-md mx-auto text-center">
          <h2 class="text-3xl font-bold mb-4 text-dartboard-green">
            🎉 Match Over!
          </h2>
          <p class="text-xl mb-4">
            <span class="font-bold">{{ getPlayerName(match.winner) }}</span>
            wins!
          </p>

          <!-- Match Summary -->
          <div class="bg-gray-700 rounded-lg p-4 mb-6">
            <h3 class="text-lg font-bold mb-2">Final Score</h3>
            <div
              :class="`grid grid-cols-${match.players.length} gap-4 text-sm`"
            >
              <div v-for="player in match.players" :key="player.id">
                <div class="font-bold text-dartboard-red">
                  {{ getPlayerName(player.id) }}
                </div>
                <div
                  v-if="
                    match.matchConfig.gamePlayedIn === X01_GAME_PLAYED_IN.sets
                  "
                >
                  Sets: {{ getPlayerWinnerCountOf(player.id, match.game) }}/{{
                    match.matchConfig.setsToWin
                  }}
                </div>
                <div v-else>
                  Legs:
                  {{ getPlayerWinnerCountOf(player.id, match.game) }}/{{
                    match.matchConfig.legsToWinParent
                  }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <button @click="resetGame" class="dartboard-button">New Match</button>
      </div>
    </div>
  </div>
</template>
