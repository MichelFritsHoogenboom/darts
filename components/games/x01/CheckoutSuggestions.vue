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
  <div
    v-if="checkoutStatus.isCheckout"
    class="absolute bottom-2 left-4 right-4 text-center w-90"
  >
    <div class="grid grid-cols-4 gap-2 text-center">
      <div
        v-for="(suggestion, index) in checkoutStatus.suggestions"
        :key="index"
        class="bg-gray-500 rounded-lg text-center"
      >
        <span class="font-mono text-xs">{{ suggestion }}</span>
      </div>
    </div>
  </div>
</template>
