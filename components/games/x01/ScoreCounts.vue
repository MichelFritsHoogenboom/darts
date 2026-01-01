<script setup lang="ts">
import { createScoreRanges, type ScoreRanges } from "~/interfaces/stats";

const matchId = inject<string>("matchId");

// Get event listener from plugin
const { $listen, $unlisten } = useNuxtApp();

const { getLegsForMatch } = useLegs();
const { getPlayerStatsForMatch, savePlayerStats } = usePlayerStats();
const { getScoresForMatch } = useScores();

const { playerId } = defineProps<{
  playerId: string;
}>();

const matchStats = await getPlayerStatsForMatch(matchId!);
const playerStats = ref(matchStats.find((stat) => stat.playerId === playerId));
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
  if (!playerStats.value) return;

  const scores = await getScoresForMatch(matchId!);
  const playerScores = scores.filter((score) => score.playerId === playerId);

  // Use existing scores or create new ScoreRanges
  const scoreRanges: ScoreRanges = createScoreRanges();

  // Update score ranges based on totalScore
  playerScores.forEach((score) => {
    const rangeKey = getScoreRangeKey(score.totalScore);
    scoreRanges[rangeKey] = (scoreRanges[rangeKey] || 0) + 1;
  });

  // Update playerStats with new scores
  playerStats.value.scores = scoreRanges;

  // Save the updated playerStats
  await savePlayerStats(playerStats.value);
};

const updateLegsPlayed = async () => {
  const legs = await getLegsForMatch(matchId!);

  legsPlayed.value = legs.length;
};

const handleUndoLastTurn = async () => {
  await updateLegsPlayed();
  await updatePlayerMatchScoreCounts();
};

onMounted(async () => {
  // Initialize data
  await updateLegsPlayed();
  await updatePlayerMatchScoreCounts();

  // Listen for score submission events
  $listen("score-submitted", updatePlayerMatchScoreCounts);
  $listen("leg-finished", updateLegsPlayed);
  $listen("undo-last-turn", handleUndoLastTurn);
});

onBeforeUnmount(() => {
  // Clean up event listeners
  $unlisten("score-submitted", updatePlayerMatchScoreCounts);
  $unlisten("leg-finished", updateLegsPlayed);
  $unlisten("undo-last-turn", handleUndoLastTurn);
});

const averagePerLeg = (value: number) => {
  if (legsPlayed.value === 0) return "0.000";
  return (value / legsPlayed.value).toFixed(3);
};

const lowScoresSum = computed(() => {
  if (!playerStats.value) return 0;
  return (
    (playerStats.value.scores["0-9"] || 0) +
    (playerStats.value.scores["10-19"] || 0)
  );
});
</script>
<template>
  <div class="grid grid-cols-3 w-full score-counts" v-if="playerStats">
    <div class="score-counts__header"></div>
    <div class="score-counts__header">Aantal</div>
    <div class="score-counts__header">Aantal per leg</div>

    <div>180's</div>
    <div>{{ playerStats.scores["180"] }}</div>
    <div>{{ averagePerLeg(playerStats.scores["180"]) }}</div>
    <div>162 - 179</div>
    <div>{{ playerStats.scores["162-179"] }}</div>
    <div>{{ averagePerLeg(playerStats.scores["162-179"]) }}</div>
    <div>126 - 161</div>
    <div>{{ playerStats.scores["126-161"] }}</div>
    <div>{{ averagePerLeg(playerStats.scores["126-161"]) }}</div>
    <div>90 - 125</div>
    <div>{{ playerStats.scores["90-125"] }}</div>
    <div>{{ averagePerLeg(playerStats.scores["90-125"]) }}</div>
    <div>66 - 89</div>
    <div>{{ playerStats.scores["66-89"] }}</div>
    <div>{{ averagePerLeg(playerStats.scores["66-89"]) }}</div>
    <div>54 - 65</div>
    <div>{{ playerStats.scores["54-65"] }}</div>
    <div>{{ averagePerLeg(playerStats.scores["54-65"]) }}</div>
    <div>40 - 53</div>
    <div>{{ playerStats.scores["40-53"] }}</div>
    <div>{{ averagePerLeg(playerStats.scores["40-53"]) }}</div>
    <div>30 - 39</div>
    <div>{{ playerStats.scores["30-39"] }}</div>
    <div>{{ averagePerLeg(playerStats.scores["30-39"]) }}</div>
    <div>20 - 29</div>
    <div>{{ playerStats.scores["20-29"] }}</div>
    <div>{{ averagePerLeg(playerStats.scores["20-29"]) }}</div>
    <div>0 - 19</div>
    <div>{{ lowScoresSum }}</div>
    <div>{{ averagePerLeg(lowScoresSum) }}</div>

    <div class="score-counts__footer">Gespeelde legs</div>
    <div class="score-counts__footer">{{ legsPlayed }}</div>
  </div>
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
