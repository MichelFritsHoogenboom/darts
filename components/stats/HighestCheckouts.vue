<script setup lang="ts">
import type { Score } from "~/interfaces/leg";
import { createPlayerNameGetter } from "~/utils/player";

const { scores } = defineProps<{
  scores: Score[];
}>();

const { loadPlayers, players } = usePlayers();

const getPlayerName = computed(() =>
  createPlayerNameGetter([...players.value]),
);

onMounted(async () => {
  const playerIds = [...new Set(scores.map((score) => score.playerId))];
  await loadPlayers(playerIds);
});
</script>

<template>
  <div class="stat-well checkouts">
    <ul class="list">
      <li v-for="score in scores" :key="score.id" class="row">
        <span class="score">{{ score.totalScore }}</span>
        <span class="player">{{ getPlayerName(score.playerId) }}</span>
        <time class="date" :datetime="score.createdAt.toISOString()">
          {{ score.createdAt.toLocaleDateString() }}
        </time>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.checkouts {
  display: block;
}

.list {
  @apply m-0 list-none p-0 flex flex-col gap-1;
}

.row {
  @apply grid items-center gap-x-2;
  grid-template-columns: auto minmax(0, 1fr) auto;
}

.score {
  @apply shrink-0 font-semibold tabular-nums;
}

.player {
  @apply min-w-0 truncate;
}

.date {
  @apply shrink-0 text-sm text-gray-400 whitespace-nowrap;
}
</style>
