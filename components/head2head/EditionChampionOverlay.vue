<script setup lang="ts">
// Types
import type { Player } from "~/interfaces/player";
// Utils
import { getPlayerFullName } from "~/utils/player";

const model = defineModel<boolean>({ required: true });

defineProps<{
  winner: Player | undefined;
  editionNumber: number;
}>();

const close = () => {
  model.value = false;
};
</script>

<template>
  <GamesX01DecisionModal
    :visible="model"
    :title="`Season ${editionNumber} finished`"
    :description="`Congratulations ${getPlayerFullName(winner)} — champion!`"
    :options="[]"
    undo-label="Close"
    undo-title="Close"
    dismissible
    @undo="close"
    @close="close"
  >  
  </GamesX01DecisionModal>
</template>


