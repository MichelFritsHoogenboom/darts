<script setup lang="ts">
type HeaderLevel = "h1" | "h2" | "h3" | "h4";
type HeaderTag = HeaderLevel | "span";

const {
  tagSize = "h2",
  displaySize = "h2",
  emphasize = false,
  compact = false,
} = defineProps<{
  tagSize?: HeaderTag;
  displaySize?: HeaderLevel;
  emphasize?: boolean;
  compact?: boolean;
}>();
</script>

<template>
  <component
    :is="tagSize"
    class="display-header"
    :class="[displaySize, { emphasized: emphasize, compact }]"
  >
    <slot />
  </component>
</template>

<style scoped lang="scss">
.display-header {
  &.h1,
  &.h2 {
    @apply font-oswald font-bold inline-block text-logo;
    text-transform: uppercase;
    letter-spacing: -1px;
    transform: skewX(-8deg);

    &:not(.compact) {
      @apply mb-6;
    }
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
