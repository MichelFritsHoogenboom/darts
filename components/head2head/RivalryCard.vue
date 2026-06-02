<script setup lang="ts">
import type { Head2HeadOverviewItem } from "~/interfaces/competition";
import type { Player } from "~/interfaces/player";
import { getPlayerFullName } from "~/utils/player";

const props = defineProps<{
  item: Head2HeadOverviewItem;
  players: Player[];
}>();

const playerA = computed(() =>
  props.players.find((p) => p.id === props.item.edition.playerIds[0])
);
const playerB = computed(() =>
  props.players.find((p) => p.id === props.item.edition.playerIds[1])
);

const winsA = computed(
  () => props.item.standings[props.item.edition.playerIds[0]] ?? 0
);
const winsB = computed(
  () => props.item.standings[props.item.edition.playerIds[1]] ?? 0
);

const playedCount = computed(() =>
  props.item.matches.filter((m) => m.winner).length
);

const amountMatches = computed(
  () => props.item.edition.competitionConfig.amountMatches
);

const title = computed(() => {
  if (props.item.competition.name) {
    return props.item.competition.name;
  }
  if (playerA.value && playerB.value) {
    return `${getPlayerFullName(playerA.value)} vs ${getPlayerFullName(playerB.value)}`;
  }
  return "Head to Head";
});
</script>

<template>
  <NuxtLink
    :to="`/head2head/${item.competition.id}`"
    class="block player-card player-card--actionable inactive rounded-lg p-6 mb-4 hover:border-gray-500 transition-colors"
  >
    <h3 class="text-xl font-bold mb-2">{{ title }}</h3>
    <p class="text-gray-400 text-sm mb-4">
      Seizoen {{ item.edition.editionNumber }} · {{ playedCount }} /
      {{ amountMatches }} wedstrijden
    </p>
    <StatsPlayersWithCenter
      v-if="playerA && playerB"
      size="medium"
      :players="[playerA, playerB]"
      :player-stats="[]"
      :show-badge="false"
    >
      <span
        class="inline-block px-3 py-1 bg-gray-400/50 font-bold rounded text-lg"
      >
        {{ winsA }} - {{ winsB }}
      </span>
    </StatsPlayersWithCenter>
  </NuxtLink>
</template>
