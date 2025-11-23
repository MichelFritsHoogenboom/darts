<script lang="ts" setup>
import type { Player } from "~/interfaces/player";
import type { PlayerLeg } from "~/interfaces/leg";
import { createPlayerNameGetter } from "~/utils/player";

const { playerId, players, winnerId, playerLegs } = defineProps<{
  playerId: string;
  players: Player[];
  winnerId?: string;
  playerLegs: PlayerLeg[];
}>();

const getPlayerName = createPlayerNameGetter(players);
const isWinner = computed(() => playerId === winnerId);
</script>

<template>
  <div class="flex items-center gap-2 gap-y-1 justify-center">
    <span>{{ getPlayerName(playerId) }}</span>
    <span
      v-if="isWinner"
      class="px-1 py-0.25 text-xs font-semibold bg-green-500 text-white rounded"
    >
      winner
    </span>
  </div>
  <div class="text-xs text-gray-400">
    <span>avg:</span>
    {{
      playerLegs.find((pl) => pl.playerId === playerId)?.average?.toFixed(2) ||
      "0.00"
    }}
  </div>
</template>
