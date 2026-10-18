<script setup lang="ts">
import type { CompetitionEdition } from "~/interfaces/competition";
import type { Player } from "~/interfaces/player";
import { getPlayerIdsFromStats } from "~/utils/player";
import { routes } from "~/utils/routes";

definePageMeta({
  layout: false,
});

const { head2HeadOverview, loading, error, loadHead2HeadOverview } =
  useCompetitions();
const { players, loadPlayers } = usePlayers();

const overviewPlayers = ref<Player[]>([]);
const newSeasonEdition = ref<CompetitionEdition>();
const showNewSeasonChoice = ref(false);

const openNewSeasonChoice = (edition: CompetitionEdition) => {
  newSeasonEdition.value = edition;
  showNewSeasonChoice.value = true;
};

onBeforeMount(async () => {
  await loadHead2HeadOverview();
  const ids = new Set<string>();
  for (const item of head2HeadOverview.value) {
    for (const id of getPlayerIdsFromStats(item.playerStats)) {
      ids.add(id);
    }
  }
  if (ids.size > 0) {
    await loadPlayers([...ids]);
    overviewPlayers.value = players.value as Player[];
  }
});

watch(head2HeadOverview, async () => {
  const ids = new Set<string>();
  for (const item of head2HeadOverview.value) {
    for (const id of getPlayerIdsFromStats(item.playerStats)) {
      ids.add(id);
    }
  }
  if (ids.size > 0) {
    await loadPlayers([...ids]);
    overviewPlayers.value = players.value as Player[];
  }
});
</script>

<template>
  <NuxtLayout name="default">
    <template #title>
      <h1 class="text-xl font-bold text-white mb-2">Head to Head</h1>
    </template>

    <div class="max-w-4xl mx-auto">
      <div v-if="loading" class="text-center text-gray-400">Loading...</div>
      <div v-else-if="error" class="text-center text-red-400">{{ error }}</div>
      <UiSummaryCardLayout v-else-if="head2HeadOverview.length === 0">
        <template #center>
          <div class="text-gray-400 text-sm text-center">
            No head to head competitions created yet.
          </div>
        </template>
      </UiSummaryCardLayout>

      <div v-else>
        <Head2headRivalryCard
          v-for="item in head2HeadOverview"
          :key="item.competition.id"
          :item="item"
          :players="overviewPlayers"
          @new-season="openNewSeasonChoice(item.edition)"
        />
      </div>
      <div class="flex justify-center mb-6">
        <NuxtLink
          :to="routes.head2head.create"
          class="dartboard-button px-6 py-2"
        >
          New rivalry
        </NuxtLink>
      </div>
    </div>

    <Head2headMoleculesNewSeasonChoice
      v-if="newSeasonEdition"
      v-model="showNewSeasonChoice"
      :edition="newSeasonEdition"
      from="overview"
    />
  </NuxtLayout>
</template>
