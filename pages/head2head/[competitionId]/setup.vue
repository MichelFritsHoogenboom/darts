<script setup lang="ts">
import { defaultX01MatchConfig } from "~/interfaces/x01MatchConfig";
import type { Player } from "~/interfaces/player";
import type { PlayerStats } from "~/interfaces/stats";
import { getPlayerFullName, getPlayerIdsFromStats } from "~/utils/player";
import { routes } from "~/utils/routes";

definePageMeta({
  layout: false,
});

const route = useRoute();
const competitionId = computed(() => route.params.competitionId as string);

const { getCompetition } = useCompetitions();
const { getCurrentEdition, createH2HMatch } = useCompetitionEditions();
const { getPlayerStatsForCompetitionEdition } = usePlayerStats();
const { loadPlayers, players } = usePlayers();

const matchConfig = ref({ ...defaultX01MatchConfig });
const saving = ref(false);
const editionPlayerStats = ref<PlayerStats[]>([]);
const currentEditionNumber = ref<number>();

onBeforeMount(async () => {
  const competition = await getCompetition(competitionId.value);
  if (!competition) {
    await navigateTo(routes.head2head.index);
    return;
  }

  const edition = await getCurrentEdition(competitionId.value);
  if (!edition || edition.winner) {
    await navigateTo(
      edition
        ? routes.head2head.season(competitionId.value, edition.editionNumber)
        : routes.head2head.index,
    );
    return;
  }

  currentEditionNumber.value = edition.editionNumber;
  editionPlayerStats.value = await getPlayerStatsForCompetitionEdition(
    edition.id,
  );
  await loadPlayers(getPlayerIdsFromStats(editionPlayerStats.value));
});

const cancelPath = computed(() =>
  currentEditionNumber.value != null
    ? routes.head2head.season(competitionId.value, currentEditionNumber.value)
    : routes.head2head.index,
);

const editionPlayers = computed(() =>
  getPlayerIdsFromStats(editionPlayerStats.value)
    .map((id) => (players.value as Player[]).find((p) => p.id === id))
    .filter((p): p is Player => p !== undefined),
);

const startMatch = async () => {
  saving.value = true;
  try {
    const competition = await getCompetition(competitionId.value);
    const edition = await getCurrentEdition(competitionId.value);
    if (!competition || !edition) return;

    const saved = await createH2HMatch(edition, competition, {
      ...matchConfig.value,
    });
    await navigateTo(routes.matchDetail(saved.id));
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <NuxtLayout name="default">
    <template #title>
      <h1 class="text-xl font-bold text-white mb-2">Wedstrijd instellen</h1>
    </template>

    <div class="max-w-4xl mx-auto">
      <div class="card-panel rounded-lg p-8 mb-6">
        <h2 class="text-lg font-semibold text-white mb-4">Spelers</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="player in editionPlayers"
            :key="player.id"
            class="bg-gray-700 p-4"
          >
            <p class="text-white font-medium">
              {{ getPlayerFullName(player) }}
            </p>
          </div>
        </div>
      </div>

      <SetupX01MatchSetup v-model="matchConfig">
        <template #footer>
          <div class="flex gap-4 justify-end w-full">
            <NuxtLink :to="cancelPath" class="btn-gray px-6 py-2">
              Annuleren
            </NuxtLink>
            <FormButton :disabled="saving" @click="startMatch">
              Start wedstrijd
            </FormButton>
          </div>
        </template>
      </SetupX01MatchSetup>
    </div>
  </NuxtLayout>
</template>
