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
  <div v-if="checkoutStatus.isCheckout" class="flex gap-2">
    <div
      v-for="(suggestion, index) in checkoutStatus.suggestions"
      :key="index"
      class="bg-gray-500 text-center rounded py-1 px-2"
    >
      <span class="font-mono font-bold text-xs">{{ suggestion }}</span>
    </div>
  </div>
  <div v-else>Onmogelijk</div>
</template>
