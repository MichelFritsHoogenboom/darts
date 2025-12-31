<script setup lang="ts">
import { computed } from "vue";
import { getCheckoutStatus } from "~/utils/dartScoring.js";

// Props
const { score } = defineProps({
  score: Number,
});

// Computed
const checkoutStatus = computed(() => {
  return getCheckoutStatus(score);
});
</script>
<template>
  <div v-if="checkoutStatus.isCheckout">
    <div
      v-for="(suggestion, index) in checkoutStatus.suggestions"
      :key="index"
      class="bg-gray-500 rounded-lg text-center mb-2"
    >
      <span class="font-mono text-xs">{{ suggestion }}</span>
    </div>
  </div>
  <div v-else>Onmogelijk</div>
</template>
