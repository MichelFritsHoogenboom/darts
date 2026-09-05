<script setup lang="ts">
import type { PlayerStats } from "~/interfaces/stats";
import type { Score } from "~/interfaces/leg";
import {
  checkoutsAboveLabel,
  formatCheckoutPercentage,
  formatCheckoutRangeKey,
  sumCheckoutsAbove,
} from "~/utils/stats";
import { CHECKOUT_KEYS_UP_TO_100 } from "~/constants/stats";

const { playerStats, playerCheckouts } = defineProps<{
  playerStats: PlayerStats;
  playerCheckouts: Score[];
}>();

const bestCheckouts = computed(() =>
  [...playerCheckouts].sort((a, b) => b.totalScore - a.totalScore).slice(0, 5),
);

const checkoutsAbove100 = computed(() =>
  sumCheckoutsAbove(playerStats.checkouts),
);

const checkoutsAbove100Label = computed(() =>
  checkoutsAboveLabel(playerStats.checkouts),
);
</script>
<template>
  <div class="score-counts__header">Checkouts</div>
  <div class="score-counts__header">Pogingen</div>
  <div class="score-counts__header">Percentage</div>

  <template v-for="key in CHECKOUT_KEYS_UP_TO_100" :key="key">
    <div>{{ formatCheckoutRangeKey(key) }}</div>
    <div>{{ playerStats.checkouts[key].thrown }}</div>
    <div>{{ formatCheckoutPercentage(playerStats.checkouts[key]) }}</div>
  </template>

  <div>{{ checkoutsAbove100Label }}</div>
  <div>{{ checkoutsAbove100.thrown }}</div>
  <div>{{ formatCheckoutPercentage(checkoutsAbove100) }}</div>

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
