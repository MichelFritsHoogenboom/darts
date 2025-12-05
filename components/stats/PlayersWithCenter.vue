<script lang="ts" setup>
import type { Player, PlayerStats } from "~/interfaces/player";
import type { PlayerLeg } from "~/interfaces/leg";

const {
  playerStats,
  players,
  size,
  winnerId,
  showBadge = true,
} = defineProps<{
  playerStats: PlayerStats[] | PlayerLeg[];
  players: Player[];
  size: "small" | "medium" | "large";
  winnerId?: string;
  showBadge?: boolean;
}>();

const getAverage = (playerId: string) => {
  return (
    playerStats.find((player) => {
      // PlayerLeg has playerId, PlayerStats uses id
      return ("playerId" in player ? player.playerId : player.id) === playerId;
    })?.stats?.average ?? 0
  );
};

const sizeClasses = computed(() => {
  const sizes: Record<"small" | "medium" | "large", string> = {
    small: "text-sm",
    medium: "text-md",
    large: "text-lg",
  };
  return sizes[size];
});
</script>

<template>
  <div :class="`flex flex-1 items-center gap-2 justify-center ${sizeClasses}`">
    <div
      v-if="players[0] && playerStats?.[0]"
      class="flex-1 flex justify-end font-bold"
    >
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

    <div
      v-if="players[1] && playerStats?.[1]"
      class="flex-1 flex justify-start font-bold"
    >
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
