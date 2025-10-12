<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
  >
    <div class="container mx-auto px-4 py-8">
      <header class="text-center mb-8">
        <h1 class="text-5xl font-bold text-white mb-2">🎯 Darts Game</h1>
        <p class="text-xl text-gray-300">501 - First to Zero Wins!</p>
      </header>

      <div class="max-w-md mx-auto">
        <div class="bg-gray-800 rounded-xl p-8 text-center">
          <h2 class="text-2xl font-bold mb-6">Welcome to Darts!</h2>
          <p class="text-gray-300 mb-8">
            Set up your players and start a game of 501 darts. First player to
            reach exactly zero wins!
          </p>

          <button
            @click="startNewGame"
            class="dartboard-button text-lg px-8 py-3 w-full"
          >
            Start New Game
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const startNewGame = () => {
  navigateTo("/setup");
};
</script>
