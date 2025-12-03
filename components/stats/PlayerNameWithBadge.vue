<script lang="ts" setup>
import type { Player } from "~/interfaces/player";
import type { PlayerLeg } from "~/interfaces/leg";
import { createPlayerNameGetter } from "~/utils/player";

const {
  playerId,
  players,
  showBadge = true,
  badgeFirst = false,
  winnerId,
  playerLegs,
} = defineProps<{
  playerId: string;
  players: Player[];
  showBadge?: boolean;
  badgeFirst?: boolean;
  winnerId?: string;
  playerLegs: PlayerLeg[];
}>();

const getPlayerName = createPlayerNameGetter(players);
const isWinner = computed(() => playerId === winnerId);
</script>

<template>
  <div
    class="player-name-with-badge"
    :class="{ 'player-name-with-badge--badge-first': badgeFirst }"
  >
    <span>{{ getPlayerName(playerId) }}</span>
    <span class="text-xs text-gray-400" title="3 dart average">
      {{
        playerLegs
          .find((pl) => pl.playerId === playerId)
          ?.average?.toFixed(2) || "0.00"
      }}
    </span>
    <span
      v-if="isWinner && showBadge"
      class="px-1 py-0.25 text-xs font-semibold bg-green-500 text-white rounded player-name-with-badge__badge"
    >
      winner
    </span>
  </div>
</template>

<style scoped lang="postcss">
.player-name-with-badge {
  @apply flex items-center gap-2 gap-y-1 justify-center flex-wrap;

  &--badge-first .player-name-with-badge__badge {
    order: -1;
  }
}
</style>
