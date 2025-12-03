<script setup lang="ts">
import type { Match } from "~/interfaces/match";

import type { Score } from "~/interfaces/leg";

import { X01_GAME_PLAYED_IN } from "~/interfaces/x01MatchConfig";
import { getPlayerWinnerCount } from "~/utils/match";

import CheckoutSuggestions from "~/components/games/x01/CheckoutSuggestions.vue";

const { match } = defineProps<{ match: Match }>();

const emit = defineEmits<{
  "game-reset": [];
}>();

// Get game state first
const gameState = useGame(match);
const {
  currentScore,
  scoreValidationMessage,
  currentPlayerId,
  currentPlayer,
  players,
} = gameState;

// Pass game state to useX01Game
const {
  currentSet,
  currentSetGame,
  currentLeg,
  currentPlayerLegs,
  currentPlayerLegScores,
  matchGame,
  initializeMatch,
  isValidScore,
  realTimePlayerScore,
  loadMatchGame,
  legsToDisplay,
  validateScore,
  submitScore,
  canUndo,
  undoLastTurn,
} = useX01Game(match, gameState);
const { getLegsForSet } = useLegs();
const { getPlayerLegsForLeg } = usePlayerLegs();
const { getScoresForPlayerLeg } = useScores();

// Game state refs

// Load legs for current set when it changes
watch(
  () => currentSet.value,
  async (set) => {
    if (set) {
      currentSetGame.value = await getLegsForSet(set.id);
    } else {
      currentSetGame.value = [];
    }
  },
  { immediate: true, deep: true }
);

// Load player legs when current leg changes
watch(
  () => currentLeg.value?.id,
  async (legId) => {
    if (legId) {
      currentPlayerLegs.value = await getPlayerLegsForLeg(legId);
    }
  },
  { immediate: true }
);

// Load scores for each player leg and group by playerId
watch(
  () => currentPlayerLegs.value,
  async (playerLegs) => {
    if (!playerLegs || playerLegs.length === 0) {
      currentPlayerLegScores.value = {};
      return;
    }

    // Load all scores for all player legs in parallel
    const scoresByPlayerId: Record<string, Score[]> = {};
    await Promise.all(
      playerLegs.map(async (playerLeg) => {
        const scores = await getScoresForPlayerLeg(playerLeg.id);
        scoresByPlayerId[playerLeg.playerId] = scores;
      })
    );

    currentPlayerLegScores.value = scoresByPlayerId;
  },
  { immediate: true, deep: true }
);

// Load sets for match when in sets mode
watch(
  () => match.game,
  async () => {
    await loadMatchGame();
  },
  { immediate: true, deep: true }
);

const legWinNotification = ref<boolean>(false);
const resetGame = () => {
  emit("game-reset");
};
initializeMatch();
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
            Set {{ matchGame.length }} - Leg
            {{ currentSetGame.length }}
          </span>
          <span v-else>
            Leg
            {{ matchGame.length }} of
            {{ match.matchConfig.legsToWinParent }}
          </span>
        </div>
        <div :class="`grid grid-cols-${players.length} gap-4 text-sm`">
          <div
            class="bg-gray-700 rounded-lg p-2"
            v-for="player in players"
            :key="player.id"
          >
            <div class="font-bold text-dartboard-red">
              {{ getPlayerDisplayName(player) }}
            </div>
            <div
              v-if="match.matchConfig.gamePlayedIn === X01_GAME_PLAYED_IN.sets"
            >
              Sets: {{ getPlayerWinnerCount(player.id, matchGame) }}/{{
                match.matchConfig.setsToWin
              }}
            </div>
            <div>
              Legs:
              {{ getPlayerWinnerCount(player.id, legsToDisplay) }}/
              {{ match.matchConfig.legsToWinParent }}
            </div>
          </div>
        </div>
      </div>

      <!-- Current Scores -->
      <div :class="`grid grid-cols-${players.length} gap-4`">
        <div
          v-for="player in players"
          :key="player.id"
          :class="[
            'player-card',
            currentPlayerId === player.id ? 'active' : 'inactive',
          ]"
        >
          <div class="text-center">
            <h3 class="text-xl font-bold mb-1">
              {{ getPlayerDisplayName(player) }}
            </h3>
            <div class="text-4xl font-bold text-dartboard-red mb-2">
              {{ realTimePlayerScore(player.id) }}
            </div>
            <div class="text-xs text-gray-400">
              Current Turn: {{ currentPlayerId === player.id ? "Yes" : "No" }}
            </div>
          </div>
        </div>
      </div>

      <!-- Score Input -->
      <div class="bg-gray-800 rounded-xl p-4">
        <h3 class="text-xl font-bold text-center mb-3">
          {{ getPlayerDisplayName(currentPlayer) }}'s Turn
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
          x🎯 {{ getPlayerDisplayName(currentPlayer) }} wins the leg!
        </div>
      </div>

      <!-- Checkout Suggestions -->
      <CheckoutSuggestions
        v-if="!match.winner"
        :player-name="getPlayerDisplayName(currentPlayer)"
        :score="realTimePlayerScore(currentPlayerId)"
      />

      <!-- Score History -->
      <div :class="`grid grid-cols-${players.length} gap-4`">
        <div
          v-for="player in players"
          :key="player.id"
          class="bg-gray-800 rounded-xl p-3"
        >
          <h4 class="text-lg font-bold mb-2 text-center">
            {{ getPlayerDisplayName(player) }}'s Scores
          </h4>
          <div class="space-y-1 max-h-32 overflow-y-auto">
            <div
              v-for="(score, index) in currentPlayerLegScores[player.id] || []"
              :key="`p1-${index}`"
              class="flex justify-between items-center bg-gray-700 rounded px-2 py-1"
            >
              <span class="text-xs text-gray-400">{{ (index + 1) * 3 }}</span>

              <span class="font-bold text-sm">{{ score.totalScore }}</span>
            </div>
            <div
              v-if="(currentPlayerLegScores[player.id] || []).length === 0"
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
        <div
          class="bg-gray-800 rounded-xl p-8 max-w-4xl w-full max-h-full mx-auto text-center overflow-y-auto"
        >
          <h2 class="text-3xl font-bold mb-4 text-dartboard-green">
            Match Over!
          </h2>

          <!-- Match Summary -->
          <StatsMatchSummary :match="match" />
          <button @click="resetGame" class="dartboard-button">New Match</button>
        </div>
      </div>
    </div>
  </div>
</template>
