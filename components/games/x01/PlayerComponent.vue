<script lang="ts" setup>
import type { Player } from "~/interfaces/player";

const { player, currentPlayerId } = defineProps<{
  player: Player;
  currentPlayerId: string;
  score: number;
}>();

const getPlayerDisplayName = (player: Player) => {
  return `${player.firstName} ${player.lastName}`;
};
</script>
<template>
  <div class="flex flex-col items-center justify-start gap-4">
    <div
      class="rounded-xl p-4 text-center w-full"
      :class="
        currentPlayerId === player.id ? 'bg-dartboard-red/60' : 'bg-gray-700'
      "
    >
      <div class="font-bold text-3xl">
        {{ getPlayerDisplayName(player) }}
      </div>
    </div>
    <div class="rounded-xl p-4 text-left grid grid-cols-3 w-full bg-gray-700">
      <strong>Mogelijke uitgooi:</strong>
      <GamesX01CheckoutSuggestions :score="score" class="col-span-2" />
    </div>
    <div class="rounded-xl p-4 pb-2 w-full bg-gray-700">
      <StatsScoreCounts :playerId="player.id" />
    </div>
  </div>
</template>

<style></style>
