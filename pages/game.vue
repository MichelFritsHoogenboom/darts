<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
  >
    <div class="container mx-auto px-4 py-2">
      <header class="text-center mb-4">
        <h1 class="text-3xl font-bold text-white mb-1">🎯 Darts Game</h1>
        <p class="text-lg text-gray-300">501 - First to Zero Wins!</p>
      </header>

      <DartsGame
        :player1-name="player1Name"
        :player2-name="player2Name"
        :match-config="matchConfig"
        @game-reset="handleGameReset"
      />
    </div>
  </div>
</template>

<script setup>
import DartsGame from "~/components/DartsGame.vue";

// Page meta
definePageMeta({
  layout: false,
});

// Get player names and match configuration from query parameters
const route = useRoute();
const player1Name = ref(route.query.player1 || "Player 1");
const player2Name = ref(route.query.player2 || "Player 2");

// Match configuration
const matchConfig = ref({
  type: route.query.type || "legs",
  winCondition: route.query.winCondition || "best-of",
  legsPerSet: parseInt(route.query.legsPerSet) || 3,
  setsToWin: parseInt(route.query.setsToWin) || 2,
  numberOfLegs: parseInt(route.query.numberOfLegs) || 5,
});

// Ensure all values are properly converted to numbers
matchConfig.value.legsPerSet = Number(matchConfig.value.legsPerSet);
matchConfig.value.setsToWin = Number(matchConfig.value.setsToWin);
matchConfig.value.numberOfLegs = Number(matchConfig.value.numberOfLegs);

// Handle game reset
const handleGameReset = () => {
  navigateTo("/setup");
};

// Redirect to setup if no player names provided
onMounted(() => {
  if (!route.query.player1 || !route.query.player2) {
    navigateTo("/setup");
  }
});
</script>
