<script setup lang="ts">
// Types
import type { Player } from "~/interfaces/player";
// Constants
import { faTrophy } from "@fortawesome/free-solid-svg-icons";
import { faCamel } from "~/assets/icons/faCamel";
// Components
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
// Utils
import { getPlayerDisplayName } from "~/utils/player";
import { formatAverageDisplay } from "~/utils/stats";

const {
  player,
  average,
  seasonWins,
  camelWins,
  silhouetteIndex = 0,
  align = "left",
  isWinner = false,
} = defineProps<{
  player: Player;
  average: number;
  seasonWins: number;
  camelWins: number;
  silhouetteIndex?: number;
  align?: "left" | "right";
  isWinner?: boolean;
}>();

const name = computed(() => getPlayerDisplayName(player));
</script>

<template>
  <div class="season-player-panel" :class="align">
    <div class="meta">
      <div class="name">{{ name }}</div>

      <ul class="stats">
        <li class="row" title="3 dart average">
          <span class="label">Season avg.</span>
          <span class="value">{{ formatAverageDisplay(average, 2) }}</span>
        </li>

        <li class="row">
          <span class="label">
            <FontAwesomeIcon :icon="faTrophy" class="icon" />
            Season wins
          </span>
          <span class="value">{{ seasonWins }}</span>
        </li>

        <li class="row">
          <span class="label">
            <FontAwesomeIcon :icon="faCamel" class="icon" />
            Camel wins
          </span>
          <span class="value">{{ camelWins }}</span>
        </li>
      </ul>
    </div>

    <div class="silhouette" :class="{ winner: isWinner }">
      <PlayerImage :player="player" :silhouette-index="silhouetteIndex" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.season-player-panel {
  @apply relative flex items-stretch justify-between min-h-[11rem];

  &.right {
    @apply flex-row-reverse;
  }

  /* The panel sits flush in a rounded, unclipped container (the silhouette
     overhangs the top, so it cannot use overflow: hidden). Match the outer
     corners to the container radius minus its 2px border. */
  .meta {
    @apply relative z-10 flex flex-col justify-end gap-1.5 self-stretch;
    @apply w-max max-w-[16rem] pl-7 pr-4 pt-5 pb-1 rounded-l-md;
    @apply backdrop-blur-sm box-border text-left;
    background: linear-gradient(
      90deg,
      theme("colors.gray.900 / 55%") 0%,
      theme("colors.gray.900 / 28%") 65%,
      transparent 100%
    );
  }

  &.right .meta {
    @apply pl-4 pr-7 text-right rounded-l-none rounded-r-md;
    background: linear-gradient(
      270deg,
      theme("colors.gray.900 / 55%") 0%,
      theme("colors.gray.900 / 28%") 65%,
      transparent 100%
    );
  }

  .name {
    @apply text-3xl font-bold text-white leading-tight mb-1 whitespace-nowrap;
  }

  .stats {
    @apply m-0 p-0 list-none;
  }

  .row {
    @apply flex items-center justify-between gap-4 py-2;
    @apply border-b border-gray-600/35;

    &:last-child {
      @apply border-b-0;
    }
  }

  &.right .row {
    @apply flex-row-reverse;
  }

  .label {
    @apply inline-flex items-center gap-2 text-base text-gray-400;
  }

  .icon {
    @apply text-gray-400 shrink-0 h-[0.9375rem] w-[0.9375rem];
  }

  .value {
    @apply font-oswald font-bold text-xl text-logo tabular-nums;
    letter-spacing: -0.5px;
    transform: skewX(-8deg);
  }

  .silhouette {
    @apply relative z-0 shrink-0 self-end;
    @apply border-b-[3px] border-gray-600/55;
    margin-top: -5rem;
    margin-bottom: 0.875rem;

    &.winner {
      @apply border-dartboard-blue-bright;
    }
  }
}
</style>
