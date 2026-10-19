<script setup lang="ts">
// Types
import type { ModalOption, ModalOptionValue } from "~/interfaces/modal";
import type { Player } from "~/interfaces/player";
// Utils
import { getPlayerFullName } from "~/utils/player";

const model = defineModel<boolean>({ required: true });

const { canStartNewSeason } = defineProps<{
  winner: Player | undefined;
  editionNumber: number;
  canStartNewSeason: boolean;
}>();

const emit = defineEmits<{
  startNewSeason: [];
}>();

const choices = computed<ModalOption[]>(() => {
  if (!canStartNewSeason) {
    return [{ label: "Close", value: false }];
  }

  return [
    { label: "Start new season", value: true },
    { label: "Do this later", value: false },
  ];
});

const close = () => {
  model.value = false;
};

const choose = (startNewSeason: ModalOptionValue) => {
  close();

  if (!startNewSeason) {
    return;
  }

  emit("startNewSeason");
};
</script>

<template>
  <GamesX01DecisionModal
    :visible="model"
    title="Season finished"
    :description="`Season ${editionNumber} — champion`"
    :options="choices"
    :show-undo="false"
    dismissible
    @select="choose"
    @close="close"
  >
    <p v-if="winner" class="champion">{{ getPlayerFullName(winner) }}</p>
  </GamesX01DecisionModal>
</template>

<style scoped lang="postcss">
.champion {
  @apply text-2xl font-bold text-yellow-400 mb-6;
}
</style>
