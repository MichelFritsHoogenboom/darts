<script setup lang="ts">
import type { PlayerStats } from "~/interfaces/stats";
import type { Score } from "~/interfaces/leg";
import {
  formatCheckoutPercentage,
  resolveCheckoutDisplayRange,
} from "~/utils/stats";
import { CHECKOUT_DISPLAY_RANGES } from "~/constants/stats";

const { playerStats, playerCheckouts } = defineProps<{
  playerStats: PlayerStats;
  playerCheckouts: Score[];
}>();

const bestCheckouts = computed(() =>
  [...playerCheckouts].sort((a, b) => b.totalScore - a.totalScore).slice(0, 5),
);

const checkoutRows = computed(() =>
  CHECKOUT_DISPLAY_RANGES.map((range) =>
    resolveCheckoutDisplayRange(playerStats.checkouts, range),
  ),
);
</script>
<template>
  <div class="score-counts__header">Checkouts</div>
  <div class="score-counts__header">Pogingen</div>
  <div class="score-counts__header">Percentage</div>

  <template v-for="row in checkoutRows" :key="row.label">
    <div>{{ row.label }}</div>
    <div>{{ row.stats.thrown }}</div>
    <div>{{ formatCheckoutPercentage(row.stats) }}</div>
  </template>

  <div class="score-counts__footer">Hoogste checkouts</div>
  <div class="score-counts__footer col-span-2">
    {{
      bestCheckouts.length
        ? bestCheckouts.map((score) => score.totalScore).join(", ")
        : "—"
    }}
  </div>
</template>
<style scoped>
.score-counts__header {
  @apply mb-1 font-bold;
}
.score-counts__footer {
  @apply font-bold;
}
</style>
