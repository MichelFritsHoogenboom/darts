<script setup lang="ts">
const { highlighted = false, size = "small" } = defineProps<{
  highlighted?: boolean;
  size?: "small" | "medium" | "large";
}>();

const sizeClass = computed(() => {
  const sizes = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg",
  } as const;
  return sizes[size];
});
</script>

<template>
  <span
    class="stat-well-value"
    :class="[sizeClass, { 'stat-well-value--highlighted': highlighted }]"
  >
    <slot />
  </span>
</template>

<style scoped lang="scss">
.stat-well-value {
  @apply inline-block px-2 bg-gray-400/50 font-bold rounded;
}

.stat-well-value--highlighted {
  @apply bg-gray-400 border border-gray-300/40;
}
</style>
