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
  <div class="max-w-6xl mx-auto flex gap-6 items-start">
    <div class="flex-1 flex flex-col gap-6">
      <div class="flex gap-4 items-stretch">
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
          title="Stats"
          description="See how everyone throws — averages, best visits, and checkouts — filtered by when, where, and who played."
          button-label="Browse stats"
          disabled
        />
      </div>
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
    </div>
    <aside class="w-64 shrink-0 flex flex-col items-center gap-0 pt-4">
      <img
        src="https://images.gc.pdcservices.co.uk/fit-in/600x600/7843dbf0-f21a-11f0-a2b2-337f630ef140.png"
        alt="Player 1"
        class="w-full object-contain"
      />
      <img
        src="https://images.gc.pdcservices.co.uk/fit-in/600x600/f62e2ac0-f233-11f0-b992-c9679735a32e.png"
        alt="Player 2"
        class="w-full object-contain"
      />
    </aside>
  </div>
</template>
