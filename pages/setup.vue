<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
  >
    <div class="container mx-auto px-4 py-8">
      <header class="text-center mb-8">
        <h1 class="text-4xl font-bold text-white mb-2">Game Configuration</h1>
      </header>

      <SetupPlayerSelector
        :available-players="players"
        :selected-players="match.players"
        :loading="loading"
        :error="error"
        @add-player="showPlayerForm = true"
        @select-player="addPlayerToMatch"
        @remove-player="removePlayerFromMatch"
      />

      <SetupX01MatchSetup v-model="match.matchConfig" />
      <FormButton @click="startGame" :disabled="!canStartGame"
        >Start Game</FormButton
      >
      <!-- Player Form Modal -->
      <UiModal v-model="showPlayerForm">
        <template #title>Add New Player</template>

        <FormPlayerForm
          @submit="handlePlayerSubmit"
          @cancel="showPlayerForm = false"
        ></FormPlayerForm>
      </UiModal>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onBeforeMount } from "vue";
import { createMatch } from "~/interfaces/match";
import { usePlayers } from "~/composables/usePlayers";

// Page meta
definePageMeta({
  layout: false,
});

// Use players composable
const { players, loading, error, savePlayer, loadPlayers } = usePlayers();

// Reactive data
const match = reactive(createMatch());

const showPlayerForm = ref(false);

// Load players on mount
onBeforeMount(async () => {
  await loadPlayers();
});

// Computed
const canStartGame = computed(() => {
  return match.players.length > 1;
});

// Methods
const startGame = () => {
  if (!canStartGame.value) return;

  // Navigate to game with match configuration
  navigateTo({
    path: "/game",
    query: {
      matchConfig: JSON.stringify(match.matchConfig),
      players: JSON.stringify(match.players),
    },
  });
};

const goBack = () => {
  navigateTo("/");
};

// Handle player form submission
const handlePlayerSubmit = async (playerData) => {
  try {
    await savePlayer(playerData);
    showPlayerForm.value = false;
    console.log("Player saved successfully:", playerData);
  } catch (err) {
    console.error("Failed to save player:", err);
    // You could show a toast notification here
  }
};

// Player selection methods
const addPlayerToMatch = (playerId) => {
  const player = players.value.find((p) => p.id === playerId);
  if (player && !match.players.find((p) => p.id === playerId)) {
    match.players.push(player);
  }
};

const removePlayerFromMatch = (playerId) => {
  const index = match.players.findIndex((p) => p.id === playerId);
  if (index > -1) {
    match.players.splice(index, 1);
  }
};
</script>
