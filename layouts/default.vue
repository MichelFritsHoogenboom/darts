<template>
  <NuxtLayout name="wide">
    <template #title>
      <slot name="title" />
    </template>
    <div class="mx-auto w-full" :class="mode">
      <slot />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const { mode = "default" } = defineProps<{
  mode?: "default" | "medium";
}>();
</script>

<style scoped lang="scss">
.default {
  @apply max-w-4xl;
}

.medium {
  @apply max-w-5xl;
}
</style>
