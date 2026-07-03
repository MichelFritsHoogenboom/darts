<script setup lang="ts">
type HeaderLevel = "h1" | "h2" | "h3" | "h4";

const { tagSize = "h2", displaySize = "h2" } = defineProps<{
  tagSize?: HeaderLevel;
  displaySize?: HeaderLevel;
}>();
</script>

<template>
  <component :is="tagSize" class="display-header" :class="displaySize">
    <slot />
  </component>
</template>

<style scoped lang="scss">
.display-header {
  &.h1,
  &.h2 {
    @apply font-oswald font-bold inline-block text-logo mb-6;
    text-transform: uppercase;
    letter-spacing: -1px;
    transform: skewX(-8deg);
  }

  &.h3,
  &.h4 {
    @apply mb-2;
  }

  &.h1 {
    @apply text-4xl;
  }

  &.h2 {
    @apply text-2xl;
  }

  &.h3 {
    @apply text-lg;
  }

  &.h4 {
    @apply text-base;
  }
}
</style>
