<script setup lang="ts">
import type { Score } from "~/interfaces/leg";

definePageMeta({
  layout: false,
});

const startNewGame = () => {
  navigateTo("/setup");
};

const startHead2Head = () => {
  navigateTo("/head2head");
};

const {
  matches,
  unfinishedMatches,
  loadLastFinishedMatches,
  loadUnfinishedMatches,
} = useMatches();
const { getCheckouts } = useScores();

const highestCheckouts = ref<Score[]>([]);

onBeforeMount(async () => {
  const [, , checkouts] = await Promise.all([
    loadLastFinishedMatches(5),
    loadUnfinishedMatches(),
    getCheckouts(10),
  ]);
  highestCheckouts.value = checkouts;
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
          Last 5 matches
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
      <UiDisplayHeader tag-size="h2" display-size="h3">
        Highest Checkouts
      </UiDisplayHeader>

      <StatsHighestCheckouts :scores="highestCheckouts" />
    </template>
  </NuxtLayout>
</template>
