<script setup lang="ts">
// Types
import type { Player } from "~/interfaces/player";
// Utils
import { getPlayerFullName } from "~/utils/player";

const { players, title = "Players" } = defineProps<{
  players: Player[];
  title?: string;
}>();
</script>

<template>
  <div class="card-panel rounded-lg p-8 mb-6">
    <h2 class="heading">{{ title }}</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="player in players" :key="player.id" class="player">
        <p class="name">{{ getPlayerFullName(player) }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.heading {
  @apply text-lg font-semibold text-white mb-4;
}

.player {
  @apply bg-gray-700 p-4;
}

.name {
  @apply text-white font-medium;
}
</style>
