<script setup lang="ts">
import type { PlayerStats } from "~/interfaces/stats";

const { matchplayerStats } = defineProps<{
  matchplayerStats: PlayerStats;
}>();

const onedartAverage = (value: number) => {
  return (value / 3).toFixed(2);
};

const formatAverage = (average: number) => {
  return average.toFixed(2);
};
</script>
<template>
  <template v-if="matchplayerStats">
    <div class="score-counts__header"></div>
    <div class="score-counts__header">3 dart gem.</div>
    <div class="score-counts__header">1 dart gem.</div>

    <div>Leg</div>
    <div>{{ formatAverage(matchplayerStats.average) }}</div>
    <div>{{ onedartAverage(matchplayerStats.average) }}</div>
    <div>Set</div>
    <div></div>
    <div></div>
    <div>Wedstrijd</div>
    <div>{{ formatAverage(matchplayerStats.average) }}</div>
    <div>{{ onedartAverage(matchplayerStats.average) }}</div>
    <div>Laatste leg winst</div>
    <div></div>
    <div></div>
    <div>Laatste leg</div>
    <div></div>
    <div></div>
    <div>Laatste set</div>
    <div></div>
    <div></div>
    <div class="score-counts__footer">Beste leg</div>
    <div class="score-counts__footer"></div>
    <div class="score-counts__footer"></div>
    <div class="score-counts__footer">Beste set</div>
    <div class="score-counts__footer"></div>
    <div class="score-counts__footer"></div>
  </template>
</template>
<style scoped>
.score-counts {
  line-height: 1.5;
  text-align: start;
}
.score-counts__header {
  @apply mb-1 font-bold;
}
.score-counts__footer {
  @apply font-bold;
}
</style>
