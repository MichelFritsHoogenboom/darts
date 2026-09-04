<script setup lang="ts">
withDefaults(
  defineProps<{
    to?: string;
    wrapperClass?: string;
  }>(),
  {
    wrapperClass: "",
  },
);
</script>

<template>
  <component
    :is="to ? 'NuxtLink' : 'div'"
    :to="to"
    class="summary-card stat-well flex flex-col gap-2 py-2 px-6 border border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200"
    :class="wrapperClass"
  >
    <slot />
  </component>
</template>
