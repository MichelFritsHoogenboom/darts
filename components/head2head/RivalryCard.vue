<script setup lang="ts">
import type { Head2HeadOverviewItem } from "~/interfaces/competition";
import type { Player } from "~/interfaces/player";
import { getPlayerFullName } from "~/utils/player";

const props = defineProps<{
  item: Head2HeadOverviewItem;
  players: Player[];
}>();

const playerA = computed(() =>
  props.players.find((p) => p.id === props.item.edition.playerIds[0]),
);
const playerB = computed(() =>
  props.players.find((p) => p.id === props.item.edition.playerIds[1]),
);

const winsA = computed(
  () => props.item.standings[props.item.edition.playerIds[0]] ?? 0,
);
const winsB = computed(
  () => props.item.standings[props.item.edition.playerIds[1]] ?? 0,
);

const playedCount = computed(
  () => props.item.matches.filter((m) => m.winner).length,
);

const amountMatches = computed(
  () => props.item.edition.competitionConfig.amountMatches,
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
  <UiSummaryCardLayout
    :show-average="false"
    :to="`/head2head/${item.competition.id}`"
    wrapper-class="mb-4"
  >
    <template #left>
      <span class="text-xs font-normal">
        {{ item.edition.updatedAt.toLocaleDateString() }}
      </span>
      <p class="text-sm">
        Seizoen {{ item.edition.editionNumber }} · {{ playedCount }} /
        {{ amountMatches }} wedstrijden
      </p>
    </template>

    <template #center>
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
    </template>
    <template #actions>
      <NuxtLink
        :to="`/head2head/${item.competition.id}`"
        class="btn-gray btn-gray-500"
      >
        Show details
      </NuxtLink>
    </template>
  </UiSummaryCardLayout>
</template>
