<script lang="ts" setup>
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import type { Player } from "~/interfaces/player";

import { createPlayerNameGetter } from "~/utils/player";
import { faCamel } from "~/utils/icons/faCamel";

const {
  playerId,
  players,
  showBadge = true,
  badgeFirst = false,
  winnerId,
  average,
  showGoldenCamel = false,
} = defineProps<{
  playerId: string;
  players: Player[];
  showBadge?: boolean;
  badgeFirst?: boolean;
  winnerId?: string;
  average: number;
  showGoldenCamel?: boolean;
}>();

const getPlayerName = createPlayerNameGetter(players);
const isWinner = computed(() => playerId === winnerId);
</script>

<template>
  <div
    class="player-name-with-badge"
    :class="{ 'player-name-with-badge--badge-first': badgeFirst }"
  >
    <span
      v-if="showGoldenCamel"
      class="golden-camel-sparkle"
      title="Meeste gouden kamelen"
    >
      <FontAwesomeIcon :icon="faCamel" class="golden-camel-sparkle__icon" />
    </span>
    <span class="player-name-with-badge__name">{{
      getPlayerName(playerId)
    }}</span>
    <span class="text-xs text-gray-400 font-oswald" title="3 dart average">
      {{ average.toFixed(2) }}
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

.golden-camel-sparkle {
  @apply relative inline-flex shrink-0;
}

.golden-camel-sparkle__icon {
  @apply h-[0.80em] w-[0.80em] text-amber-400;
  animation: golden-camel-glow 2.4s ease-in-out infinite;
  transform: skewX(-8deg);
}

.golden-camel-sparkle::before,
.golden-camel-sparkle::after {
  @apply absolute rounded-full bg-amber-200 pointer-events-none;
  content: "";
  width: 3px;
  height: 3px;
  animation: golden-camel-twinkle 2.4s ease-in-out infinite;
}

.golden-camel-sparkle::before {
  top: -1px;
  right: -2px;
}

.golden-camel-sparkle::after {
  bottom: 0;
  left: -2px;
  animation-delay: 1.2s;
}

@keyframes golden-camel-glow {
  0%,
  100% {
    filter: drop-shadow(0 0 1px rgb(251 191 36 / 0.35));
    transform: scale(1);
  }
  50% {
    filter: drop-shadow(0 0 5px rgb(251 191 36 / 0.95))
      drop-shadow(0 0 10px rgb(253 224 71 / 0.45));
    transform: scale(1.06);
  }
}

@keyframes golden-camel-twinkle {
  0%,
  72%,
  100% {
    opacity: 0;
    transform: scale(0.4);
  }
  82% {
    opacity: 1;
    transform: scale(1.25);
  }
}

@media (prefers-reduced-motion: reduce) {
  .golden-camel-sparkle__icon,
  .golden-camel-sparkle::before,
  .golden-camel-sparkle::after {
    animation: none;
  }
}
</style>
