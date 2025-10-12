<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
  >
    <div class="container mx-auto px-4 py-8">
      <header class="text-center mb-8">
        <h1 class="text-4xl font-bold text-white mb-2">🎯 Darts Game Setup</h1>
        <p class="text-lg text-gray-300">501 - First to Zero Wins!</p>
      </header>

      <div class="max-w-2xl mx-auto">
        <div class="bg-gray-800 rounded-xl p-8">
          <h2 class="text-2xl font-bold text-center mb-6">
            Enter Player Names
          </h2>

          <div class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">
                Player 1 Name
              </label>
              <input
                v-model="player1Name"
                type="text"
                class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-dartboard-red focus:outline-none text-lg"
                placeholder="Enter Player 1 name"
                @keyup.enter="startGame"
                ref="player1Input"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">
                Player 2 Name
              </label>
              <input
                v-model="player2Name"
                type="text"
                class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-dartboard-red focus:outline-none text-lg"
                placeholder="Enter Player 2 name"
                @keyup.enter="startGame"
              />
            </div>

            <!-- Match Type Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-3">
                Match Type
              </label>
              <div class="grid grid-cols-2 gap-3">
                <button
                  @click="matchType = 'sets'"
                  :class="[
                    'py-3 px-4 rounded-lg font-medium transition-colors duration-200',
                    matchType === 'sets'
                      ? 'bg-dartboard-red text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600',
                  ]"
                >
                  Sets
                </button>
                <button
                  @click="matchType = 'legs'"
                  :class="[
                    'py-3 px-4 rounded-lg font-medium transition-colors duration-200',
                    matchType === 'legs'
                      ? 'bg-dartboard-red text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600',
                  ]"
                >
                  Legs
                </button>
              </div>
            </div>

            <!-- Sets Configuration -->
            <div v-if="matchType === 'sets'" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">
                  Legs per Set (max 5)
                </label>
                <select
                  v-model="legsPerSet"
                  class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-dartboard-red focus:outline-none"
                >
                  <option value="1">1 leg</option>
                  <option value="2">2 legs</option>
                  <option value="3">3 legs</option>
                  <option value="4">4 legs</option>
                  <option value="5">5 legs</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">
                  Sets to Win
                </label>
                <select
                  v-model="setsToWin"
                  class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-dartboard-red focus:outline-none"
                >
                  <option value="1">1 set</option>
                  <option value="2">2 sets</option>
                  <option value="3">3 sets</option>
                  <option value="4">4 sets</option>
                  <option value="5">5 sets</option>
                </select>
              </div>
            </div>

            <!-- Legs Configuration -->
            <div v-if="matchType === 'legs'">
              <label class="block text-sm font-medium text-gray-300 mb-2">
                Number of Legs
              </label>
              <input
                v-model="numberOfLegs"
                type="number"
                min="1"
                max="50"
                class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-dartboard-red focus:outline-none text-lg"
                placeholder="Enter number of legs"
              />
            </div>
          </div>

          <div class="flex gap-4 mt-8">
            <button
              @click="startGame"
              :disabled="!canStartGame"
              class="dartboard-button flex-1 text-lg py-3"
            >
              Start Game
            </button>
            <button
              @click="goBack"
              class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Back
            </button>
          </div>

          <!-- Quick Start Options -->
          <div class="mt-8 pt-6 border-t border-gray-600">
            <h3 class="text-lg font-semibold text-gray-300 mb-4 text-center">
              Quick Start
            </h3>
            <div class="grid grid-cols-2 gap-3">
              <button
                @click="quickStart('Player 1', 'Player 2')"
                class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Player 1 vs Player 2
              </button>
              <button
                @click="quickStart('Michel', 'Mike')"
                class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Michel vs Mike
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

// Page meta
definePageMeta({
  layout: false,
});

// Reactive data
const player1Name = ref("");
const player2Name = ref("");
const player1Input = ref(null);

// Match configuration
const matchType = ref("sets");
const legsPerSet = ref(3);
const setsToWin = ref(2);
const numberOfLegs = ref(5);

// Computed
const canStartGame = computed(() => {
  const namesValid = player1Name.value.trim() && player2Name.value.trim();
  if (matchType.value === "legs") {
    return namesValid && numberOfLegs.value > 0;
  }
  return namesValid;
});

// Methods
const startGame = () => {
  if (!canStartGame.value) return;

  // Prepare match configuration
  const matchConfig = {
    type: matchType.value,
    ...(matchType.value === "sets"
      ? {
          legsPerSet: String(legsPerSet.value),
          setsToWin: String(setsToWin.value),
        }
      : { numberOfLegs: String(numberOfLegs.value) }),
  };

  // Navigate to game with player data and match configuration
  const queryParams = {
    player1: player1Name.value.trim(),
    player2: player2Name.value.trim(),
    ...matchConfig,
  };

  navigateTo({
    path: "/game",
    query: queryParams,
  });
};

const quickStart = (name1, name2) => {
  player1Name.value = name1;
  player2Name.value = name2;
  startGame();
};

const goBack = () => {
  navigateTo("/");
};

// Focus on first input when page loads
onMounted(() => {
  player1Input.value?.focus();
});
</script>
