<script setup lang="ts">
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

onBeforeMount(async () => {
  // Load both in parallel for better performance
  await Promise.all([loadLastFinishedMatches(5), loadUnfinishedMatches()]);
});
</script>
<template>
  <div
    class="max-w-6xl mx-auto grid grid-cols-[minmax(0,1fr)_16rem] gap-6 items-start"
  >
    <div class="flex gap-4 items-stretch col-span-2">
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
    </div>
    <div class="flex flex-col gap-6">
      <div v-if="unfinishedMatches.length > 0">
        <h2 class="text-lg font-bold mb-2">Continue match</h2>
        <div v-for="match in unfinishedMatches" :key="match.id" class="mb-4">
          <StatsMatchSummary :match="match" />
        </div>
      </div>
      <div v-if="matches.length > 0">
        <h2 class="text-lg font-bold mb-2">Last 5 matches</h2>
        <div v-for="match in matches" :key="match.id" class="mb-4">
          <StatsMatchSummary :match="match" />
        </div>
      </div>
      <UiSummaryCardLayout v-else>
        <template #center>
          <div class="text-gray-400 text-sm text-center">
            Nog geen wedstrijden gespeeld.
          </div>
        </template>
      </UiSummaryCardLayout>
    </div>
    <aside class="w-64 shrink-0 flex flex-col items-center gap-0 pt-4"></aside>
  </div>
</template>
