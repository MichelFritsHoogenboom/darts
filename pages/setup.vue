<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
  >
    <div class="container mx-auto px-4 py-8">
      <header class="text-center mb-8">
        <h1 class="text-4xl font-bold text-white mb-2">Game Configuration</h1>
      </header>

      <SetupPlayerSelector
        :available-players="players as Player[]"
        :selected-players="match.players as string[]"
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

<script setup lang="ts">
import { createMatch } from "../interfaces/match";
import type { Player } from "../interfaces/player";

// Page meta
definePageMeta({
  layout: false,
});

// Use players composable
const { players, loading, error, savePlayer, loadPlayers } = usePlayers();

// Use matches composable
const { saveMatch } = useMatches();

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
const startGame = async () => {
  if (!canStartGame.value) return;

  try {
    // Save match to database
    const savedMatch = await saveMatch(toRaw(match));

    // Navigate to match page with match ID
    navigateTo(`/match/${savedMatch.id}`);
  } catch (err) {
    console.error("Failed to save match:", err);
    // You could show a toast notification here
  }
};

const goBack = () => {
  navigateTo("/");
};

// Handle player form submission
const handlePlayerSubmit = async (playerData: Player) => {
  try {
    await savePlayer(playerData);
    showPlayerForm.value = false;
  } catch (err) {
    console.error("Failed to save player:", err);
    // You could show a toast notification here
  }
};

// Player selection methods
const addPlayerToMatch = (playerId: string) => {
  const player = players.value.find((p) => p.id === playerId);
  if (player && !match.players.find((id) => id === playerId)) {
    match.players.push(playerId);
  }
};

const removePlayerFromMatch = (playerId: string) => {
  const index = match.players.findIndex((id) => id === playerId);
  if (index > -1) {
    match.players.splice(index, 1);
  }
};
</script>
