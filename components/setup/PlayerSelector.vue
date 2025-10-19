<template>
  <div class="bg-gray-800 rounded-xl p-8 mb-6">
    <h2 class="text-2xl font-bold text-center mb-6">Players</h2>

    <!-- Loading State -->
    <div v-if="loading" class="text-center text-gray-400 mt-4">
      Loading players...
    </div>

    <!-- Error State -->
    <div v-if="error" class="text-center text-red-400 mt-4">
      Error: {{ error }}
    </div>

    <!-- Player Selection -->
    <div v-if="!loading && !error" class="space-y-6">
      <!-- Available Players Selection -->
      <div class="flex gap-4 items-stretch">
        <div class="flex-1">
          <FormSelect
            v-model="selectedPlayerId"
            :options="availablePlayers"
            variant="dark"
          >
          </FormSelect>
        </div>
        <FormButton
          @click="addPlayerToMatch"
          :disabled="!selectedPlayerId"
          variant="primary"
          size="md"
        >
          Select Player
        </FormButton>
      </div>

      <!-- Selected Players List -->
      <div v-if="selectedPlayers.length > 0">
        <h3 class="text-lg font-semibold text-white mb-4">Selected Players</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="player in selectedPlayers"
            :key="player.id"
            class="bg-gray-700 rounded-lg p-4 flex justify-between items-center"
          >
            <div>
              <h4 class="text-white font-medium">
                {{ player.firstName }} {{ player.lastName || "" }}
              </h4>
              <p v-if="player.alias" class="text-gray-400 text-sm">
                "{{ player.alias }}"
              </p>
            </div>
            <button
              @click="removePlayerFromMatch(player.id)"
              class="text-red-400 hover:text-red-300 text-xl font-bold"
              title="Remove player"
            >
              ×
            </button>
          </div>
        </div>
      </div>

      <!-- Add New Player Button -->
      <div class="flex justify-center">
        <FormButton @click="$emit('add-player')" variant="outline">
          Add New Player
        </FormButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { Player } from "../../interfaces/player";

const props = defineProps<{
  availablePlayers: Player[];
  selectedPlayers: Player[];
  loading: boolean;
  error: string | null;
}>();

const emit = defineEmits<{
  "add-player": [];
  "select-player": [playerId: string];
  "remove-player": [playerId: string];
}>();

const selectedPlayerId = ref<string>("");

// Computed property for available players (excluding already selected ones)
const availablePlayers = computed(() => {
  const selectedIds = props.selectedPlayers.map((p) => p.id);
  const players = props.availablePlayers
    .filter((player) => !selectedIds.includes(player.id))
    .map((player) => ({
      value: player.id,
      label: `${player.firstName} ${player.lastName || ""}${
        player.alias ? ` (${player.alias})` : ""
      }`.trim(),
    }));

  // Add placeholder option at the beginning
  return [{ value: "", label: "Select a player to add" }, ...players];
});

const addPlayerToMatch = () => {
  if (selectedPlayerId.value) {
    emit("select-player", selectedPlayerId.value);
    selectedPlayerId.value = ""; // Reset selection
  }
};

const removePlayerFromMatch = (playerId: string) => {
  emit("remove-player", playerId);
};
</script>
