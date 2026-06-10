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
    class="home-mode-card flex-1 flex flex-col p-8 text-center mb-8 rounded-lg"
    :class="[
      'player-card inactive',
      actionable ? 'player-card--actionable' : '',
    ]"
  >
    <h2 class="home-mode-card__title text-2xl font-bold mb-6">{{ title }}</h2>
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
