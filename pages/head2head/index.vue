<script setup lang="ts">
import type { Player } from "~/interfaces/player";

definePageMeta({
  layout: false,
});

const { head2HeadOverview, loading, error, loadHead2HeadOverview } =
  useCompetitions();
const { players, loadPlayers } = usePlayers();

const overviewPlayers = ref<Player[]>([]);

onBeforeMount(async () => {
  await loadHead2HeadOverview();
  const ids = new Set<string>();
  for (const item of head2HeadOverview.value) {
    for (const id of item.edition.playerIds) {
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
    for (const id of item.edition.playerIds) {
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
      <div class="flex justify-end mb-6">
        <NuxtLink to="/head2head/create" class="dartboard-button px-6 py-2">
          Nieuwe rivalry
        </NuxtLink>
      </div>

      <div v-if="loading" class="text-center text-gray-400">Laden...</div>
      <div v-else-if="error" class="text-center text-red-400">{{ error }}</div>
      <UiSummaryCardLayout v-else-if="head2HeadOverview.length === 0">
        <template #center>
          <div class="text-gray-400 text-sm text-center">
            Nog geen head to head competities aangemaakt.
          </div>
        </template>
      </UiSummaryCardLayout>

      <div v-else>
        <Head2headRivalryCard
          v-for="item in head2HeadOverview"
          :key="item.competition.id"
          :item="item"
          :players="overviewPlayers"
        />
      </div>
    </div>
  </NuxtLayout>
</template>
