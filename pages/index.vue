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
  await loadLastFinishedMatches(5);
  await loadUnfinishedMatches();
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
        <div class="bg-gray-800 rounded-xl p-8 text-center mb-8">
          <h2 class="text-2xl font-bold mb-6">Welcome to Darts!</h2>
          <p class="text-gray-300 mb-8">
            Set up your players and start a game of darts.
          </p>

          <button
            @click="startNewGame"
            class="dartboard-button text-lg px-8 py-3 w-full"
          >
            Start New Game
          </button>
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
