<script setup lang="ts">
const startNewGame = () => {
  navigateTo("/setup");
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
    class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
  >
    <div class="container mx-auto px-4 py-8">
      <header class="text-center mb-8">
        <h1 class="text-5xl font-bold text-white mb-2">ADL Darts Game</h1>
      </header>

      <div class="max-w-4xl mx-auto">
        <div class="flex gap-4 items-stretch">
          <div class="flex-1 bg-gray-800 rounded-xl p-8 text-center mb-8">
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
          <div class="flex-1 bg-gray-800 rounded-xl p-8 text-center mb-8">
            <h2 class="text-2xl font-bold mb-6">Head to Head</h2>
            <p class="text-gray-300 mb-8">
              Start a rivalry between two players by setting up a head to head
              competition.
            </p>

            <button
              @click="startNewGame"
              disabled
              class="dartboard-button text-lg px-8 py-3 w-full"
            >
              Go to head to head
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
    </div>
  </div>
</template>
