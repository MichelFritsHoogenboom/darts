<script setup lang="ts">
import { createScoreRanges, type ScoreRanges } from "~/interfaces/stats";
import type { Score } from "~/interfaces/leg";
import type { PlayerStats } from "~/interfaces/stats";

const matchId = inject<string>("matchId");

// Get event listener from plugin
const { $listen, $unlisten } = useNuxtApp();

const { getLegsForMatch } = useLegs();
const { savePlayerStats } = usePlayerStats();

const { playerScores, playerStats } = defineProps<{
  playerStats: PlayerStats;
  playerScores: Score[];
}>();

const playerStatsRef = ref<PlayerStats>(playerStats);

// Watch the prop and sync with local ref
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

// Create a cached mapping of score ranges from the interface
const scoreRangeMapping = (() => {
  const sampleRanges = createScoreRanges();
  const keys = Object.keys(sampleRanges) as Array<keyof ScoreRanges>;

  return keys
    .map((key) => {
      if (key === "180") {
        return { key, min: 180, max: 180 };
      }
      const [min, max] = key.split("-").map(Number);
      return { key, min, max };
    })
    .sort((a, b) => b.min - a.min); // Sort descending by min value
})();

// Helper function to map totalScore to ScoreRanges key using interface keys dynamically
const getScoreRangeKey = (totalScore: number): keyof ScoreRanges => {
  for (const { key, min, max } of scoreRangeMapping) {
    if (totalScore >= min && totalScore <= max) {
      return key;
    }
  }
  return "0-9"; // Fallback (should never happen if ranges cover all scores)
};

const updatePlayerMatchScoreCounts = async () => {
  // Use existing scores or create new ScoreRanges
  const scoreRanges: ScoreRanges = createScoreRanges();

  // Update score ranges based on totalScore
  playerScores.forEach((score) => {
    const rangeKey = getScoreRangeKey(score.totalScore);
    scoreRanges[rangeKey] = (scoreRanges[rangeKey] || 0) + 1;
  });

  // Update playerStatsRef with new scores
  playerStatsRef.value.scores = scoreRanges;

  // Save the updated stats
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

// Watch playerScores changes and update counts (only when scores actually change)
watch(
  () => playerScores,
  () => {
    updatePlayerMatchScoreCounts();
  },
  { deep: true },
);

onMounted(async () => {
  // Initialize data
  await updateLegsPlayed();
  await updatePlayerMatchScoreCounts();

  // Listen for score submission events
  $listen("leg-finished", updateLegsPlayed);
  $listen("undo-last-turn", handleUndoLastTurn);
});

onBeforeUnmount(() => {
  // Clean up event listeners
  $unlisten("leg-finished", updateLegsPlayed);
  $unlisten("undo-last-turn", handleUndoLastTurn);
});

const averagePerLeg = (value: number) => {
  if (legsPlayed.value === 0) return "0.000";
  return (value / legsPlayed.value).toFixed(3);
};

const lowScoresSum = computed(() => {
  if (!playerStatsRef.value) return 0;
  return (
    (playerStatsRef.value.scores["0-9"] || 0) +
    (playerStatsRef.value.scores["10-19"] || 0)
  );
});
</script>
<template>
  <template v-if="playerStatsRef">
    <div class="score-counts__header"></div>
    <div class="score-counts__header">Aantal</div>
    <div class="score-counts__header">Aantal per leg</div>

    <div>180's</div>
    <div>{{ playerStatsRef.scores["180"] }}</div>
    <div>{{ averagePerLeg(playerStatsRef.scores["180"]) }}</div>
    <div>162 - 179</div>
    <div>{{ playerStatsRef.scores["162-179"] }}</div>
    <div>{{ averagePerLeg(playerStatsRef.scores["162-179"]) }}</div>
    <div>126 - 161</div>
    <div>{{ playerStatsRef.scores["126-161"] }}</div>
    <div>{{ averagePerLeg(playerStatsRef.scores["126-161"]) }}</div>
    <div>90 - 125</div>
    <div>{{ playerStatsRef.scores["90-125"] }}</div>
    <div>{{ averagePerLeg(playerStatsRef.scores["90-125"]) }}</div>
    <div>66 - 89</div>
    <div>{{ playerStatsRef.scores["66-89"] }}</div>
    <div>{{ averagePerLeg(playerStatsRef.scores["66-89"]) }}</div>
    <div>54 - 65</div>
    <div>{{ playerStatsRef.scores["54-65"] }}</div>
    <div>{{ averagePerLeg(playerStatsRef.scores["54-65"]) }}</div>
    <div>40 - 53</div>
    <div>{{ playerStatsRef.scores["40-53"] }}</div>
    <div>{{ averagePerLeg(playerStatsRef.scores["40-53"]) }}</div>
    <div>30 - 39</div>
    <div>{{ playerStatsRef.scores["30-39"] }}</div>
    <div>{{ averagePerLeg(playerStatsRef.scores["30-39"]) }}</div>
    <div>20 - 29</div>
    <div>{{ playerStatsRef.scores["20-29"] }}</div>
    <div>{{ averagePerLeg(playerStatsRef.scores["20-29"]) }}</div>
    <div>0 - 19</div>
    <div>{{ lowScoresSum }}</div>
    <div>{{ averagePerLeg(lowScoresSum) }}</div>

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
</style>
