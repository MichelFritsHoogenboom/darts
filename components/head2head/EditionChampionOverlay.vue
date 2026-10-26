<script setup lang="ts">
// Types
import type { Player } from "~/interfaces/player";
// Utils
import { getPlayerFullName } from "~/utils/player";

const model = defineModel<boolean>({ required: true });

const { winner } = defineProps<{
  winner: Player | undefined;
  editionNumber: number;
}>();

// The winner's player record can be missing; say so without naming "Unknown"
const description = computed(() => {
  if (!winner) {
    return "This season has a champion!";
  }

  return `Congratulations ${getPlayerFullName(winner)} — champion!`;
});

const close = () => {
  model.value = false;
};
</script>

<template>
  <GamesX01DecisionModal
    :visible="model"
    :title="`Season ${editionNumber} finished`"
    :description="description"
    :options="[]"
    undo-label="Close"
    undo-title="Close"
    dismissible
    @undo="close"
    @close="close"
  />
</template>
