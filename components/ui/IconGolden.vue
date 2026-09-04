<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
});
</script>

<template>
  <UiIconSparkle class="icon-golden" v-bind="$attrs">
    <slot />
  </UiIconSparkle>
</template>

<style scoped lang="scss">
.icon-golden {
  @apply inline-flex shrink-0 items-center justify-center text-amber-400;

  :deep(svg) {
    @apply h-[1em] w-[1em];
  }
}
</style>
