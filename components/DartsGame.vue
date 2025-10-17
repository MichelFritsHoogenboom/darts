<template>
  <div class="max-w-6xl mx-auto">
    <!-- Game Board -->
    <div class="space-y-4">
      <!-- Match Status -->
      <div class="bg-gray-800 rounded-xl p-4 text-center">
        <div class="text-lg font-bold text-white mb-2">
          <span v-if="props.matchConfig.type === 'sets'">
            Set {{ currentSet }} - Leg {{ currentLeg }} of
            {{ props.matchConfig.legsPerSet }}
          </span>
          <span v-else>
            Leg {{ currentLeg }} of {{ props.matchConfig.numberOfLegs }}
          </span>
        </div>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div class="bg-gray-700 rounded-lg p-2">
            <div class="font-bold text-dartboard-red">
              {{ currentLegState.player1.name }}
            </div>
            <div v-if="props.matchConfig.type === 'sets'">
              Sets: {{ player1SetsWon }}/{{ props.matchConfig.setsToWin }}
            </div>
            <div>Current Set Legs: {{ currentSet.legsWon.player1 }}</div>
          </div>
          <div class="bg-gray-700 rounded-lg p-2">
            <div class="font-bold text-dartboard-red">
              {{ currentLegState.player2.name }}
            </div>
            <div v-if="props.matchConfig.type === 'sets'">
              Sets: {{ player2SetsWon }}/{{ props.matchConfig.setsToWin }}
            </div>
            <div>Current Set Legs: {{ currentSet.legsWon.player2 }}</div>
          </div>
        </div>
      </div>

      <!-- Current Scores -->
      <div class="grid md:grid-cols-2 gap-4">
        <div
          :class="['player-card', currentPlayer === 1 ? 'active' : 'inactive']"
        >
          <div class="text-center">
            <h3 class="text-xl font-bold mb-1">
              {{ currentLegState.player1.name }}
            </h3>
            <div class="text-4xl font-bold text-dartboard-red mb-2">
              {{ currentLegState.player1.score }}
            </div>
            <div class="text-xs text-gray-400">
              Current Turn: {{ currentPlayer === 1 ? "Yes" : "No" }}
            </div>
          </div>
        </div>

        <div
          :class="['player-card', currentPlayer === 2 ? 'active' : 'inactive']"
        >
          <div class="text-center">
            <h3 class="text-xl font-bold mb-1">
              {{ currentLegState.player2.name }}
            </h3>
            <div class="text-4xl font-bold text-dartboard-red mb-2">
              {{ currentLegState.player2.score }}
            </div>
            <div class="text-xs text-gray-400">
              Current Turn: {{ currentPlayer === 2 ? "Yes" : "No" }}
            </div>
          </div>
        </div>
      </div>

      <!-- Score Input -->
      <div class="bg-gray-800 rounded-xl p-4">
        <h3 class="text-xl font-bold text-center mb-3">
          {{
            currentPlayer === 1
              ? currentLegState.player1.name
              : currentLegState.player2.name
          }}'s Turn
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
          🎯 {{ legWinNotification }}
        </div>
      </div>

      <!-- Checkout Suggestions -->
      <CheckoutSuggestions
        v-if="!gameOver"
        :player-name="
          currentPlayer === 1
            ? currentLegState.player1.name
            : currentLegState.player2.name
        "
        :score="currentPlayerScore"
      />

      <!-- Score History -->
      <div class="grid md:grid-cols-2 gap-4">
        <div class="bg-gray-800 rounded-xl p-3">
          <h4 class="text-lg font-bold mb-2 text-center">
            {{ currentLegState.player1.name }}'s Scores
          </h4>
          <div class="space-y-1 max-h-32 overflow-y-auto">
            <div
              v-for="(score, index) in currentLegState.player1.scores"
              :key="`p1-${index}`"
              class="flex justify-between items-center bg-gray-700 rounded px-2 py-1"
            >
              <span class="text-xs text-gray-400">{{ index + 1 }}</span>
              <span class="font-bold text-sm">{{ score }}</span>
            </div>
            <div
              v-if="currentLegState.player1.scores.length === 0"
              class="text-center text-gray-500 py-2 text-sm"
            >
              No scores yet
            </div>
          </div>
        </div>

        <div class="bg-gray-800 rounded-xl p-3">
          <h4 class="text-lg font-bold mb-2 text-center">
            {{ currentLegState.player2.name }}'s Scores
          </h4>
          <div class="space-y-1 max-h-32 overflow-y-auto">
            <div
              v-for="(score, index) in currentLegState.player2.scores"
              :key="`p2-${index}`"
              class="flex justify-between items-center bg-gray-700 rounded px-2 py-1"
            >
              <span class="text-xs text-gray-400">{{ index + 1 }}</span>
              <span class="font-bold text-sm">{{ score }}</span>
            </div>
            <div
              v-if="currentLegState.player2.scores.length === 0"
              class="text-center text-gray-500 py-2 text-sm"
            >
              No scores yet
            </div>
          </div>
        </div>
      </div>

      <!-- Game Over Modal -->
      <div
        v-if="gameOver"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div class="bg-gray-800 rounded-xl p-8 max-w-md mx-auto text-center">
          <h2 class="text-3xl font-bold mb-4 text-dartboard-green">
            🎉 Match Over!
          </h2>
          <p class="text-xl mb-4">
            <span class="font-bold">{{ winner.name }}</span> wins!
          </p>

          <!-- Match Summary -->
          <div class="bg-gray-700 rounded-lg p-4 mb-6">
            <h3 class="text-lg font-bold mb-2">Final Score</h3>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div class="font-bold text-dartboard-red">
                  {{ currentLegState.player1.name }}
                </div>
                <div v-if="props.matchConfig.type === 'sets'">
                  Sets: {{ player1SetsWon }}/{{ props.matchConfig.setsToWin }}
                </div>
                <div>
                  Total Legs Won:
                  {{
                    match.sets.reduce(
                      (total, set) => total + set.legsWon.player1,
                      0
                    )
                  }}
                </div>
              </div>
              <div>
                <div class="font-bold text-dartboard-red">
                  {{ currentLegState.player2.name }}
                </div>
                <div v-if="props.matchConfig.type === 'sets'">
                  Sets: {{ player2SetsWon }}/{{ props.matchConfig.setsToWin }}
                </div>
                <div>
                  Total Legs Won:
                  {{
                    match.sets.reduce(
                      (total, set) => total + set.legsWon.player2,
                      0
                    )
                  }}
                </div>
              </div>
            </div>
          </div>

          <button @click="resetGame" class="dartboard-button">New Match</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch, onMounted } from "vue";
import { isAchievableScore } from "~/utils/dartScoring.js";
import {
  getLegsNeededToWinSet,
  hasWonSet,
  hasWonMatch,
} from "~/utils/matchLogic.js";
import CheckoutSuggestions from "~/components/CheckoutSuggestions.vue";

// Props
const props = defineProps({
  player1Name: {
    type: String,
    required: true,
  },
  player2Name: {
    type: String,
    required: true,
  },
  matchConfig: {
    type: Object,
    required: true,
    default: () => ({
      type: "legs",
      numberOfLegs: 5,
      legsPerSet: 3,
      setsToWin: 2,
    }),
  },
});

// Emits
const emit = defineEmits(["game-reset"]);

// Game state
const currentPlayer = ref(1);
const currentScore = ref("");
const gameOver = ref(false);
const scoreValidationMessage = ref("");

// Match state
const currentSet = ref(1);
const currentLeg = ref(1);
const matchOver = ref(false);
const legStartPlayer = ref(1); // Who starts each leg
const legWinNotification = ref("");

// Match data structure
const match = ref({
  sets: [
    {
      setNumber: 1,
      legs: [],
      legsWon: { player1: 0, player2: 0 },
      setWinner: null,
    },
  ],
  currentSet: 1,
  currentLeg: 1,
  legStartPlayer: 1,
});

// Current leg state
const currentLegState = ref({
  player1: {
    name: props.player1Name,
    score: 501,
    scores: [],
  },
  player2: {
    name: props.player2Name,
    score: 501,
    scores: [],
  },
});

// Game history for undo functionality
const gameHistory = ref([]);

// Refs
const scoreInput = ref(null);

// Computed
const isValidScore = computed(() => {
  const score = parseInt(currentScore.value);
  return (
    score >= 0 && score <= 180 && !isNaN(score) && isAchievableScore(score)
  );
});

const currentPlayerScore = computed(() => {
  return currentPlayer.value === 1
    ? currentLegState.value.player1.score
    : currentLegState.value.player2.score;
});

// Get current set
const currentSet = computed(() => {
  return match.value.sets.find(
    (set) => set.setNumber === match.value.currentSet
  );
});

// Get total sets won by each player
const player1SetsWon = computed(() => {
  return match.value.sets.filter((set) => set.setWinner === "player1").length;
});

const player2SetsWon = computed(() => {
  return match.value.sets.filter((set) => set.setWinner === "player2").length;
});

const canUndo = computed(() => {
  return gameHistory.value.length > 0 && !gameOver.value;
});

const winner = computed(() => {
  if (matchOver.value) {
    if (props.matchConfig.type === "sets") {
      return player1SetsWon.value >= props.matchConfig.setsToWin
        ? currentLegState.value.player1
        : currentLegState.value.player2;
    } else {
      const legsNeeded = Math.ceil(props.matchConfig.numberOfLegs / 2);
      return player1SetsWon.value >= legsNeeded
        ? currentLegState.value.player1
        : currentLegState.value.player2;
    }
  }
  return null;
});

// Methods
const initializeGame = () => {
  currentPlayer.value = 1;
  currentScore.value = "";
  gameOver.value = false;
  matchOver.value = false;
  scoreValidationMessage.value = "";
  gameHistory.value = [];
  legWinNotification.value = "";

  // Reset match data structure
  match.value = {
    sets: [
      {
        setNumber: 1,
        legs: [],
        legsWon: { player1: 0, player2: 0 },
        setWinner: null,
      },
    ],
    currentSet: 1,
    currentLeg: 1,
    legStartPlayer: 1,
  };

  // Reset current leg state
  currentLegState.value = {
    player1: {
      name: props.player1Name,
      score: 501,
      scores: [],
    },
    player2: {
      name: props.player2Name,
      score: 501,
      scores: [],
    },
  };

  // Focus on score input
  nextTick(() => {
    scoreInput.value?.focus();
  });
};

const submitScore = () => {
  if (!isValidScore.value) return;

  const score = parseInt(currentScore.value);
  const player =
    currentPlayer.value === 1
      ? currentLegState.value.player1
      : currentLegState.value.player2;

  // Check if score would go below 0
  if (player.score - score < 0) {
    alert("Score cannot go below zero!");
    return;
  }

  // Check if score would result in 1 (bust)
  if (player.score - score === 1) {
    alert("Bust! Cannot finish on 1. Score not counted.");
    return;
  }

  // Save current state to history before making changes
  saveGameState();

  // Update player score
  player.score -= score;
  player.scores.push(score);

  // Clear validation message
  scoreValidationMessage.value = "";

  // Check for win condition
  if (player.score === 0) {
    handleLegWin();
    return;
  }

  // Switch players
  currentPlayer.value = currentPlayer.value === 1 ? 2 : 1;
  currentScore.value = "";

  // Focus on score input for next player
  nextTick(() => {
    scoreInput.value?.focus();
  });
};

const validateScore = () => {
  const score = parseInt(currentScore.value);
  if (isNaN(score)) {
    scoreValidationMessage.value = "";
    return;
  }

  if (score > 180) {
    scoreValidationMessage.value = "Maximum score is 180. Did you mistype?";
  } else if (score < 0) {
    scoreValidationMessage.value = "Score cannot be negative.";
  } else if (!isAchievableScore(score)) {
    scoreValidationMessage.value = `Score ${score} is not achievable with 3 darts.`;
  } else {
    scoreValidationMessage.value = "";
  }
};

const saveGameState = () => {
  const state = {
    player1: {
      name: player1.value.name,
      score: player1.value.score,
      scores: [...player1.value.scores],
      setsWon: player1.value.setsWon,
      legsWon: player1.value.legsWon,
      currentSetLegs: player1.value.currentSetLegs,
    },
    player2: {
      name: player2.value.name,
      score: player2.value.score,
      scores: [...player2.value.scores],
      setsWon: player2.value.setsWon,
      legsWon: player2.value.legsWon,
      currentSetLegs: player2.value.currentSetLegs,
    },
    currentPlayer: currentPlayer.value,
    gameOver: gameOver.value,
    matchOver: matchOver.value,
    currentSet: currentSet.value,
    currentLeg: currentLeg.value,
    legStartPlayer: legStartPlayer.value,
    legWinNotification: legWinNotification.value,
  };
  gameHistory.value.push(state);
};

const undoLastTurn = () => {
  if (!canUndo.value) return;

  const lastState = gameHistory.value.pop();
  if (lastState) {
    // Restore player data
    player1.value.name = lastState.player1.name;
    player1.value.score = lastState.player1.score;
    player1.value.scores = lastState.player1.scores;
    player1.value.setsWon = lastState.player1.setsWon;
    player1.value.legsWon = lastState.player1.legsWon;
    player1.value.currentSetLegs = lastState.player1.currentSetLegs;

    player2.value.name = lastState.player2.name;
    player2.value.score = lastState.player2.score;
    player2.value.scores = lastState.player2.scores;
    player2.value.setsWon = lastState.player2.setsWon;
    player2.value.legsWon = lastState.player2.legsWon;
    player2.value.currentSetLegs = lastState.player2.currentSetLegs;

    // Restore game state
    currentPlayer.value = lastState.currentPlayer;
    gameOver.value = lastState.gameOver;
    matchOver.value = lastState.matchOver;
    currentSet.value = lastState.currentSet;
    currentLeg.value = lastState.currentLeg;
    legStartPlayer.value = lastState.legStartPlayer;
    legWinNotification.value = lastState.legWinNotification;

    currentScore.value = "";
    scoreValidationMessage.value = "";

    // Focus on score input
    nextTick(() => {
      scoreInput.value?.focus();
    });
  }
};

const handleLegWin = () => {
  const winnerPlayer = currentPlayer.value === 1 ? "player1" : "player2";
  const winnerName =
    currentPlayer.value === 1
      ? currentLegState.value.player1.name
      : currentLegState.value.player2.name;

  // Show leg win notification
  legWinNotification.value = `${winnerName} wins the leg!`;

  // Add leg to current set
  const currentSetData = currentSet.value;
  currentSetData.legs.push({
    legNumber: match.value.currentLeg,
    winner: winnerPlayer,
    scores: {
      player1: [...currentLegState.value.player1.scores],
      player2: [...currentLegState.value.player2.scores],
    },
  });

  // Update legs won in current set
  currentSetData.legsWon[winnerPlayer]++;

  // Check if this completes a set (for sets matches)
  if (props.matchConfig.type === "sets") {
    const legsNeeded = getLegsNeededToWinSet(
      props.matchConfig.winCondition,
      props.matchConfig.legsPerSet
    );

    if (currentSetData.legsWon[winnerPlayer] >= legsNeeded) {
      // Winner wins the set
      currentSetData.setWinner = winnerPlayer;

      // Check if match is over
      const totalSetsWon = match.value.sets.filter(
        (set) => set.setWinner === winnerPlayer
      ).length;
      if (totalSetsWon >= props.matchConfig.setsToWin) {
        matchOver.value = true;
        gameOver.value = true;
        return;
      }

      // Start new set
      match.value.currentSet++;
      match.value.currentLeg = 1;
      match.value.legStartPlayer = match.value.legStartPlayer === 1 ? 2 : 1;

      // Add new set
      match.value.sets.push({
        setNumber: match.value.currentSet,
        legs: [],
        legsWon: { player1: 0, player2: 0 },
        setWinner: null,
      });
    } else {
      // Continue current set
      match.value.currentLeg++;
      match.value.legStartPlayer = match.value.legStartPlayer === 1 ? 2 : 1;
    }
  } else {
    // Legs match - check if match is over
    const totalLegsWon = match.value.sets.reduce(
      (total, set) => total + set.legsWon[winnerPlayer],
      0
    );
    if (totalLegsWon >= Math.ceil(props.matchConfig.numberOfLegs / 2)) {
      matchOver.value = true;
      gameOver.value = true;
      return;
    }

    // Continue to next leg
    match.value.currentLeg++;
    match.value.legStartPlayer = match.value.legStartPlayer === 1 ? 2 : 1;
  }

  // Clear notification after 3 seconds
  setTimeout(() => {
    legWinNotification.value = "";
  }, 3000);

  // Reset scores for next leg
  resetLegScores();
};

const resetLegScores = () => {
  currentLegState.value.player1.score = 501;
  currentLegState.value.player1.scores = [];
  currentLegState.value.player2.score = 501;
  currentLegState.value.player2.scores = [];
  currentPlayer.value = match.value.legStartPlayer; // Start with the correct player
  currentScore.value = "";
  scoreValidationMessage.value = "";

  // Focus on score input
  nextTick(() => {
    scoreInput.value?.focus();
  });
};

const resetGame = () => {
  emit("game-reset");
};

// Initialize game when component mounts
onMounted(() => {
  initializeGame();
});

// Watch for game over
watch(gameOver, (newValue) => {
  if (newValue) {
    // Auto-focus on play again button after a short delay
    setTimeout(() => {
      const playAgainBtn = document.querySelector(".dartboard-button");
      playAgainBtn?.focus();
    }, 100);
  }
});
</script>
