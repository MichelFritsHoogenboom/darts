<script lang="ts" setup>
import type { Set } from "~/interfaces/set";
import type { Leg, PlayerLeg, Score } from "~/interfaces/leg";
import type { Player } from "~/interfaces/player";
import type { PlayerStats } from "~/interfaces/stats";

import { getPlayerWinnerCount } from "~/utils/match";

const { set, setIndex, players, legsWithScores } = defineProps<{
  set: Set;
  setIndex: number;
  players: Player[];
  legsWithScores: Array<{
    leg: Leg;
    playerLegs: PlayerLeg[];
    scoresByPlayer: Record<string, Score[]>;
  }>;
}>();

const { getPlayerStatsById } = usePlayerStats();

const playerStatsArray = ref<PlayerStats[]>([]);

onMounted(async () => {
  playerStatsArray.value = await Promise.all(
    set.playerStats.map((playerStat) => getPlayerStatsById(playerStat))
  );
});

// Extract legs from legsWithScores for the winner count function
const legs = computed(() => legsWithScores.map((legData) => legData.leg));
</script>

<template>
  <div>
    <div
      class="grid grid-cols-[20%_1fr_20%] items-center mb-0 text-white bg-gray-900 px-4 py-2"
    >
      <h4 class="text-md font-bold">
        Set {{ setIndex + 1 }}
        {{ set.createdAt.toLocaleTimeString() }}
        {{ set.id }}
      </h4>
      <div class="flex flex-col gap-1">
        <StatsPlayersWithCenter
          size="small"
          :players="players"
          :player-stats="playerStatsArray"
          :winner-id="set.winner"
          :show-badge="false"
        >
          {{ getPlayerWinnerCount(players[0].id, legs) }} -
          {{ getPlayerWinnerCount(players[1].id, legs) }}
        </StatsPlayersWithCenter>
      </div>
      <div></div>
    </div>

    <!-- Display all legs in this set -->
    <StatsLegSummary
      v-for="(legData, index) in legsWithScores"
      :key="legData.leg.id"
      :leg-index="index"
      :leg="legData.leg"
      :players="players"
      :player-legs="legData.playerLegs"
      :scores-by-player="legData.scoresByPlayer"
    />
  </div>
</template>

<style scoped>
:deep(.leg-summary) {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
</style>
