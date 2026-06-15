<script setup lang="ts">
import type { Match } from "~/interfaces/match";
import type { Score } from "~/interfaces/leg";

import { X01_GAME_PLAYED_IN } from "~/interfaces/x01MatchConfig";
import { getPlayerWinnerCount } from "~/utils/match";
import { getPlayerDisplayName } from "~/utils/player";

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
  pendingLegWin,
  pendingGoldenCamel,
  confirmLegFinish,
  confirmGoldenCamel,
} = useX01Game(match, gameState);

const { getScoresForMatch } = useScores();
const { $listen, $unlisten } = useNuxtApp();

const camelLeaderPlayerId = ref<string | null>(null);

const countGoldenCamels = (scores: Score[], playerId: string) =>
  scores.filter(
    (s) => s.playerId === playerId && s.totalScore === 26 && s.isGoldenCamel,
  ).length;

const refreshCamelLeader = async () => {
  if (players.value.length < 2) {
    camelLeaderPlayerId.value = null;
    return;
  }

  const scores = await getScoresForMatch(match.id);
  const counts = players.value.map((p) => ({
    id: p.id,
    count: countGoldenCamels(scores, p.id),
  }));

  const max = Math.max(...counts.map((c) => c.count));
  if (max === 0) {
    camelLeaderPlayerId.value = null;
    return;
  }

  const leaders = counts.filter((c) => c.count === max);
  camelLeaderPlayerId.value = leaders.length === 1 ? leaders[0].id : null;
};

const scoreInputBlocked = computed(
  () => !!pendingLegWin.value || !!pendingGoldenCamel.value,
);

const pendingLegWinnerName = computed(() =>
  pendingLegWin.value && currentPlayer.value
    ? getPlayerDisplayName(currentPlayer.value)
    : "",
);

const legFinishOptions = [
  { label: "1 pijl", value: 1 },
  { label: "2 pijlen", value: 2 },
  { label: "3 pijlen", value: 3 },
];

const goldenCamelOptions = [
  { label: "Ja, gouden kameel", value: true },
  { label: "Nee", value: false },
];

const handleLegFinishSelect = (value: string | number | boolean) => {
  if (value === 1 || value === 2 || value === 3) {
    confirmLegFinish(value);
  }
};

const handleGoldenCamelSelect = (value: string | number | boolean) => {
  if (typeof value === "boolean") {
    confirmGoldenCamel(value);
  }
};
watch(
  () => players.value.length,
  (length) => {
    if (length >= 2) {
      refreshCamelLeader();
    }
  },
);

onMounted(() => {
  $listen("score-submitted", refreshCamelLeader);
  $listen("undo-last-turn", refreshCamelLeader);
  $listen("leg-finished", refreshCamelLeader);
});

onBeforeUnmount(() => {
  $unlisten("score-submitted", refreshCamelLeader);
  $unlisten("undo-last-turn", refreshCamelLeader);
  $unlisten("leg-finished", refreshCamelLeader);
});

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

const scoreInputGapRem = 1; // matches gap-4 between columns

const scoreInputPositionStyle = computed(() => {
  const columnCount = players.value.length || 1;
  const columnIndex = Math.max(0, activePlayerColumn.value - 1);

  if (columnCount === 1) {
    return { width: "100%", left: "0" };
  }

  const columnWidth = `calc((100% - ${(columnCount - 1) * scoreInputGapRem}rem) / ${columnCount})`;
  const left =
    columnIndex === 0
      ? "0"
      : `calc(${columnIndex} * ((100% - ${(columnCount - 1) * scoreInputGapRem}rem) / ${columnCount} + ${scoreInputGapRem}rem))`;

  return { width: columnWidth, left };
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

const resetGame = () => {
  emit("game-reset");
};

// Initialize match after players are loaded (onMounted runs after onBeforeMount)
onMounted(async () => {
  await initializeMatch();
  await refreshCamelLeader();
});
</script>

<template>
  <div
    class="w-full min-h-screen h-full mx-auto flex flex-col gap-2 self-stretch x01-game"
  >
    <!-- Game Board -->

    <div class="flex flex-1 flex-col justify-content-center">
      <div class="font-bold text-white pb-3 px-2">
        <div class="flex justify-center items-center gap-4">
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
      <div class="flex-1 grid grid-cols-3 gap-4 pb-4 px-2">
        <PlayerComponent
          v-if="players[0]?.id"
          :player="players[0]"
          :realTimeScore="realTimePlayerScore(players[0].id)"
          :currentPlayerId="currentPlayerId"
          :currentLeg="currentLeg"
          :currentSet="currentSet"
          :matchGame="matchGame"
          :currentSetGame="currentSetGame"
          :showGoldenCamel="camelLeaderPlayerId === players[0].id"
        />
        <div class="flex flex-col gap-4" v-if="players[0] && players[1]">
          <div class="flex items-stretch score-board gap-4">
            <div
              class="flex-1 text-center font-oswald flex flex-wrap justify-center content-center self-stretch"
              :class="[
                'player-card relative rounded-xl',
                currentPlayerId === players[0]?.id ? 'active' : 'inactive',
              ]"
            >
              <div class="text-5xl font-bold text-white">
                {{ realTimePlayerScore(players[0]?.id) }}
              </div>
            </div>
            <div class="flex-shrink-0 font-oswald grid grid-cols-3 gap-2">
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
              <div
                class="player-card rounded-xl inactive text-3xl font-bold flex items-center justify-center"
              >
                {{ getPlayerWinnerCount(players[0]?.id, legsToDisplay) }}
              </div>
              <div
                class="text-center text-lg font-bold flex justify-center items-center"
              >
                Legs
              </div>
              <div
                class="player-card rounded-xl inactive text-3xl font-bold flex items-center justify-center"
              >
                {{ getPlayerWinnerCount(players[1]?.id, legsToDisplay) }}
              </div>
            </div>
            <div
              class="flex-1 text-center font-oswald flex flex-wrap justify-center content-center self-stretch"
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
                    class="total-darts text-gray-400 text-xs"
                    title="Total darts"
                    >{{ (index + 1) * 3 }}</span
                  >

                  <span
                    class="font-bold text-sm start-score text-center"
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
          <div class="align-self-end bg-gray-800 rounded-lg px-2 py-3">
            <div class="score-input-track relative">
              <div
                class="score-input-slider absolute top-0 max-w-md w-full"
                :style="scoreInputPositionStyle"
              >
                <input
                  ref="scoreInput"
                  v-model="currentScore"
                  type="number"
                  min="0"
                  max="180"
                  class="score-input w-full border-2 text-lg py-2 disabled:cursor-not-allowed disabled:opacity-60"
                  placeholder="Enter score"
                  :disabled="scoreInputBlocked"
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
                    :disabled="!isValidScore || scoreInputBlocked"
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
          :showGoldenCamel="camelLeaderPlayerId === players[1].id"
        />
      </div>

      <!-- Match Status -->

      <!-- Current Scores -->

      <GamesX01DecisionModal
        :visible="!!pendingLegWin"
        :title="`${pendingLegWinnerName} wint de leg!`"
        description="Hoeveel pijlen?"
        :options="legFinishOptions"
        @select="handleLegFinishSelect"
        @undo="undoLastTurn"
      />

      <GamesX01DecisionModal
        :visible="!!pendingGoldenCamel"
        title="Gouden kameel?"
        description="Was dit 20, 1 en 5?"
        :options="goldenCamelOptions"
        @select="handleGoldenCamelSelect"
        @undo="undoLastTurn"
      />

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
  overflow: auto;
}

.total-darts {
  width: 20px;
  line-height: 1;
}

.start-score {
  width: 40px;
}

.total-score {
  flex: 1;
  text-align: right;
  padding-inline: 35px;
  @apply font-oswald;
  font-weight: 500;
}

.score-row--player-two .total-darts {
  order: 3;
  text-align: right;
}

.score-row--player-two .total-score {
  order: 1;
  text-align: left;
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

.score-board .player-card {
  line-height: unset;
}

.score-input-track {
  min-height: 7.5rem;
}

.score-input-slider {
  transition:
    left 0.2s ease-in-out,
    width 0.2s ease-in-out;
}

@media (prefers-reduced-motion: reduce) {
  .score-input-slider {
    transition: none;
  }
}
</style>
