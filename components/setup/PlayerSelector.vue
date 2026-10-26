<script setup lang="ts">
// Vendor
import { ref, computed } from "vue";
// Types
import type { Player } from "~/interfaces/player";
// Utils
import { getPlayerFullName } from "~/utils/player";

// `selectedPlayers` is the editable selection. Read-only callers already hold
// the resolved pair, so they pass it as `availablePlayers` and omit the rest.
const props = defineProps<{
  availablePlayers: Player[];
  selectedPlayers?: string[];
  loading?: boolean;
  error?: string | null;
  readonly?: boolean;
}>();

const emit = defineEmits<{
  "add-player": [];
  "select-player": [playerId: string];
  "remove-player": [playerId: string];
}>();

const selectedPlayerId = ref<string>("");

const selectedPlayerIds = computed(
  () => props.selectedPlayers ?? props.availablePlayers.map(({ id }) => id),
);

const selectedPlayersFullData = computed(() =>
  selectedPlayerIds.value
    .map((id) => props.availablePlayers.find((player) => player.id === id))
    .filter((player): player is Player => player !== undefined),
);

const heading = computed(() => (props.readonly ? "Players" : "Player setup"));

// Available players for the dropdown (excluding already selected ones)
const selectableOptions = computed(() => {
  const players = props.availablePlayers
    .filter((player) => !selectedPlayerIds.value.includes(player.id))
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
  <div class="card-panel rounded-lg p-8 mb-6">
    <UiDisplayHeader tag-size="h2" display-size="h3">
      {{ heading }}
    </UiDisplayHeader>

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
      <div v-if="!readonly" class="flex gap-4 items-stretch">
        <div class="flex-1">
          <FormSelect
            v-model="selectedPlayerId"
            :options="selectableOptions"
            :disabled="selectedPlayerIds.length >= 2"
            @update:model-value="addPlayerToMatch"
          >
            <template #label>Selected players</template>
          </FormSelect>
        </div>
      </div>

      <!-- Selected Players List -->
      <div v-if="selectedPlayersFullData.length > 0">
        <h3 v-if="!readonly" class="subheading">Selected Players</h3>

        <div class="players">
          <div
            v-for="player in selectedPlayersFullData"
            :key="player.id"
            class="player"
          >
            <div>
              <h4 class="name">{{ getPlayerFullName(player) }}</h4>
              <p v-if="player.alias" class="alias">"{{ player.alias }}"</p>
            </div>

            <button
              v-if="!readonly"
              type="button"
              class="remove"
              title="Remove player"
              :aria-label="`Remove ${getPlayerFullName(player)}`"
              @click="removePlayerFromMatch(player.id)"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.subheading {
  @apply text-lg font-semibold text-white mb-4;
}

.players {
  @apply grid grid-cols-1 md:grid-cols-2 gap-4;
}

.player {
  @apply bg-gray-700 p-4 flex justify-between items-center gap-2;
}

.name {
  @apply text-white font-medium;
}

.alias {
  @apply text-gray-400 text-sm;
}

.remove {
  @apply text-red-400 hover:text-red-300 text-xl font-bold;
}
</style>
