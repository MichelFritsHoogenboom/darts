<script setup lang="ts">
import type { Match } from "~/interfaces/match";
import type { Score } from "~/interfaces/leg";

import { X01_GAME_PLAYED_IN } from "~/interfaces/x01MatchConfig";
import { getPlayerWinnerCount } from "~/utils/match";

import PlayerComponent from "~/components/games/x01/PlayerComponent.vue";
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

provide("matchId", match.id);

// Game state refs
const scoreCardRefs = ref<HTMLElement[]>([]);

// Set ref for score card
const setScoreCardRef = (el: Element | ComponentPublicInstance | null) => {
  if (el && el instanceof HTMLElement) {
    // Avoid duplicates
    if (!scoreCardRefs.value.includes(el)) {
      scoreCardRefs.value.push(el);
    }
  }
};

// Scroll all score cards to bottom
const scrollScoreCardsToBottom = () => {
  nextTick(() => {
    // Filter out any null/undefined refs and scroll
    scoreCardRefs.value
      .filter((scoreCard) => scoreCard)
      .forEach((scoreCard) => {
        scoreCard.scrollTop = scoreCard.scrollHeight;
      });
  });
};

// Get the column index of the active player (1-based for CSS grid)
const activePlayerColumn = computed(() => {
  const index = players.value.findIndex((p) => p.id === currentPlayerId.value);
  return index >= 0 ? index + 1 : 1;
});

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
  { immediate: true, deep: true },
);

// Load player legs when current leg changes
watch(
  () => currentLeg.value?.id,
  async (legId) => {
    if (legId) {
      currentPlayerLegs.value = await getPlayerLegsForLeg(legId);
    }
  },
  { immediate: true },
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
      }),
    );

    currentPlayerLegScores.value = scoresByPlayerId;
    // Scroll to bottom after scores are loaded
    scrollScoreCardsToBottom();
  },
  { immediate: true, deep: true },
);

// Watch for score changes and scroll to bottom
watch(
  () => currentPlayerLegScores.value,
  () => {
    scrollScoreCardsToBottom();
  },
  { deep: true },
);

// Load sets for match when in sets mode
watch(
  () => match.game,
  async () => {
    await loadMatchGame();
  },
  { immediate: true, deep: true },
);

const legWinNotification = ref<boolean>(false);
const resetGame = () => {
  emit("game-reset");
};

// Initialize match after players are loaded (onMounted runs after onBeforeMount)
onMounted(async () => {
  await initializeMatch();
});
</script>

<template>
  <div
    class="w-full min-h-screen h-full mx-auto flex flex-col gap-2 self-stretch x01-game"
  >
    <!-- Game Board -->

    <div class="flex flex-1 flex-col justify-content-center">
      <div class="font-bold text-white pb-3 px-2">
        <div class="flex justify-center text-sm items-center gap-4">
          <span
            class="text-md text-center"
            v-if="match.matchConfig.gamePlayedIn === X01_GAME_PLAYED_IN.sets"
          >
            Set {{ matchGame.length }} - Leg
            {{ currentSetGame.length }}
          </span>
          <span class="text-md" v-else>
            Leg
            {{ matchGame.length }}
          </span>
        </div>
      </div>
      <div class="flex-1 grid grid-cols-3 gap-4 text-sm pb-4 px-2">
        <PlayerComponent
          v-if="players[0]?.id"
          :player="players[0]"
          :realTimeScore="realTimePlayerScore(players[0].id)"
          :currentPlayerId="currentPlayerId"
          :currentLeg="currentLeg"
          :currentSet="currentSet"
          :matchGame="matchGame"
          :currentSetGame="currentSetGame"
        />
        <div class="flex flex-col gap-4" v-if="players[0] && players[1]">
          <div class="flex items-stretch gap-4">
            <div
              class="flex-1 text-center flex flex-wrap justify-center content-center self-stretch"
              :class="[
                'player-card relative rounded-xl',
                currentPlayerId === players[0]?.id ? 'active' : 'inactive',
              ]"
            >
              <div class="text-5xl font-bold text-white">
                {{ realTimePlayerScore(players[0]?.id) }}
              </div>
            </div>
            <div class="flex-shrink-0 grid grid-cols-3 gap-2">
              <template
                v-if="
                  match.matchConfig.gamePlayedIn === X01_GAME_PLAYED_IN.sets
                "
              >
                <div class="player-card rounded-xl inactive text-3xl font-bold">
                  {{ getPlayerWinnerCount(players[0]?.id, matchGame) }}
                </div>
                <div
                  class="text-center text-lg font-bold flex justify-center items-center"
                >
                  Sets
                </div>
                <div class="player-card rounded-xl inactive text-3xl font-bold">
                  {{ getPlayerWinnerCount(players[1]?.id, matchGame) }}
                </div>
              </template>
              <div class="player-card rounded-xl inactive text-3xl font-bold">
                {{ getPlayerWinnerCount(players[0]?.id, legsToDisplay) }}
              </div>
              <div
                class="text-center text-lg font-bold flex justify-center items-center"
              >
                Legs
              </div>
              <div class="player-card rounded-xl inactive text-3xl font-bold">
                {{ getPlayerWinnerCount(players[1]?.id, legsToDisplay) }}
              </div>
            </div>
            <div
              class="flex-1 text-center flex flex-wrap justify-center content-center self-stretch"
              :class="[
                'player-card relative rounded-xl',
                currentPlayerId === players[1]?.id ? 'active' : 'inactive',
              ]"
            >
              <div class="text-5xl font-bold text-white mb-2">
                {{ realTimePlayerScore(players[1]?.id) }}
              </div>
            </div>
          </div>
          <div
            :ref="setScoreCardRef"
            :class="`flex-1 grid grid-cols-${players.length} gap-4 score-card-container`"
          >
            <div
              v-for="player in players"
              :key="player.id"
              class="bg-gray-800 rounded-lg"
            >
              <div class="space-y-1 max-h-100 h-100 overflow-y-auto score-card">
                <div
                  v-for="(score, index) in currentPlayerLegScores[player.id] ||
                  []"
                  :key="`p1-${index}`"
                  :class="[
                    'flex justify-around items-center bg-gray-700 px-2 py-1',
                    index === 0 ? 'rounded-t-lg' : '',
                    players[1] && player.id === players[1].id
                      ? 'score-row--player-two'
                      : '',
                  ]"
                >
                  <span
                    class="text-xs total-darts text-gray-400"
                    title="Total darts"
                    >{{ (index + 1) * 3 }}</span
                  >

                  <span
                    class="font-bold text-xs start-score text-center"
                    title="Start score"
                    >({{ score.startScore }})
                  </span>

                  <span
                    class="font-bold text-lg flex-1 total-score text-center"
                    title="Total score thrown this turn"
                    >{{ score.totalScore }}</span
                  >
                </div>
                <div
                  v-if="(currentPlayerLegScores[player.id] || []).length === 0"
                  class="text-center text-gray-500 py-2 mt-4 text-sm"
                >
                  No scores yet
                </div>
              </div>
            </div>
          </div>
          <!-- Score Input -->
          <div
            class="align-self-end bg-gray-800 rounded-lg gap-4 px-2 py-3 grid"
            :class="`grid-cols-${players.length}`"
          >
            <div
              class="max-w-md mx-auto w-full"
              :style="{
                gridColumnStart: activePlayerColumn,
                gridColumnEnd: activePlayerColumn + 1,
              }"
            >
              <input
                ref="scoreInput"
                v-model="currentScore"
                type="number"
                min="0"
                max="180"
                class="score-input w-full border-2 text-lg py-2"
                placeholder="Enter score"
                @keyup.enter="submitScore"
                @keydown.ctrl.z.prevent="undoLastTurn"
                @input="validateScore"
              />
              <div
                v-if="scoreValidationMessage"
                class="text-xs mt-1 text-center text-red-400"
              >
                {{ scoreValidationMessage }}
              </div>
              <div class="flex gap-2 mt-3">
                <button
                  @click="submitScore"
                  :disabled="!isValidScore"
                  class="dartboard-button flex-1 py-2 rounded-bl-lg"
                >
                  Submit Score
                </button>
                <button
                  @click="undoLastTurn"
                  :disabled="!canUndo"
                  class="undo-button rounded-br-lg disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-3 transition-colors duration-200 text-sm"
                  title="Undo last turn (Ctrl+Z)"
                >
                  Undo
                </button>
              </div>
            </div>
          </div>
        </div>
        <PlayerComponent
          v-if="players[1]?.id"
          :player="players[1]"
          :realTimeScore="realTimePlayerScore(players[1].id)"
          :currentPlayerId="currentPlayerId"
          :currentLeg="currentLeg"
          :currentSet="currentSet"
          :currentSetGame="currentSetGame"
          :matchGame="matchGame"
        />
      </div>

      <!-- Match Status -->

      <!-- Current Scores -->

      <!-- Leg Win Notification -->
      <div
        v-if="legWinNotification"
        class="bg-gradient-to-r from-yellow-900 to-yellow-800 p-3 border-2 border-yellow-600 text-center"
      >
        <div class="text-yellow-100 font-bold text-lg">
          x🎯 {{ getPlayerDisplayName(currentPlayer) }} wins the leg!
        </div>
      </div>

      <!-- Game Over Modal -->
      <div
        v-if="match.winner"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div
          class="bg-gray-800 p-8 max-w-4xl w-full max-h-full mx-auto text-center overflow-y-auto"
        >
          <h2 class="text-3xl font-bold mb-4">Match Over!</h2>

          <!-- Match Summary -->
          <StatsMatchSummary :match="match" :open-details="true" />
          <div class="flex gap-2 py-4 justify-end">
            <button
              v-if="currentLeg"
              @click="undoLastTurn"
              :disabled="!canUndo"
              class="dartboard-button undo-button disabled:bg-gray-600 disabled:cursor-not-allowed"
              title="Undo last turn (Ctrl+Z)"
            >
              Undo
            </button>
            <button
              v-if="currentLeg"
              @click="resetGame"
              class="dartboard-button"
            >
              New Match
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.x01-game {
  margin-top: -1.25rem;
}
.score-card-container {
  max-height: 510px;
  overflow: scroll;
}

.total-darts {
  width: 30px;
}

.start-score {
  width: 40px;
}

.total-score {
  flex: 1;
}

.score-row--player-two .total-darts {
  order: 3;
  text-align: right;
}

.score-row--player-two .total-score {
  order: 1;
}

.score-row--player-two .start-score {
  order: 2;
}

.undo-button {
  background-color: #43588b;
}
.undo-button:hover:not(:disabled) {
  background-color: #5a6fa0;
}
</style>
