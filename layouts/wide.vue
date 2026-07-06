<template>
  <NuxtLayout name="skeleton">
    <template #title>
      <slot name="title" />
    </template>
    <div
      class="mx-auto px-4 py-4 container"
      :class="{ default: mode === 'default' }"
    >
      <slot />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
defineProps<{
  mode?: string;
}>();
</script>

<style scoped lang="scss">
.container.default {
  @apply max-w-4xl mx-auto;
}
</style>
