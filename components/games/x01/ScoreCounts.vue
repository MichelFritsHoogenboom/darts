<script setup lang="ts">
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { createScoreRanges, type ScoreRanges } from "~/interfaces/stats";
import type { Score } from "~/interfaces/leg";
import type { PlayerStats } from "~/interfaces/stats";
import { faCamel } from "~/assets/icons/faCamel";
import {
  getScoreRangeKey,
  resolveScoreDisplayRange,
} from "~/utils/stats";
import { MATCH_SCORE_DISPLAY_RANGES } from "~/constants/stats";

const matchId = inject<string>("matchId");

const { $listen, $unlisten } = useNuxtApp();

const { getLegsForMatch } = useLegs();
const { savePlayerStats } = usePlayerStats();

const { playerScores, playerStats } = defineProps<{
  playerStats: PlayerStats;
  playerScores: Score[];
}>();

const playerStatsRef = ref<PlayerStats>(playerStats);

watch(
  () => playerStats,
  (newStats) => {
    if (newStats) {
      playerStatsRef.value = newStats;
    }
  },
  { immediate: true, deep: true },
);

const legsPlayed = ref(0);

const updatePlayerMatchScoreCounts = async () => {
  const scoreRanges: ScoreRanges = createScoreRanges();

  playerScores.forEach((score) => {
    const rangeKey = getScoreRangeKey(score.totalScore);
    scoreRanges[rangeKey] += 1;
  });

  scoreRanges.goldenCamel = playerScores.filter(
    (score) => score.totalScore === 26 && score.isGoldenCamel,
  ).length;

  playerStatsRef.value.scores = scoreRanges;
  await savePlayerStats(playerStatsRef.value);
};

const updateLegsPlayed = async () => {
  const legs = await getLegsForMatch(matchId!);
  legsPlayed.value = legs.length;
};

const handleUndoLastTurn = async () => {
  await updateLegsPlayed();
  await updatePlayerMatchScoreCounts();
};

watch(
  () => playerScores,
  () => {
    updatePlayerMatchScoreCounts();
  },
  { deep: true },
);

onMounted(async () => {
  await updateLegsPlayed();
  await updatePlayerMatchScoreCounts();

  $listen("leg-finished", updateLegsPlayed);
  $listen("undo-last-turn", handleUndoLastTurn);
});

onBeforeUnmount(() => {
  $unlisten("leg-finished", updateLegsPlayed);
  $unlisten("undo-last-turn", handleUndoLastTurn);
});

const averagePerLeg = (value: number) => {
  if (legsPlayed.value === 0) return "0.000";
  return (value / legsPlayed.value).toFixed(3);
};

const scoreRows = computed(() => {
  if (!playerStatsRef.value) return [];
  return MATCH_SCORE_DISPLAY_RANGES.map((range) => ({
    ...resolveScoreDisplayRange(playerStatsRef.value.scores, range),
    showCamel: !!range.showCamel,
    camelCount: playerStatsRef.value.scores.goldenCamel,
  }));
});
</script>
<template>
  <template v-if="playerStatsRef">
    <!-- class names used by assets/css/main.css zebra selectors -->
    <div class="score-counts__header"></div>
    <div class="score-counts__header">Aantal</div>
    <div class="score-counts__header">Aantal per leg</div>

    <template v-for="row in scoreRows" :key="row.label">
      <div>{{ row.label }}</div>
      <div class="inline-flex flex-wrap items-center gap-x-1">
        <span>{{ row.value }}</span>
        <span
          v-if="row.showCamel"
          class="camel-count"
          title="Gouden kamelen"
        >
          <FontAwesomeIcon
            :icon="faCamel"
            class="camel-icon"
            title="Gouden kamelen"
          />
          {{ row.camelCount }})
        </span>
      </div>
      <div class="inline-flex flex-wrap items-center gap-x-1">
        <span>{{ averagePerLeg(row.value) }}</span>
        <span
          v-if="row.showCamel"
          class="camel-count"
          title="Gouden kamelen per leg"
        >
          <FontAwesomeIcon
            :icon="faCamel"
            class="camel-icon"
            title="Gouden kamelen per leg"
          />
          {{ averagePerLeg(row.camelCount) }})
        </span>
      </div>
    </template>

    <div class="score-counts__footer">Totaal aantal legs</div>
    <div class="score-counts__footer">{{ legsPlayed }}</div>
  </template>
</template>
<style scoped>
.score-counts__header {
  @apply mb-1 font-bold;
}
.score-counts__footer {
  @apply font-bold;
}

.camel-count {
  @apply inline-flex items-center gap-0.5;
}

.camel-icon {
  @apply inline-block h-3.5 w-3.5 shrink-0 align-middle text-gray-300;
}

.camel-icon :deep(svg) {
  @apply h-full w-full;
}
</style>
