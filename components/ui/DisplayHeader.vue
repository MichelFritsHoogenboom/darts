<script setup lang="ts">
type HeaderLevel = "h1" | "h2" | "h3" | "h4";

const {
  tagSize = "h2",
  displaySize = "h2",
  emphasize = false,
} = defineProps<{
  tagSize?: HeaderLevel;
  displaySize?: HeaderLevel;
  emphasize?: boolean;
}>();
</script>

<template>
  <component
    :is="tagSize"
    class="display-header"
    :class="[displaySize, { emphasized: emphasize }]"
  >
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

  &.emphasized {
    text-shadow:
      -8px 0 16px theme("colors.gray.800"),
      8px 0 16px theme("colors.gray.800"),
      -16px 0 28px theme("colors.gray.800"),
      16px 0 28px theme("colors.gray.800"),
      -24px 0 40px theme("colors.gray.800 / 98%"),
      24px 0 40px theme("colors.gray.800 / 98%"),
      0 0 16px theme("colors.gray.800"),
      0 0 32px theme("colors.gray.800"),
      0 0 48px theme("colors.gray.800 / 98%");
  }
}
</style>
