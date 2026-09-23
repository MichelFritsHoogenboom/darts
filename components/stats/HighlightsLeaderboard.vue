<script setup lang="ts">
import type { CompetitionEdition } from "~/interfaces/competition";
import type { LeaderboardEntry } from "~/interfaces/stats";
import {
  leaderboardEntryFromCheckout,
  leaderboardEntryFromMatchAverage,
} from "~/utils/stats";

const props = withDefaults(
  defineProps<{
    competitionEdition?: CompetitionEdition;
    limit?: number;
  }>(),
  { limit: 10 },
);

const { getCheckouts } = useScores();
const { getTopMatchAverages } = useMatches();

const highestCheckouts = ref<LeaderboardEntry[]>([]);
const bestMatchAverages = ref<LeaderboardEntry[]>([]);
const highlightIndex = ref(0);
const loading = ref(false);

const highlights = computed(() => [
  {
    title: "Highest Checkouts",
    entries: highestCheckouts.value,
    emptyText: "No checkouts yet.",
    valueFormat: "int" as const,
  },
  {
    title: "Best match averages",
    entries: bestMatchAverages.value,
    emptyText: "No match averages yet.",
    valueFormat: "average" as const,
  },
]);

const activeHighlight = computed(
  () => highlights.value[highlightIndex.value] ?? highlights.value[0],
);

const editionScopeKey = computed(() => {
  const edition = props.competitionEdition;
  if (!edition) return "global";
  return `${edition.id}:${edition.matches.join(",")}`;
});

const loadHighlights = async () => {
  loading.value = true;
  try {
    const edition = props.competitionEdition;
    const matchIds = edition ? [...edition.matches] : undefined;
    const [checkouts, matchAverages] = await Promise.all([
      getCheckouts(props.limit, matchIds),
      getTopMatchAverages(props.limit, edition?.id),
    ]);
    highestCheckouts.value = checkouts.map(leaderboardEntryFromCheckout);
    bestMatchAverages.value = matchAverages.map(
      leaderboardEntryFromMatchAverage,
    );
    if (highlightIndex.value >= highlights.value.length) {
      highlightIndex.value = 0;
    }
  } finally {
    loading.value = false;
  }
};

watch(editionScopeKey, () => loadHighlights(), { immediate: true });
</script>

<template>
  <div class="highlights-leaderboard">
    <div v-if="loading" class="loading">Loading...</div>
    <UiCarousel
      v-else
      v-model="highlightIndex"
      :titles="highlights.map((highlight) => highlight.title)"
    >
      <StatsLeaderboard
        :entries="activeHighlight.entries"
        :empty-text="activeHighlight.emptyText"
        :value-format="activeHighlight.valueFormat"
      />
    </UiCarousel>
  </div>
</template>

<style scoped lang="scss">
.highlights-leaderboard {
  @apply w-full min-w-0;
}

.loading {
  @apply py-6 text-center text-sm text-gray-400;
}
</style>
