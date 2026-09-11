<script setup lang="ts">
import type { Player } from "~/interfaces/player";
import { getPlayerFullName } from "~/utils/player";

const model = defineModel<boolean>({ required: true });

const props = defineProps<{
  winner: Player | undefined;
  editionNumber: number;
}>();
</script>

<template>
  <UiModal v-model="model">
    <template #title>Season finished</template>
    <div class="text-center py-4">
      <p class="text-lg text-white mb-2">
        Season {{ editionNumber }} — champion
      </p>
      <p v-if="winner" class="text-2xl font-bold text-yellow-400">
        {{ getPlayerFullName(winner) }}
      </p>
    </div>
    <div class="flex justify-end mt-6">
      <FormButton @click="model = false">Close</FormButton>
    </div>
  </UiModal>
</template>
