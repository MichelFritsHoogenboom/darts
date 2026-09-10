<script setup lang="ts">
import type { LeaderboardEntry } from "~/interfaces/stats";
import { routes } from "~/utils/routes";
import {
  leaderboardEntryFromCheckout,
  leaderboardEntryFromMatchAverage,
} from "~/utils/stats";

definePageMeta({
  layout: false,
});

const startNewGame = () => {
  navigateTo(routes.setup);
};

const startHead2Head = () => {
  navigateTo(routes.head2head.index);
};

const {
  matches,
  unfinishedMatches,
  loadLastFinishedMatches,
  loadUnfinishedMatches,
  getTopMatchAverages,
} = useMatches();
const { getCheckouts } = useScores();

const highestCheckouts = ref<LeaderboardEntry[]>([]);
const bestMatchAverages = ref<LeaderboardEntry[]>([]);
const highlightIndex = ref(0);

const highlights = computed(() => [
  {
    title: "Highest Checkouts",
    entries: highestCheckouts.value,
    emptyText: "Nog geen checkouts.",
    valueFormat: "int" as const,
  },
  {
    title: "Beste wedstrijdgemiddelden",
    entries: bestMatchAverages.value,
    emptyText: "Nog geen wedstrijdgemiddelden.",
    valueFormat: "average" as const,
  },
]);

const activeHighlight = computed(
  () => highlights.value[highlightIndex.value] ?? highlights.value[0],
);

onBeforeMount(async () => {
  const [checkouts, matchAverages] = await Promise.all([
    getCheckouts(10),
    getTopMatchAverages(10),
    loadLastFinishedMatches(10),
    loadUnfinishedMatches(),
  ]);
  highestCheckouts.value = checkouts.map(leaderboardEntryFromCheckout);
  bestMatchAverages.value = matchAverages.map(leaderboardEntryFromMatchAverage);
});
</script>

<template>
  <NuxtLayout name="homepage">
    <template #fullWidth>
      <UiHomeModeCard
        title="X01 Friendly"
        description="Set up your players and start a friendly game of darts."
        button-label="Quick Friendly"
        actionable
        @action="startNewGame"
      />

      <UiHomeModeCard
        title="Head to Head"
        description="Start a rivalry between two players by setting up a head to head competition."
        button-label="Go Head to Head"
        actionable
        @action="startHead2Head"
      />

      <UiHomeModeCard
        title="Tournaments"
        description="Create, manage, and play tournaments while tracking standings and every match from start to finish."
        button-label="Manage and play"
        disabled
      />
      <UiHomeModeCard
        title="Training"
        description="Train your scoring, checkouts, and consistency with focused darts practice routines."
        button-label="Start training"
        disabled
      />
    </template>
    <template #default>
      <div v-if="unfinishedMatches.length > 0">
        <UiDisplayHeader tag-size="h2" display-size="h3">
          Continue match
        </UiDisplayHeader>
        <div v-for="match in unfinishedMatches" :key="match.id" class="mb-4">
          <StatsMatchSummary :match="match" @deleted="loadUnfinishedMatches" />
        </div>
      </div>
      <div v-if="matches.length > 0">
        <UiDisplayHeader tag-size="h2" display-size="h3">
          Last 10 matches
        </UiDisplayHeader>
        <div v-for="match in matches" :key="match.id" class="mb-4">
          <StatsMatchSummary :match="match" />
        </div>
      </div>
      <UiSummaryCardLayout
        v-if="unfinishedMatches.length === 0 && matches.length === 0"
      >
        <template #center>
          <div class="text-gray-400 text-sm text-center">
            Nog geen wedstrijden gespeeld.
          </div>
        </template>
      </UiSummaryCardLayout>
    </template>
    <template #sidebar>
      <UiCarousel
        v-model="highlightIndex"
        :titles="highlights.map((highlight) => highlight.title)"
      >
        <StatsLeaderboard
          :entries="activeHighlight.entries"
          :empty-text="activeHighlight.emptyText"
          :value-format="activeHighlight.valueFormat"
        />
      </UiCarousel>
    </template>
  </NuxtLayout>
</template>
