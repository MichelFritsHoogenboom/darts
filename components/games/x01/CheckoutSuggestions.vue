<script setup lang="ts">
import { computed } from "vue";
import { getCheckoutStatus } from "~/utils/dartScoring.js";

// Props
const { playerName, score } = defineProps({
  playerName: String,
  score: Number,
});

// Computed
const checkoutStatus = computed(() => {
  return getCheckoutStatus(score);
});
</script>
<template>
  <div
    v-if="checkoutStatus.isCheckout"
    class="bg-gradient-to-r from-green-900 to-green-800 rounded-xl p-3 border-2 border-green-600"
  >
    <h3 class="text-lg font-bold text-center mb-2 text-green-100">
      🎯 Checkout for {{ playerName }} ({{ score }})
    </h3>
    <div class="grid grid-cols-3 gap-2">
      <div
        v-for="(suggestion, index) in checkoutStatus.suggestions"
        :key="index"
        class="bg-green-700 rounded-lg px-2 py-2 text-center"
      >
        <span class="text-green-100 font-mono text-sm">{{ suggestion }}</span>
      </div>
    </div>
  </div>
</template>
