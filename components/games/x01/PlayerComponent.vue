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
    <div class="pb-2 text-center">
      <div class="font-bold text-3xl">
        <StatsPlayerNameWithBadge
          :playerId="player.id"
          :players="[player]"
          :average="90.21"
        />
      </div>
    </div>
    <div class="stat-well">
      <strong>Mogelijke uitgooi:</strong>
      <GamesX01CheckoutSuggestions :score="score" class="col-span-2" />
    </div>
    <div class="stat-well">
      <GamesX01ScoreCounts :playerId="player.id" />
    </div>
    <div class="stat-well">
      <GamesX01Averages :playerId="player.id" />
    </div>
    <div class="stat-well">
      <GamesX01Checkouts :playerId="player.id" />
    </div>
  </div>
</template>

<style></style>
