<script setup lang="ts">
const {
  matchAverage = 0,
  legAverage = 0,
  setAverage = 0,
  lastLegAverage = 0,
  lastLegWinAverage = 0,
  lastSetAverage = 0,
  bestLegAverage = 0,
  bestSetAverage = 0,
  isSetMatch = false,
} = defineProps<{
  matchAverage: number;
  legAverage: number;
  setAverage: number;
  lastLegAverage: number;
  lastLegWinAverage: number;
  lastSetAverage: number;
  bestLegAverage: number;
  bestSetAverage: number;
  isSetMatch?: boolean;
}>();

const oneDartAverage = (value: number) => (value / 3).toFixed(2);

const formatAverage = (average: number) => average.toFixed(2);
</script>
<template>
  <div class="score-counts__header"></div>
  <div class="score-counts__header">3 dart gem.</div>
  <div class="score-counts__header">1 dart gem.</div>

  <div>Leg</div>
  <div>{{ formatAverage(legAverage) }}</div>
  <div>{{ oneDartAverage(legAverage) }}</div>
  <template v-if="isSetMatch">
    <div>Set</div>
    <div>{{ formatAverage(setAverage) }}</div>
    <div>{{ oneDartAverage(setAverage) }}</div>
  </template>

  <div>Wedstrijd</div>
  <div>{{ formatAverage(matchAverage) }}</div>
  <div>{{ oneDartAverage(matchAverage) }}</div>
  <div>Laatste leg winst</div>
  <div>{{ formatAverage(lastLegWinAverage) }}</div>
  <div>{{ oneDartAverage(lastLegWinAverage) }}</div>
  <div>Laatste leg</div>
  <div>{{ formatAverage(lastLegAverage) }}</div>
  <div>{{ oneDartAverage(lastLegAverage) }}</div>
  <template v-if="isSetMatch">
    <div>Laatste set</div>
    <div>{{ formatAverage(lastSetAverage) }}</div>
    <div>{{ oneDartAverage(lastSetAverage) }}</div>
  </template>
  <div class="score-counts__footer">Beste leg winst</div>
  <div class="score-counts__footer">{{ formatAverage(bestLegAverage) }}</div>
  <div class="score-counts__footer">{{ oneDartAverage(bestLegAverage) }}</div>
  <template v-if="isSetMatch">
    <div class="score-counts__footer">Beste set winst</div>
    <div class="score-counts__footer">{{ formatAverage(bestSetAverage) }}</div>
    <div class="score-counts__footer">{{ oneDartAverage(bestSetAverage) }}</div>
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
