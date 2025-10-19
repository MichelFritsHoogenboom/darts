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

          <!-- Players List -->
          <div v-if="players.length > 0" class="mb-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-for="player in players"
                :key="player.id"
                class="bg-gray-700 rounded-lg p-4"
              >
                <div class="flex justify-between items-start">
                  <div>
                    <h4 class="text-white font-medium">
                      {{ player.firstName }} {{ player.lastName || "" }}
                    </h4>
                  </div>
                </div>
              </div>
            </div>

            <!-- Error State -->
            <div v-if="error" class="text-center text-red-400 mt-4">
              Error: {{ error }}
            </div>
          </div>
          <!-- Loading State -->
          <div v-if="loading" class="text-center text-gray-400 mt-4">
            Loading players...
          </div>
          <!-- Add Player Button -->
          <div class="flex justify-center">
            <FormButton @click="showPlayerForm = true" variant="primary">
              Add Player
            </FormButton>
          </div>
          <SetupX01MatchSetup v-model="match.matchConfig" />
          <div class="bg-gray-800 rounded-xl">
            <!-- Start Game Button -->
            <div class="flex justify-center">
              <FormButton
                @click="startGame"
                :disabled="!canStartGame"
                size="lg"
              >
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
        ></FormPlayerForm>
      </UiModal>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from "vue";
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
const player1Name = ref("");
const player2Name = ref("");
const showPlayerForm = ref(false);

// Load players on mount
onMounted(async () => {
  await loadPlayers();
});

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
</script>
