<script lang="ts" setup>
import type { Score, SingleDartScore } from "~/interfaces/leg";

const { score } = defineProps<{
  score: Score;
}>();

const { getSingleDartScoresForScore } = useSingleDartScores();

const singleDartScores = ref<SingleDartScore[]>([]);

// Load single dart scores if not already in the score object
onBeforeMount(async () => {
  // Load single dart scores from database
  const loadedScores = await getSingleDartScoresForScore(score.id);
  singleDartScores.value = loadedScores;
});

// Find the double dart that finished the leg
const checkoutDouble = computed(() => {
  // First check if score object has single dart scores
  const dartsFromScore = [
    score.scoreDarts1,
    score.scoreDarts2,
    score.scoreDarts3,
  ].filter((dart) => dart !== undefined) as SingleDartScore[];

  // Use score's single dart scores if available, otherwise use loaded ones
  const darts =
    dartsFromScore.length > 0 ? dartsFromScore : singleDartScores.value;

  // Find the double dart
  const doubleDart = darts.find((dart) => dart.doubleHit === true);

  if (doubleDart) {
    // The score value is the actual points (e.g., 40 for D20)
    // Divide by 2 to get the number on the board
    const number = doubleDart.score / 2;
    return `D${number}`;
  }

  return "D???";
});
</script>

<template>
  <span v-if="checkoutDouble" class="text-xs text-red-400 ml-1">
    {{ checkoutDouble }}
  </span>
</template>
