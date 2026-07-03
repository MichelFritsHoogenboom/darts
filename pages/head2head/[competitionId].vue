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

const DEFAULT_PLAYER_IMAGES = [
  "https://images.gc.pdcservices.co.uk/fit-in/600x600/7843dbf0-f21a-11f0-a2b2-337f630ef140.png",
  "https://images.gc.pdcservices.co.uk/fit-in/600x600/f62e2ac0-f233-11f0-b992-c9679735a32e.png",
] as const;

const getPlayerImageUrl = (index: number) =>
  DEFAULT_PLAYER_IMAGES[index] ?? DEFAULT_PLAYER_IMAGES[0];

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
      <div class="card-panel rivalry-header">
        <div v-if="rivalryPlayers.length >= 2" class="flex justify-center">
          <img
            :src="getPlayerImageUrl(0)"
            :alt="getPlayerFullName(rivalryPlayers[0])"
            class="player-image"
          />
        </div>

        <div class="text-center">
          <UiDisplayHeader tag-size="h1" display-size="h1" emphasize>
            Seizoen {{ edition.editionNumber }}
          </UiDisplayHeader>
          <UiDisplayHeader tag-size="h2" display-size="h3">
            {{ finishedCount }} / {{ amountMatches }} wedstrijden gespeeld
          </UiDisplayHeader>

          <span
            class="inline-block px-4 py-2 bg-gray-400/50 font-bold rounded text-2xl"
          >
            {{ winsDisplay }}
          </span>
          <div class="mt-4 justify-center flex gap-4">
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
        </div>

        <div class="flex justify-center">
          <img
            :src="getPlayerImageUrl(1)"
            :alt="getPlayerFullName(rivalryPlayers[1])"
            class="player-image"
          />
        </div>
      </div>

      <div v-if="unfinishedMatches.length > 0" class="mb-6">
        <h2 class="text-lg font-bold mb-2">Wedstrijd hervatten</h2>
        <div v-for="match in unfinishedMatches" :key="match.id" class="mb-4">
          <StatsMatchSummary :match="match" />
        </div>
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

<style scoped lang="scss">
.rivalry-header {
  @apply grid grid-cols-[25%_50%_25%] items-center mb-6 py-0 relative mt-6 w-[90%] mx-auto;
  @apply backdrop-blur-sm border-gray-600/25 shadow-md shadow-black/20;
  background-color: rgb(31 41 55 / 0.7);
  background-image: linear-gradient(
    -45deg,
    rgb(55 65 81 / 0.04) 0%,
    rgb(55 65 81 / 0.01) 20%,
    rgb(156 163 175 / 0.08) 50%,
    rgb(55 65 81 / 0.01) 80%,
    rgb(55 65 81 / 0.04) 100%
  );
  background-size: 300% 300%;
  animation: rivalry-header-shift 20s ease-in-out infinite;

  .text-center {
    @apply relative -top-6;
  }

  .player-image {
    @apply h-60 w-auto;
    position: absolute;
    bottom: 0;
  }

  :deep(.display-header.h1) {
    @apply mb-3;
  }
}

@keyframes rivalry-header-shift {
  0%,
  100% {
    background-position: -100% 0%;
  }

  50% {
    background-position: 200% 0%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .rivalry-header {
    animation: none;
  }
}
</style>
