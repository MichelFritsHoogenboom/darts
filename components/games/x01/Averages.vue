<script setup lang="ts">
import type { PlayerStats } from "~/interfaces/stats";

const {
  matchAverage = 0,
  legAverage = 0,
  setAverage = 0,
  lastLegAverage = 0,
  lastSetAverage = 0,
} = defineProps<{
  matchAverage: number;
  legAverage: number;
  setAverage: number;
  lastLegAverage: number;
  lastSetAverage: number;
}>();

const onedartAverage = (value: number) => {
  return (value / 3).toFixed(2);
};

const formatAverage = (average: number) => {
  return average.toFixed(2);
};
</script>
<template>
  <div class="score-counts__header"></div>
  <div class="score-counts__header">3 dart gem.</div>
  <div class="score-counts__header">1 dart gem.</div>

  <div>Leg</div>
  <div>{{ formatAverage(legAverage) }}</div>
  <div>{{ onedartAverage(legAverage) }}</div>
  <div>Set</div>
  <div>{{ formatAverage(setAverage) }}</div>
  <div>{{ onedartAverage(setAverage) }}</div>

  <div>Wedstrijd</div>
  <div>{{ formatAverage(matchAverage) }}</div>
  <div>{{ onedartAverage(matchAverage) }}</div>
  <div>Laatste leg winst</div>
  <div></div>
  <div></div>
  <div>Laatste leg</div>
  <div>{{ formatAverage(lastLegAverage) }}</div>
  <div>{{ onedartAverage(lastLegAverage) }}</div>
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
