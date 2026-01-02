<template>
  <NuxtLayout name="default">
    <template #title>
      <h1 class="text-xl font-bold text-white mb-2">
        Game Configuration
      </h1></template
    >
    <div class="max-w-4xl mx-auto">
      <SetupPlayerSelector
        ref="playerSelectorRef"
        :available-players="players as Player[]"
        :selected-players="selectedPlayers"
        :loading="loading"
        :error="error"
        @add-player="showPlayerForm = true"
        @select-player="addPlayerToMatch"
        @remove-player="removePlayerFromMatch"
      />

      <SetupX01MatchSetup v-model="match.matchConfig">
        <template #footer>
          <FormButton @click="startGame" :disabled="!canStartGame"
            >Start Game</FormButton
          >
        </template>
      </SetupX01MatchSetup>

      <!-- Player Form Modal -->
      <UiModal v-model="showPlayerForm">
        <template #title>Add New Player</template>

        <FormPlayerForm
          @submit="handlePlayerSubmit"
          @cancel="showPlayerForm = false"
        ></FormPlayerForm>
      </UiModal>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { createMatch } from "../interfaces/match";
import type { Player } from "../interfaces/player";
import { createPlayerStats } from "../interfaces/stats";

definePageMeta({
  layout: false,
});

// Use players composable
const { players, loading, error, savePlayer, loadPlayers } = usePlayers();

// Use matches composable
const { saveMatch } = useMatches();

// Reactive data
const match = reactive(createMatch());

const selectedPlayers = ref<string[]>([]);
const showPlayerForm = ref(false);
const playerSelectorRef = ref<{ resetDropdown: () => void } | null>(null);

// Load players on mount
onBeforeMount(async () => {
  await loadPlayers();
});

// Computed
const canStartGame = computed(() => {
  return selectedPlayers.value.length > 1;
});

// Methods
const startGame = async () => {
  if (!canStartGame.value) return;

  try {
    match.playerStats = await Promise.all(
      selectedPlayers.value.map(async (playerId) => {
        return await createPlayerStats({
          playerId: playerId,
          matchId: match.id,
        }).then((playerStats) => playerStats.id);
      })
    );

    // Save match to database
    const savedMatch = await saveMatch(toRaw(match));

    // Navigate to match page with match ID
    navigateTo(`/match/${savedMatch.id}`);
  } catch (err) {
    console.error("Failed to save match:", err);
    // You could show a toast notification here
  }
};

// Handle player form submission
const handlePlayerSubmit = async (playerData: Player) => {
  try {
    const savedPlayer = await savePlayer(playerData);
    showPlayerForm.value = false;
    // Add the newly created player to the match
    if (savedPlayer && savedPlayer.id) {
      addPlayerToMatch(savedPlayer.id);
    }
  } catch (err) {
    console.error("Failed to save player:", err);
    // You could show a toast notification here
  }
};

// Player selection methods
const addPlayerToMatch = (playerId: string) => {
  const player = players.value.find((p) => p.id === playerId);
  if (player && !selectedPlayers.value.find((id) => id === playerId)) {
    selectedPlayers.value.push(playerId);
  }
  // Reset dropdown to empty value
  playerSelectorRef.value?.resetDropdown();
};

const removePlayerFromMatch = (playerId: string) => {
  const index = selectedPlayers.value.findIndex((id) => id === playerId);
  if (index > -1) {
    selectedPlayers.value.splice(index, 1);
  }
};
</script>
