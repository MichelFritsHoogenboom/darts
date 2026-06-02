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
  <div class="max-w-4xl mx-auto">
    <div class="flex gap-4 items-stretch">
      <div
        class="flex-1 player-card player-card--actionable inactive rounded-lg p-8 text-center mb-8"
      >
        <h2 class="text-2xl font-bold mb-6">X01 Friendly</h2>
        <p class="text-gray-300 mb-8">
          Set up your players and start a friendly game of darts.
        </p>

        <button
          @click="startNewGame"
          class="dartboard-button text-lg px-8 py-3 w-full"
        >
          Start New Game
        </button>
      </div>
      <div
        class="flex-1 player-card player-card--actionable inactive rounded-lg p-8 text-center mb-8"
      >
        <h2 class="text-2xl font-bold mb-6">Head to Head</h2>
        <p class="text-gray-300 mb-8">
          Start a rivalry between two players by setting up a head to head
          competition.
        </p>

        <button
          @click="startHead2Head"
          class="dartboard-button text-lg px-8 py-3 w-full"
        >
          Go Head to Head
        </button>
      </div>
    </div>
    <div v-if="unfinishedMatches.length > 0" class="mb-6">
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
</template>
