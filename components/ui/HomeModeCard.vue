<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
  buttonLabel: string;
  actionable?: boolean;
  disabled?: boolean;
}>();

defineEmits<{
  action: [];
}>();
</script>

<template>
  <div
    class="home-mode-card"
    :class="['card-panel', actionable ? 'card-panel--actionable' : '']"
  >
    <UiDisplayHeader tag-size="h2" display-size="h2">
      {{ title }}
    </UiDisplayHeader>
    <p class="text-gray-300 mb-8 grow">{{ description }}</p>
    <button
      :disabled="disabled"
      class="dartboard-button text-lg px-8 py-3 w-full"
      @click="$emit('action')"
    >
      {{ buttonLabel }}
    </button>
  </div>
</template>

<style scoped lang="scss">
.home-mode-card {
  @apply font-barlow-condensed font-bold;
  @apply flex-1 flex flex-col p-8 text-center mb-8;
}
</style>
