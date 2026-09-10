<script setup lang="ts">
import { formatAverageDisplay, formatOneDartAverage } from "~/utils/stats";

const {
  matchAverage = 0,
  legAverage = 0,
  setAverage = 0,
  firstNineAverage = 0,
  scoringDartsAverage = 0,
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
  firstNineAverage: number;
  scoringDartsAverage: number;
  lastLegAverage: number;
  lastLegWinAverage: number;
  lastSetAverage: number;
  bestLegAverage: number;
  bestSetAverage: number;
  isSetMatch?: boolean;
}>();
</script>
<template>
  <div class="score-counts__header"></div>
  <div class="score-counts__header">3 dart gem.</div>
  <div class="score-counts__header">1 dart gem.</div>

  <div>Leg</div>
  <div>{{ formatAverageDisplay(legAverage, 2) }}</div>
  <div>{{ formatOneDartAverage(legAverage) }}</div>
  <template v-if="isSetMatch">
    <div>Set</div>
    <div>{{ formatAverageDisplay(setAverage, 2) }}</div>
    <div>{{ formatOneDartAverage(setAverage) }}</div>
  </template>

  <!-- <div>Wedstrijd</div>
  <div>{{ formatAverageDisplay(matchAverage, 2) }}</div>
  <div>{{ formatOneDartAverage(matchAverage) }}</div> -->
  <div>Eerste 9 darts</div>
  <div>{{ formatAverageDisplay(firstNineAverage, 2) }}</div>
  <div>{{ formatOneDartAverage(firstNineAverage) }}</div>
  <div>Scorende darts (> 170)</div>
  <div>{{ formatAverageDisplay(scoringDartsAverage, 2) }}</div>
  <div>{{ formatOneDartAverage(scoringDartsAverage) }}</div>
  <div>Laatste leg winst</div>
  <div>{{ formatAverageDisplay(lastLegWinAverage, 2) }}</div>
  <div>{{ formatOneDartAverage(lastLegWinAverage) }}</div>
  <div>Laatste leg</div>
  <div>{{ formatAverageDisplay(lastLegAverage, 2) }}</div>
  <div>{{ formatOneDartAverage(lastLegAverage) }}</div>
  <template v-if="isSetMatch">
    <div>Laatste set</div>
    <div>{{ formatAverageDisplay(lastSetAverage, 2) }}</div>
    <div>{{ formatOneDartAverage(lastSetAverage) }}</div>
  </template>
  <div class="score-counts__footer">Beste leg winst</div>
  <div class="score-counts__footer">
    {{ formatAverageDisplay(bestLegAverage, 2) }}
  </div>
  <div class="score-counts__footer">
    {{ formatOneDartAverage(bestLegAverage) }}
  </div>
  <template v-if="isSetMatch">
    <div class="score-counts__footer">Beste set winst</div>
    <div class="score-counts__footer">
      {{ formatAverageDisplay(bestSetAverage, 2) }}
    </div>
    <div class="score-counts__footer">
      {{ formatOneDartAverage(bestSetAverage) }}
    </div>
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
