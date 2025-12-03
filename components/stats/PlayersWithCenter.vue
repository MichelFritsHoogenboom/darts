<script lang="ts" setup>
import type { Player } from "~/interfaces/player";
import type { PlayerLeg } from "~/interfaces/leg";

const {
  players,
  playerLegs,
  size,
  winnerId,
  showBadge = true,
} = defineProps<{
  players: Player[];
  playerLegs: PlayerLeg[];
  size: "small" | "medium" | "large";
  winnerId?: string;
  showBadge?: boolean;
}>();

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
    <div v-if="players[0]" class="flex-1 flex justify-end font-bold">
      <StatsPlayerNameWithBadge
        :player-id="players[0].id"
        :players="players"
        :show-badge="showBadge"
        :badge-first="true"
        :winner-id="winnerId"
        :player-legs="playerLegs"
      />
    </div>
    <span class="font-bold mx-6">
      <slot />
    </span>

    <div v-if="players[1]" class="flex-1 flex justify-start font-bold">
      <StatsPlayerNameWithBadge
        :player-id="players[1].id"
        :players="players"
        :show-badge="showBadge"
        :winner-id="winnerId"
        :player-legs="playerLegs"
      />
    </div>
  </div>
</template>
