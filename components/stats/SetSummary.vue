<script lang="ts" setup>
import type { Set } from "~/interfaces/set";
import type { Leg, PlayerLeg, Score } from "~/interfaces/leg";
import type { Player } from "~/interfaces/player";
import { createPlayerNameGetter } from "~/utils/player";
import LegSummary from "./LegSummary.vue";

const props = defineProps<{
  set: Set;
  setIndex: number;
  players: Player[];
  legsWithScores: Array<{
    leg: Leg;
    playerLegs: PlayerLeg[];
    scoresByPlayer: Record<string, Score[]>;
  }>;
}>();

// Use utility to get player names
const getPlayerName = createPlayerNameGetter(props.players);
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h4 class="text-lg font-bold">Set {{ setIndex + 1 }}</h4>
      <div v-if="set.winner" class="text-green-400 font-semibold">
        Winner: {{ getPlayerName(set.winner) }}
      </div>
    </div>

    <!-- Display all legs in this set -->
    <LegSummary
      v-for="legData in legsWithScores"
      :key="legData.leg.id"
      :leg="legData.leg"
      :players="players"
      :player-legs="legData.playerLegs"
      :scores-by-player="legData.scoresByPlayer"
    />
  </div>
</template>
