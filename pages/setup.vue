<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
  >
    <div class="container mx-auto px-4 py-8">
      <header class="text-center mb-8">
        <h1 class="text-4xl font-bold text-white mb-2">Game Configuration</h1>
      </header>

      <div class="max-w-2xl mx-auto">
        <div class="bg-gray-800 rounded-xl p-8 mb-6">
          <h2 class="text-2xl font-bold text-center mb-6">Players</h2>
          <div class="flex justify-center">
            <button
              @click="showPlayerForm = true"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-dartboard-red hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dartboard-red"
            >
              Add Player
            </button>
          </div>
        </div>
        <SetupX01MatchSetup v-model="match.matchConfig" />
        <div class="bg-gray-800 rounded-xl">
          <!-- Start Game Button -->
          <div class="flex justify-center">
            <FormButton @click="startGame" :disabled="!canStartGame" size="lg">
              Start Game
            </FormButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Player Form Modal -->
    <UiModal v-model="showPlayerForm">
      <template #title>Add New Player</template>

      <FormPlayerForm
        @submit="handlePlayerSubmit"
        @cancel="showPlayerForm = false"
      />
    </UiModal>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from "vue";
import { createMatch } from "~/interfaces/match";

// Page meta
definePageMeta({
  layout: false,
});

// Reactive data
const match = reactive(createMatch());
const player1Name = ref("");
const player2Name = ref("");
const showPlayerForm = ref(false);

// Computed
const canStartGame = computed(() => {
  return player1Name.value.trim() && player2Name.value.trim();
});

// Methods
const startGame = () => {
  if (!canStartGame.value) return;

  // Navigate to game with match configuration
  navigateTo({
    path: "/game",
    query: {
      player1: player1Name.value.trim(),
      player2: player2Name.value.trim(),
      matchConfig: JSON.stringify(match.matchConfig),
    },
  });
};

const goBack = () => {
  navigateTo("/");
};

// Handle player form submission
const handlePlayerSubmit = (playerData) => {
  console.log("Player submitted:", playerData);
  showPlayerForm.value = false;
  // TODO: Add player to your player management system
};
</script>
