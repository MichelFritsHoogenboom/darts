<script setup lang="ts">
import type { Match } from "~/interfaces/match";
import type { Player } from "~/interfaces/player";
import type { CompetitionEdition } from "~/interfaces/competition";
import { canStartNewMatch, computeEditionStandings } from "~/utils/rivalry";
import { getPlayerFullName } from "~/utils/player";

definePageMeta({
  layout: false,
});

const route = useRoute();
const competitionId = computed(() => route.params.competitionId as string);

const { getCompetition } = useCompetitions();
const {
  getCurrentEdition,
  createH2HMatch,
  startNewEdition,
  loading: editionLoading,
} = useCompetitionEditions();
const { getMatchesByIds } = useMatches();
const { loadPlayers, players } = usePlayers();

const competition = ref<Awaited<ReturnType<typeof getCompetition>>>();
const edition = ref<CompetitionEdition>();
const matches = ref<Match[]>([]);
const rivalryPlayers = ref<Player[]>([]);
const showChampionOverlay = ref(false);
const startingMatch = ref(false);

const loadDetail = async () => {
  competition.value = await getCompetition(competitionId.value);
  if (!competition.value) {
    await navigateTo("/head2head");
    return;
  }

  const current = await getCurrentEdition(competitionId.value);
  if (!current) {
    await navigateTo("/head2head");
    return;
  }

  edition.value = current;
  matches.value = await getMatchesByIds([...current.matches]);
  matches.value.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  await loadPlayers([...current.playerIds]);
  rivalryPlayers.value = (players.value as Player[]).filter((p) =>
    current.playerIds.includes(p.id),
  );
};

onBeforeMount(async () => {
  await loadDetail();
  if (route.query.editionComplete === "1") {
    showChampionOverlay.value = true;
    await navigateTo({
      path: route.path,
      query: {},
    });
  }
});

const standings = computed(() => {
  if (!edition.value) return {};
  return computeEditionStandings(edition.value, matches.value);
});

const unfinishedMatches = computed(() =>
  matches.value.filter((m) => !m.winner),
);
const finishedMatches = computed(() => matches.value.filter((m) => !!m.winner));

const finishedCount = computed(
  () => matches.value.filter((m) => m.winner).length,
);

const amountMatches = computed(
  () => edition.value?.competitionConfig.amountMatches ?? 0,
);

const showStartMatch = computed(() => {
  if (!edition.value) return false;
  return canStartNewMatch(edition.value, matches.value);
});

const showStartEdition = computed(() => !!edition.value?.winner);

const winsDisplay = computed(() => {
  if (!edition.value || rivalryPlayers.value.length < 2) return "0 - 0";
  const [a, b] = edition.value.playerIds;
  return `${standings.value[a] ?? 0} - ${standings.value[b] ?? 0}`;
});

const pageTitle = computed(() => {
  return "Head to Head";
});

const championPlayer = computed(() => {
  if (!edition.value?.winner) return undefined;
  return rivalryPlayers.value.find((p) => p.id === edition.value?.winner);
});

const startMatch = async () => {
  if (!edition.value || !competition.value) return;
  if (edition.value.competitionConfig.matchConfig) {
    startingMatch.value = true;
    try {
      const saved = await createH2HMatch(edition.value, competition.value);
      await navigateTo(`/match/${saved.id}`);
    } finally {
      startingMatch.value = false;
    }
  } else {
    await navigateTo(`/head2head/${competitionId.value}/setup`);
  }
};

const beginNewEdition = async () => {
  if (!edition.value) return;
  await startNewEdition(competitionId.value, edition.value);
  await loadDetail();
};
</script>

<template>
  <NuxtLayout name="default">
    <template #title>
      <h1 class="text-xl font-bold text-white mb-2">{{ pageTitle }}</h1>
    </template>

    <div v-if="editionLoading && !edition" class="text-center text-gray-400">
      Laden...
    </div>

    <div v-else-if="edition" class="max-w-4xl mx-auto">
      <UiSummaryCardLayout wrapper-class="mb-6">
        <template #left>
          <p class="text-gray-400 text-sm">
            Seizoen {{ edition.editionNumber }} · {{ finishedCount }} /
            {{ amountMatches }} wedstrijden
          </p>
        </template>
        <template #center>
          <StatsPlayersWithCenter
            v-if="rivalryPlayers.length >= 2"
            size="xlarge"
            :players="[rivalryPlayers[0], rivalryPlayers[1]]"
            :player-stats="[]"
            :show-badge="false"
          >
            <span
              class="inline-block px-4 py-2 bg-gray-400/50 font-bold rounded text-2xl"
            >
              {{ winsDisplay }}
            </span>
          </StatsPlayersWithCenter>
        </template>
      </UiSummaryCardLayout>

      <div v-if="unfinishedMatches.length > 0" class="mb-6">
        <h2 class="text-lg font-bold mb-2">Wedstrijd hervatten</h2>
        <div v-for="match in unfinishedMatches" :key="match.id" class="mb-4">
          <StatsMatchSummary :match="match" />
        </div>
      </div>

      <div class="mb-6 flex gap-4">
        <FormButton
          v-if="showStartMatch"
          :disabled="startingMatch"
          @click="startMatch"
        >
          Nieuwe wedstrijd
        </FormButton>
        <FormButton v-if="showStartEdition" @click="beginNewEdition">
          Nieuw seizoen
        </FormButton>
      </div>

      <div v-if="finishedMatches.length > 0">
        <h2 class="text-lg font-bold mb-2">Wedstrijden</h2>
        <div v-for="match in finishedMatches" :key="match.id" class="mb-4">
          <StatsMatchSummary :match="match" />
        </div>
      </div>
      <UiSummaryCardLayout v-else>
        <template #center>
          <div class="text-gray-400 text-sm text-center">
            Nog geen wedstrijden afgerond.
          </div>
        </template>
      </UiSummaryCardLayout>

      <Head2headEditionChampionOverlay
        v-model="showChampionOverlay"
        :winner="championPlayer"
        :edition-number="edition.editionNumber"
      />
    </div>
  </NuxtLayout>
</template>
