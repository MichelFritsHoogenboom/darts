<script setup lang="ts">
import X01Game from "../../components/games/x01/X01Game.vue";
import { useMatches } from "../../composables/useMatches";
import type { Match } from "../../interfaces/match";
import { formatX01MatchConfigSummary } from "~/utils/match";
import { routes } from "~/utils/routes";

// Get match ID from route
const route = useRoute();
const matchId = route.params.matchId as string;
const match = ref<Match | null>(null);

definePageMeta({
  layout: false,
});
// Use matches composable
const { getMatch, loading, error } = useMatches();

// Load match data
const loadMatch = async () => {
  try {
    const matchData = await getMatch(matchId);
    if (matchData) {
      match.value = matchData;
    } else {
      throw new Error("Match not found");
    }
  } catch (err) {
    console.error("Failed to load match:", err);
  }
};

// Handle game reset
const handleGameReset = () => {
  navigateTo(routes.setup);
};

// Load match on mount
onMounted(() => {
  if (!matchId) {
    handleGameReset();
    return;
  }

  loadMatch();
});
</script>

<template>
  <NuxtLayout name="skeleton">
    <template #title>
      <span class="text-right font-normal" v-if="match">
        {{ formatX01MatchConfigSummary(match.matchConfig) }}
      </span>
    </template>

    <!-- Loading State -->
    <div v-if="loading" class="text-center text-gray-400 mt-8">
      Loading match...
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center text-red-400 mt-8">
      Error: {{ error }}
      <br />
      <button
        @click="handleGameReset"
        class="mt-4 px-4 py-2 bg-blue-600 text-white"
      >
        Back to Setup
      </button>
    </div>

    <!-- Game Component -->
    <X01Game v-else-if="match" :match="match" @game-reset="handleGameReset" />
  </NuxtLayout>
</template>
