<script setup lang="ts">
const { wrapperClass = "" } = defineProps<{
  to?: string;
  wrapperClass?: string;
}>();
</script>

<template>
  <component
    :is="to ? 'NuxtLink' : 'div'"
    :to="to"
    class="summary-card stat-well"
    :class="wrapperClass"
  >
    <slot />
  </component>
</template>

<style scoped lang="postcss">
.summary-card {
  @apply flex flex-col gap-2 py-2 px-6 transition-none;
}

.summary-card:hover {
  @apply border-gray-500/40;
}
</style>
