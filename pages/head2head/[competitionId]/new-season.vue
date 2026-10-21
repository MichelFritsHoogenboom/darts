<script setup lang="ts">
// Types
import type { CompetitionEdition } from "~/interfaces/competition";
import type { Player } from "~/interfaces/player";
import type { PlayerStats } from "~/interfaces/stats";
// Constants
import { NEW_SEASON_ORIGINS } from "~/constants/competition";
import { AMOUNT_MATCH_OPTIONS, GAME_TYPES } from "~/constants/match";
import { defaultX01MatchConfig } from "~/interfaces/x01MatchConfig";
// Utils
import { getPlayerIdsFromStats } from "~/utils/player";
import { routes } from "~/utils/routes";

definePageMeta({
  layout: false,
});

const route = useRoute();

const { getCompetition } = useCompetitions();
const { getCurrentEdition, startNewEdition } = useCompetitionEditions();
const { getPlayerStatsForCompetitionEdition } = usePlayerStats();
const { loadPlayers, players } = usePlayers();

const currentEdition = ref<CompetitionEdition>();
const editionPlayerStats = ref<PlayerStats[]>([]);
const amountMatches = ref(7);
const matchConfig = ref({ ...defaultX01MatchConfig });
const saving = ref(false);

const competitionId = computed(() => route.params.competitionId as string);

const cameFromOverview = computed(
  () => route.query.from === NEW_SEASON_ORIGINS.overview,
);

const cancelPath = computed(() => {
  if (cameFromOverview.value || !currentEdition.value) {
    return routes.head2head.index;
  }

  return routes.head2head.season(
    competitionId.value,
    currentEdition.value.editionNumber,
  );
});

const nextSeasonNumber = computed(() =>
  currentEdition.value ? currentEdition.value.editionNumber + 1 : 0,
);

const editionPlayers = computed(() =>
  getPlayerIdsFromStats(editionPlayerStats.value)
    .map((id) => (players.value as Player[]).find((p) => p.id === id))
    .filter((p): p is Player => p !== undefined),
);

const startSeason = async () => {
  if (saving.value || !currentEdition.value) {
    return;
  }

  saving.value = true;
  try {
    const created = await startNewEdition(
      competitionId.value,
      currentEdition.value,
      {
        amountMatches: amountMatches.value,
        gameType:
          currentEdition.value.competitionConfig.gameType ?? GAME_TYPES.x01,
        matchConfig: { ...matchConfig.value },
      },
    );
    await navigateTo(
      routes.head2head.season(competitionId.value, created.editionNumber),
    );
  } finally {
    saving.value = false;
  }
};

onBeforeMount(async () => {
  const competition = await getCompetition(competitionId.value);
  if (!competition) {
    await navigateTo(routes.head2head.index);
    return;
  }

  const edition = await getCurrentEdition(competitionId.value);
  if (!edition || !edition.winner) {
    await navigateTo(
      edition
        ? routes.head2head.season(competitionId.value, edition.editionNumber)
        : routes.head2head.index,
    );
    return;
  }

  currentEdition.value = edition;
  amountMatches.value = edition.competitionConfig.amountMatches;
  matchConfig.value = {
    ...defaultX01MatchConfig,
    ...edition.competitionConfig.matchConfig,
  };

  editionPlayerStats.value = await getPlayerStatsForCompetitionEdition(
    edition.id,
  );
  await loadPlayers(getPlayerIdsFromStats(editionPlayerStats.value));
});
</script>

<template>
  <NuxtLayout name="default">
    <template #title>
      <h1 class="page-title">New season</h1>
    </template>

    <div class="max-w-4xl mx-auto">
      <div v-if="!currentEdition" class="loading">Loading...</div>

      <template v-else>
        <p class="intro">
          Season {{ nextSeasonNumber }} — same players, new settings.
        </p>

        <SetupPlayerSelector :available-players="editionPlayers" readonly />

        <div class="card-panel rounded-lg p-8 mb-6">
          <FormSelect v-model="amountMatches" :options="AMOUNT_MATCH_OPTIONS">
            <template #label>Number of matches</template>
          </FormSelect>
        </div>

        <SetupX01MatchSetup v-model="matchConfig">
          <template #footer>
            <div class="footer">
              <NuxtLink :to="cancelPath" class="btn-gray px-6 py-2 text-center">
                Cancel
              </NuxtLink>
              <FormButton :disabled="saving" @click="startSeason">
                Start season
              </FormButton>
            </div>
          </template>
        </SetupX01MatchSetup>
      </template>
    </div>
  </NuxtLayout>
</template>

<style scoped lang="postcss">
.page-title {
  @apply text-xl font-bold text-white mb-2;
}

.loading {
  @apply text-center text-gray-400;
}

.intro {
  @apply text-gray-400 mb-6;
}

.footer {
  @apply flex flex-col-reverse gap-3 w-full sm:flex-row sm:justify-end sm:gap-4;
}
</style>
