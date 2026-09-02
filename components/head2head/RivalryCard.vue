<script setup lang="ts">
import type { Head2HeadOverviewItem } from "~/interfaces/competition";
import type { Player } from "~/interfaces/player";
import { getPlayerIdsFromStats } from "~/utils/player";
import { routes } from "~/utils/routes";

const props = defineProps<{
  item: Head2HeadOverviewItem;
  players: Player[];
}>();

const playerIds = computed(() => getPlayerIdsFromStats(props.item.playerStats));

const playerA = computed(() =>
  props.players.find((p) => p.id === playerIds.value[0]),
);
const playerB = computed(() =>
  props.players.find((p) => p.id === playerIds.value[1]),
);

const winsA = computed(
  () => props.item.standings[playerIds.value[0]] ?? 0,
);
const winsB = computed(
  () => props.item.standings[playerIds.value[1]] ?? 0,
);

const playedCount = computed(
  () => props.item.matches.filter((m) => m.winner).length,
);

const amountMatches = computed(
  () => props.item.edition.competitionConfig.amountMatches,
);

const rivalryPath = computed(() =>
  routes.head2head.season(
    props.item.competition.id,
    props.item.edition.editionNumber,
  ),
);
</script>

<template>
  <UiSummaryCardLayout
    :show-average="false"
    :to="rivalryPath"
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
        :player-stats="item.playerStats"
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
      <NuxtLink :to="rivalryPath" class="btn-gray btn-gray-500">
        Show details
      </NuxtLink>
    </template>
  </UiSummaryCardLayout>
</template>
