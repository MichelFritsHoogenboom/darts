<script setup lang="ts">
import type { Match } from "~/interfaces/match";
import type { Player } from "~/interfaces/player";
import type { PlayerStats } from "~/interfaces/stats";
import type { CompetitionEdition } from "~/interfaces/competition";
import { canStartNewMatch, computeEditionStandings } from "~/utils/rivalry";
import { getPlayerIdsFromStats } from "~/utils/player";
import { routes } from "~/utils/routes";
import { X01_GAME_PLAYED_IN } from "~/interfaces/x01MatchConfig";
import { formatX01MatchConfigSummary } from "~/utils/match";
import type { EditionBestAverages } from "~/utils/editionPlayerStats";
import { emptyEditionBestAverages } from "~/utils/editionPlayerStats";

definePageMeta({
  layout: false,
});

const route = useRoute();
const competitionId = computed(() => route.params.competitionId as string);
const editionNumberParam = computed(() => Number(route.params.editionNumber));

const { getCompetition } = useCompetitions();
const {
  getCurrentEdition,
  getEditionsForCompetition,
  createH2HMatch,
  startNewEdition,
  loadEditionPlayerStats,
  queryEditionBestAverages,
  queryEditionCamelMatchWins,
  loading: editionLoading,
} = useCompetitionEditions();
const { getMatchesByIds } = useMatches();
const { loadPlayers, players } = usePlayers();

const competition = ref<Awaited<ReturnType<typeof getCompetition>>>();
const edition = ref<CompetitionEdition>();
const currentEdition = ref<CompetitionEdition>();
const editions = ref<CompetitionEdition[]>([]);
const matches = ref<Match[]>([]);
const rivalryPlayers = ref<Player[]>([]);
const loadedEditionPlayerStats = ref<PlayerStats[]>([]);
const leftBestAverages = ref<EditionBestAverages>(emptyEditionBestAverages());
const rightBestAverages = ref<EditionBestAverages>(emptyEditionBestAverages());
const leftCamelMatchWins = ref(0);
const rightCamelMatchWins = ref(0);
const showChampionOverlay = ref(false);
const startingMatch = ref(false);
const activeTab = ref<"matches" | "stats">("matches");
const loadingBestAverages = ref(false);
const bestAveragesLoaded = ref(false);

const seasonPath = (editionNumber: number) =>
  routes.head2head.season(competitionId.value, editionNumber);

const isCurrentSeason = computed(() => {
  if (!edition.value || !currentEdition.value) return false;
  return edition.value.id === currentEdition.value.id;
});

const seasonOptions = computed(() =>
  editions.value.map((e) => ({
    value: e.editionNumber,
    label: String(e.editionNumber),
  })),
);

const selectedSeason = computed({
  get: () => edition.value?.editionNumber ?? editionNumberParam.value,
  set: (value: number) => {
    if (value === edition.value?.editionNumber) return;
    navigateTo(seasonPath(value));
  },
});

const loadDetail = async () => {
  competition.value = await getCompetition(competitionId.value);
  if (!competition.value) {
    await navigateTo(routes.head2head.index);
    return;
  }

  const allEditions = await getEditionsForCompetition(competitionId.value);
  editions.value = allEditions;

  const current = await getCurrentEdition(competitionId.value);
  if (!current) {
    await navigateTo(routes.head2head.index);
    return;
  }
  currentEdition.value = current;

  if (!Number.isFinite(editionNumberParam.value)) {
    await navigateTo(seasonPath(current.editionNumber), { replace: true });
    return;
  }

  const selected = allEditions.find(
    (e) => e.editionNumber === editionNumberParam.value,
  );
  if (!selected) {
    await navigateTo(seasonPath(current.editionNumber), { replace: true });
    return;
  }

  edition.value = selected;
  activeTab.value = "matches";
  bestAveragesLoaded.value = false;
  leftBestAverages.value = emptyEditionBestAverages();
  rightBestAverages.value = emptyEditionBestAverages();
  leftCamelMatchWins.value = 0;
  rightCamelMatchWins.value = 0;
  matches.value = await getMatchesByIds([...selected.matches]);
  matches.value.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  const loaded = await loadEditionPlayerStats(edition.value, matches.value);
  loadedEditionPlayerStats.value = loaded;

  const playerIds = getPlayerIdsFromStats(loaded);
  await loadPlayers([...playerIds]);
  rivalryPlayers.value = playerIds
    .map((id) => (players.value as Player[]).find((p) => p.id === id))
    .filter((player): player is Player => player !== undefined);
};

const loadBestAverages = async () => {
  if (bestAveragesLoaded.value || loadingBestAverages.value) return;
  const leftId = rivalryPlayers.value[0]?.id;
  const rightId = rivalryPlayers.value[1]?.id;
  if (!leftId || !rightId) return;

  loadingBestAverages.value = true;
  try {
    const finished = matches.value.filter((match) => !!match.winner);
    const [leftBest, rightBest, camelWins] = await Promise.all([
      queryEditionBestAverages(leftId, finished),
      queryEditionBestAverages(rightId, finished),
      queryEditionCamelMatchWins([leftId, rightId], finished),
    ]);
    leftBestAverages.value = leftBest;
    rightBestAverages.value = rightBest;
    leftCamelMatchWins.value = camelWins[leftId] ?? 0;
    rightCamelMatchWins.value = camelWins[rightId] ?? 0;
    bestAveragesLoaded.value = true;
  } finally {
    loadingBestAverages.value = false;
  }
};

const selectTab = async (tab: "matches" | "stats") => {
  activeTab.value = tab;
  if (tab === "stats") {
    await loadBestAverages();
  }
};

onBeforeRouteUpdate(async () => {
  await loadDetail();
});

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
  return computeEditionStandings(
    edition.value,
    matches.value,
    getPlayerIdsFromStats(loadedEditionPlayerStats.value),
  );
});

const unfinishedMatches = computed(() => {
  if (!isCurrentSeason.value) return [];
  return matches.value.filter((m) => !m.winner);
});
const finishedMatches = computed(() => matches.value.filter((m) => !!m.winner));

const finishedCount = computed(
  () => matches.value.filter((m) => m.winner).length,
);

const amountMatches = computed(
  () => edition.value?.competitionConfig.amountMatches ?? 0,
);

const showStartMatch = computed(() => {
  if (!edition.value || !isCurrentSeason.value) return false;
  return canStartNewMatch(edition.value, matches.value);
});

const showStartEdition = computed(
  () => isCurrentSeason.value && !!edition.value?.winner,
);

const winsDisplay = computed(() => {
  if (!edition.value || rivalryPlayers.value.length < 2) return "0 - 0";
  const [a, b] = getPlayerIdsFromStats(loadedEditionPlayerStats.value);
  return `${standings.value[a] ?? 0} - ${standings.value[b] ?? 0}`;
});

const pageTitle = computed(() => {
  return "Head to Head";
});

const championPlayer = computed(() => {
  if (!edition.value?.winner) return undefined;
  return rivalryPlayers.value.find((p) => p.id === edition.value?.winner);
});

const leftEditionStats = computed(() => {
  const playerId = rivalryPlayers.value[0]?.id;
  if (!playerId) return undefined;
  return loadedEditionPlayerStats.value.find(
    (stat) => stat.playerId === playerId,
  );
});

const rightEditionStats = computed(() => {
  const playerId = rivalryPlayers.value[1]?.id;
  if (!playerId) return undefined;
  return loadedEditionPlayerStats.value.find(
    (stat) => stat.playerId === playerId,
  );
});

const isSetMatchSeason = computed(
  () =>
    edition.value?.competitionConfig.matchConfig?.gamePlayedIn ===
    X01_GAME_PLAYED_IN.sets,
);

const matchConfigSummary = computed(() => {
  const config = edition.value?.competitionConfig.matchConfig;
  return config ? formatX01MatchConfigSummary(config) : "";
});

const startMatch = async () => {
  if (!edition.value || !competition.value || !isCurrentSeason.value) return;
  if (edition.value.competitionConfig.matchConfig) {
    startingMatch.value = true;
    try {
      const saved = await createH2HMatch(edition.value, competition.value);
      await navigateTo(routes.matchDetail(saved.id));
    } finally {
      startingMatch.value = false;
    }
  } else {
    await navigateTo(routes.head2head.setup(competitionId.value));
  }
};

const beginNewEdition = async () => {
  if (!edition.value || !isCurrentSeason.value) return;
  const created = await startNewEdition(competitionId.value, edition.value);
  await navigateTo(seasonPath(created.editionNumber));
};
</script>

<template>
  <NuxtLayout name="default" mode="medium">
    <template #title>
      <h1 class="page-title">{{ pageTitle }}</h1>
    </template>

    <template #left> </template>

    <template #right> </template>

    <div v-if="editionLoading && !edition" class="loading">Laden...</div>

    <div v-else-if="edition" class="page-content">
      <div class="card-panel rivalry-header">
        <div v-if="rivalryPlayers.length >= 2" class="side">
          <PlayerImage :player="rivalryPlayers[0]" :silhouette-index="0" />
        </div>

        <div class="content">
          <UiDisplayHeader
            tag-size="h1"
            display-size="h1"
            emphasize
            class="season-header"
          >
            <span>Seizoen</span>
            <select
              v-if="seasonOptions.length > 1"
              class="season-select"
              :value="selectedSeason"
              aria-label="Seizoen"
              @change="
                selectedSeason = Number(
                  ($event.target as HTMLSelectElement).value,
                )
              "
            >
              <option
                v-for="option in seasonOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
            <span v-else>{{ edition.editionNumber }}</span>
          </UiDisplayHeader>
          <UiDisplayHeader tag-size="h2" display-size="h4" class="season-meta">
            <template v-if="matchConfigSummary">
              <span>{{ matchConfigSummary }}</span>
              <span class="season-meta__sep" aria-hidden="true">•</span>
            </template>
            <span
              >{{ finishedCount }} / {{ amountMatches }} wedstrijden
              gespeeld</span
            >
          </UiDisplayHeader>

          <StatsPlayersWithCenter
            v-if="rivalryPlayers.length >= 2"
            class="stats"
            size="xlarge"
            :players="rivalryPlayers"
            :player-stats="loadedEditionPlayerStats"
            :winner-id="edition.winner"
            :show-badge="true"
          >
            <span class="wins">{{ winsDisplay }}</span>
          </StatsPlayersWithCenter>
          <div class="actions">
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

        <div v-if="rivalryPlayers.length >= 2" class="side">
          <PlayerImage :player="rivalryPlayers[1]" :silhouette-index="1" />
        </div>
      </div>

      <div v-if="unfinishedMatches.length > 0" class="section">
        <h2 class="section-title">Wedstrijd hervatten</h2>
        <div
          v-for="match in unfinishedMatches"
          :key="match.id"
          class="match-item"
        >
          <StatsMatchSummary :match="match" @deleted="loadDetail" />
        </div>
      </div>

      <div class="tabs">
        <button
          type="button"
          class="btn-gray"
          :class="{ 'bg-gray-500': activeTab === 'matches' }"
          @click="selectTab('matches')"
        >
          Wedstrijden
        </button>
        <button
          type="button"
          class="btn-gray"
          :class="{ 'bg-gray-500': activeTab === 'stats' }"
          @click="selectTab('stats')"
        >
          Statistieken
        </button>
      </div>

      <div v-if="activeTab === 'matches'">
        <div v-if="finishedMatches.length > 0">
          <div
            v-for="match in finishedMatches"
            :key="match.id"
            class="match-item"
          >
            <StatsMatchSummary :match="match" />
          </div>
        </div>
        <UiSummaryCardLayout v-else>
          <template #center>
            <div class="empty-state">Nog geen wedstrijden afgerond.</div>
          </template>
        </UiSummaryCardLayout>
      </div>

      <div v-else-if="leftEditionStats && rightEditionStats" class="section">
        <div v-if="loadingBestAverages" class="empty-state">Laden...</div>
        <StatsSeasonComparison
          v-else
          :left="leftEditionStats"
          :right="rightEditionStats"
          :left-best="leftBestAverages"
          :right-best="rightBestAverages"
          :left-camel-wins="leftCamelMatchWins"
          :right-camel-wins="rightCamelMatchWins"
          :is-set-match="isSetMatchSeason"
        />
      </div>

      <Head2headEditionChampionOverlay
        v-model="showChampionOverlay"
        :winner="championPlayer"
        :edition-number="edition.editionNumber"
      />
    </div>
  </NuxtLayout>
</template>

<style scoped lang="scss">
.page-title {
  @apply text-xl font-bold text-white mb-2;
}

.loading {
  @apply text-center text-gray-400;
}

.section {
  @apply mb-6;
}

.section-title {
  @apply text-lg font-bold mb-2;
}

.tabs {
  @apply flex gap-2 mb-4;
}

.match-item {
  @apply mb-4;
}

.empty-state {
  @apply text-gray-400 text-sm text-center;
}

.rivalry-header {
  @apply grid grid-cols-[25%_50%_25%] items-center mb-6 py-0 relative mt-6 w-[90%] mx-auto;
  @apply backdrop-blur-sm border-gray-600/25 shadow-md shadow-black/20;
  background-color: rgb(31 41 55 / 0.7);
  background-image: linear-gradient(
    -45deg,
    rgb(55 65 81 / 0.04) 0%,
    rgb(55 65 81 / 0.01) 20%,
    rgb(156 163 175 / 0.12) 50%,
    rgb(55 65 81 / 0.01) 80%,
    rgb(55 65 81 / 0.04) 100%
  );
  background-size: 300% 300%;
  animation: rivalry-header-shift 20s ease-in-out infinite;

  .side {
    @apply flex justify-center;
  }

  :deep(.player-image) {
    @apply absolute bottom-0;
  }

  .content {
    @apply text-center relative -top-6;
  }

  .stats {
    @apply my-7;

    :deep(.font-oswald) {
      @apply text-lg;
    }
  }

  .wins {
    @apply inline-block px-4 py-2 bg-gray-400/50 font-bold rounded text-2xl;
  }

  .actions {
    @apply mt-4 justify-center flex gap-4;
  }

  :deep(.display-header.h1) {
    @apply mb-3;
  }

  :deep(.season-header) {
    @apply inline-flex items-baseline justify-center gap-2;
  }

  :deep(.season-meta) {
    @apply inline-flex flex-wrap items-baseline justify-center gap-x-2 mb-0;
  }

  .season-select {
    @apply appearance-none bg-transparent border-0 border-b-2 border-current;
    @apply text-inherit uppercase cursor-pointer;
    @apply px-1 py-0 text-center outline-none;
    font-family: inherit;
    font-size: inherit;
    font-weight: inherit;
    letter-spacing: -1px;
    background-image: none;

    option {
      @apply text-base normal-case text-black;
      letter-spacing: normal;
    }
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
