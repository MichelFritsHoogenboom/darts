<script setup lang="ts">
import { ref, computed } from "vue";
import type { Player } from "../../interfaces/player";

const props = defineProps<{
  availablePlayers: Player[];
  selectedPlayers: string[];
  loading: boolean;
  error: string | null;
}>();

const selectedPlayersFullData = computed(() => {
  return props.selectedPlayers
    .map((id) => props.availablePlayers.find((player) => player.id === id))
    .filter((player): player is Player => player !== undefined);
});

const emit = defineEmits<{
  "add-player": [];
  "select-player": [playerId: string];
  "remove-player": [playerId: string];
}>();

const selectedPlayerId = ref<string>("");

// Computed property for available players (excluding already selected ones)
const availablePlayers = computed(() => {
  const selectedIds = props.selectedPlayers.map((id) => id);
  const players = props.availablePlayers
    .filter((player) => !selectedIds.includes(player.id))
    .map((player) => ({
      value: player.id,
      label: `${player.firstName} ${player.lastName || ""}${
        player.alias ? ` (${player.alias})` : ""
      }`.trim(),
    }));

  // Add placeholder option at the beginning
  return [
    { value: "", label: "Select a player to add" },
    ...players,
    { value: "new", label: "Create a new player" },
  ];
});

const addPlayerToMatch = () => {
  if (selectedPlayerId.value && selectedPlayerId.value !== "new") {
    emit("select-player", selectedPlayerId.value);
  } else if (selectedPlayerId.value === "new") {
    emit("add-player");
  }

  selectedPlayerId.value = ""; // Reset selection
};

const removePlayerFromMatch = (playerId: string) => {
  emit("remove-player", playerId);
};

// Expose method to reset dropdown
const resetDropdown = () => {
  selectedPlayerId.value = "";
};

defineExpose({
  resetDropdown,
});
</script>

<template>
  <div class="bg-gray-800 rounded-xl p-8 mb-6">
    <h2 class="text-2xl font-bold mb-6">Players</h2>

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
            @update:modelValue="addPlayerToMatch"
            :options="availablePlayers"
            :disabled="selectedPlayers.length >= 2"
            variant="dark"
          >
          </FormSelect>
        </div>
      </div>

      <!-- Selected Players List -->
      <div v-if="selectedPlayers.length > 0">
        <h3 class="text-lg font-semibold text-white mb-4">Selected Players</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="player in selectedPlayersFullData"
            :key="player?.id"
            class="bg-gray-700 rounded-lg p-4 flex justify-between items-center"
          >
            <div>
              <h4 class="text-white font-medium">
                {{ getPlayerFullName(player) }}
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
    </div>
  </div>
</template>
