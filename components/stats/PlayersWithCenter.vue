<script lang="ts" setup>
import type { Player } from "~/interfaces/player";
import type { PlayerStats } from "~/interfaces/stats";

const {
  playerStats,
  players,
  size,
  winnerId,
  showBadge = true,
} = defineProps<{
  playerStats: PlayerStats[];
  players: Player[];
  size: "small" | "medium" | "large" | "xlarge";
  winnerId?: string;
  showBadge?: boolean;
}>();

const getAverage = (playerId: string) => {
  const found = playerStats.find((player) => player.playerId === playerId);
  return found?.average ?? 0;
};

const sizeClasses = computed(() => {
  const sizes: Record<"small" | "medium" | "large" | "xlarge", string> = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg",
    xlarge: "text-2xl",
  };
  return sizes[size];
});
</script>

<template>
  <div :class="`flex flex-1 items-center gap-2 justify-center ${sizeClasses}`">
    <div v-if="players[0]" class="flex-1 flex justify-end font-bold">
      <StatsPlayerNameWithBadge
        :player-id="players[0].id"
        :players="players"
        :show-badge="showBadge"
        :badge-first="true"
        :winner-id="winnerId"
        :average="getAverage(players[0].id)"
      />
    </div>
    <span class="font-bold mx-5">
      <slot />
    </span>

    <div v-if="players[1]" class="flex-1 flex justify-start font-bold">
      <StatsPlayerNameWithBadge
        :player-id="players[1].id"
        :players="players"
        :show-badge="showBadge"
        :winner-id="winnerId"
        :average="getAverage(players[1].id)"
      />
    </div>
  </div>
</template>
