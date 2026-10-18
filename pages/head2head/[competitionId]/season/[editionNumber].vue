<script setup lang="ts">
// Types
import type { Match } from "~/interfaces/match";
import type { Player } from "~/interfaces/player";
import type { PlayerStats } from "~/interfaces/stats";
import type { CompetitionEdition } from "~/interfaces/competition";
// Utils
import { canStartNewMatch, computeEditionStandings } from "~/utils/rivalry";
import { getPlayerIdsFromStats, createPlayerNameGetter } from "~/utils/player";
import { routes } from "~/utils/routes";
import { formatX01MatchConfigSummary } from "~/utils/match";
import { averageForPlayer } from "~/utils/stats";

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
  loadEditionPlayerStats,
  queryRivalryCamelSeasonWins,
  loading: editionLoading,
} = useCompetitionEditions();
const { getMatchesByIds } = useMatches();
const { loadPlayers, players } = usePlayers();
const progressLabelId = useId();

const competition = ref<Awaited<ReturnType<typeof getCompetition>>>();
const edition = ref<CompetitionEdition>();
const currentEdition = ref<CompetitionEdition>();
const editions = ref<CompetitionEdition[]>([]);
const matches = ref<Match[]>([]);
const rivalryPlayers = ref<Player[]>([]);
const loadedEditionPlayerStats = ref<PlayerStats[]>([]);
const camelSeasonWinsByPlayer = ref<Record<string, number>>({});
const showChampionOverlay = ref(false);
const showNewSeasonChoice = ref(false);
const startingMatch = ref(false);
const activeTab = ref<"matches" | "stats">("matches");

const seasonPath = (editionNumber: number) =>
  routes.head2head.season(competitionId.value, editionNumber);

const isCurrentSeason = computed(() => {
  if (!edition.value || !currentEdition.value) {
    return false;
  }
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
    if (value === edition.value?.editionNumber) {
      return;
    }
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
  camelSeasonWinsByPlayer.value = {};
  matches.value = await getMatchesByIds([...selected.matches]);
  matches.value.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  const loaded = await loadEditionPlayerStats(edition.value, matches.value);
  loadedEditionPlayerStats.value = loaded;

  const playerIds = getPlayerIdsFromStats(loaded);
  await loadPlayers([...playerIds]);
  rivalryPlayers.value = playerIds
    .map((id) => (players.value as Player[]).find((p) => p.id === id))
    .filter((player): player is Player => player !== undefined);

  camelSeasonWinsByPlayer.value = await queryRivalryCamelSeasonWins(
    playerIds,
    allEditions,
  );
};

const selectTab = (tab: "matches" | "stats") => {
  activeTab.value = tab;
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
  if (!edition.value) {
    return {};
  }
  return computeEditionStandings(
    edition.value,
    matches.value,
    getPlayerIdsFromStats(loadedEditionPlayerStats.value),
  );
});

const unfinishedMatches = computed(() => {
  if (!isCurrentSeason.value) {
    return [];
  }
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
  if (!edition.value || !isCurrentSeason.value) {
    return false;
  }
  return canStartNewMatch(edition.value, matches.value);
});

const showStartEdition = computed(
  () => isCurrentSeason.value && !!edition.value?.winner,
);

const winsDisplay = computed(() => {
  if (!edition.value || rivalryPlayers.value.length < 2) {
    return "0 - 0";
  }
  const [a, b] = getPlayerIdsFromStats(loadedEditionPlayerStats.value);
  return `${standings.value[a] ?? 0} - ${standings.value[b] ?? 0}`;
});

const pageTitle = computed(() => {
  return "Head to Head";
});

const championPlayer = computed(() => {
  if (!edition.value?.winner) {
    return undefined;
  }
  return rivalryPlayers.value.find((p) => p.id === edition.value?.winner);
});

const matchConfigSummary = computed(() => {
  const config = edition.value?.competitionConfig.matchConfig;
  return config ? formatX01MatchConfigSummary(config) : "";
});

const seasonWinsByPlayer = computed(() => {
  const counts: Record<string, number> = {};
  for (const player of rivalryPlayers.value) {
    counts[player.id] = 0;
  }
  for (const competitionEdition of editions.value) {
    const winnerId = competitionEdition.winner;
    if (winnerId && counts[winnerId] !== undefined) {
      counts[winnerId] += 1;
    }
  }
  return counts;
});

const getPlayerName = computed(() =>
  createPlayerNameGetter(rivalryPlayers.value),
);

const matchProgressPercent = computed(() => {
  if (!amountMatches.value) {
    return 0;
  }

  return Math.min(100, (finishedCount.value / amountMatches.value) * 100);
});

const seasonWinsFor = (playerId: string | undefined) =>
  playerId ? (seasonWinsByPlayer.value[playerId] ?? 0) : 0;

const camelSeasonWinsFor = (playerId: string | undefined) =>
  playerId ? (camelSeasonWinsByPlayer.value[playerId] ?? 0) : 0;

const averageFor = (playerId: string) =>
  averageForPlayer(loadedEditionPlayerStats.value, playerId);

const startMatch = async () => {
  if (!edition.value || !competition.value || !isCurrentSeason.value) {
    return;
  }
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

const openNewSeasonChoice = () => {
  showNewSeasonChoice.value = true;
};
</script>

<template>
  <NuxtLayout name="with-sidebar">
    <template #title>
      <h1 class="page-title">{{ pageTitle }}</h1>
    </template>

    <template #fullWidth>
      <div v-if="editionLoading && !edition" class="loading">Loading...</div>

      <div v-else-if="edition" class="page-header">
        <div class="rivalry-header">
          <Head2headMoleculesSeasonPlayerPanel
            v-if="rivalryPlayers.length >= 2"
            :player="rivalryPlayers[0]"
            :silhouette-index="0"
            :average="averageFor(rivalryPlayers[0].id)"
            :season-wins="seasonWinsFor(rivalryPlayers[0].id)"
            :camel-wins="camelSeasonWinsFor(rivalryPlayers[0].id)"
            :is-winner="edition.winner === rivalryPlayers[0].id"
          />

          <div class="center">
            <div class="header">
              <UiDisplayHeader
                tag-size="h1"
                display-size="h1"
                emphasize
                class="season-header"
              >
                <span>Season</span>
                <select
                  v-if="seasonOptions.length > 1"
                  class="season-number"
                  :value="selectedSeason"
                  aria-label="Season"
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
                <span v-else class="season-number">{{ selectedSeason }}</span>
              </UiDisplayHeader>
              <UiDisplayHeader
                v-if="matchConfigSummary"
                tag-size="h2"
                display-size="h4"
                class="season-meta"
              >
                {{ matchConfigSummary }}
              </UiDisplayHeader>
            </div>

            <div class="content">
              <div class="score">{{ winsDisplay }}</div>

              <div v-if="amountMatches > 0" class="progress">
                <div
                  class="progress-track"
                  role="progressbar"
                  :aria-valuenow="finishedCount"
                  :aria-valuemin="0"
                  :aria-valuemax="amountMatches"
                  :aria-labelledby="progressLabelId"
                >
                  <div
                    class="progress-fill"
                    :style="{ width: `${matchProgressPercent}%` }"
                  />
                </div>
                <span :id="progressLabelId" class="progress-label">
                  {{ finishedCount }} / {{ amountMatches }} matches played
                </span>
              </div>

              <div v-if="edition.winner" class="winner-badge">
                {{ getPlayerName(edition.winner) }} wins
              </div>
            </div>

            <div v-if="showStartMatch || showStartEdition" class="actions">
              <FormButton
                v-if="showStartMatch"
                :disabled="startingMatch"
                @click="startMatch"
              >
                New match
              </FormButton>
              <FormButton v-if="showStartEdition" @click="openNewSeasonChoice">
                New season
              </FormButton>
            </div>
          </div>

          <Head2headMoleculesSeasonPlayerPanel
            v-if="rivalryPlayers.length >= 2"
            align="right"
            :player="rivalryPlayers[1]"
            :silhouette-index="1"
            :average="averageFor(rivalryPlayers[1].id)"
            :season-wins="seasonWinsFor(rivalryPlayers[1].id)"
            :camel-wins="camelSeasonWinsFor(rivalryPlayers[1].id)"
            :is-winner="edition.winner === rivalryPlayers[1].id"
          />
        </div>
      </div>
    </template>

    <template #default>
      <template v-if="edition">
        <div v-if="unfinishedMatches.length > 0" class="section">
          <UiDisplayHeader tag-size="h2" display-size="h3">
            Resume match
          </UiDisplayHeader>
          <div
            v-for="match in unfinishedMatches"
            :key="match.id"
            class="match-item"
          >
            <StatsMatchSummary :match="match" @deleted="loadDetail" />
          </div>
        </div>

        <div class="main">
          <div class="tabs">
            <button
              type="button"
              class="tab"
              :class="{ active: activeTab === 'matches' }"
              @click="selectTab('matches')"
            >
              Matches
            </button>
            <button
              type="button"
              class="tab"
              :class="{ active: activeTab === 'stats' }"
              @click="selectTab('stats')"
            >
              Statistics
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
                <div class="empty-state">No matches finished yet.</div>
              </template>
            </UiSummaryCardLayout>
          </div>

          <div v-else class="section">
            <StatsComparison :competition-edition-id="edition.id" />
          </div>
        </div>
      </template>
    </template>

    <template #sidebar>
      <StatsHighlightsLeaderboard
        v-if="edition"
        :competition-edition="edition"
      />
    </template>
  </NuxtLayout>

  <Head2headEditionChampionOverlay
    v-if="edition"
    v-model="showChampionOverlay"
    :winner="championPlayer"
    :edition-number="edition.editionNumber"
  />

  <Head2headMoleculesNewSeasonChoice
    v-if="currentEdition"
    v-model="showNewSeasonChoice"
    :edition="currentEdition"
  />
</template>

<style scoped lang="scss">
@use "~/assets/css/utilities/animation" as *;

.page-title {
  @apply text-xl font-bold text-white mb-2;
}

.loading {
  @apply text-center text-gray-400;
}

.section {
  @apply mb-6;
}

.tabs {
  @apply flex gap-6 mb-4 border-b border-gray-600;
}

.tab {
  @apply relative -mb-px px-1 pb-2 text-lg font-bold text-gray-400;
  @apply bg-transparent border-0 border-b-2 border-transparent cursor-pointer;
  @apply transition-colors whitespace-nowrap;
  letter-spacing: -0.8px;

  &:hover {
    @apply text-gray-200;
  }

  &.active {
    @apply text-white border-dartboard-red;
    border-bottom-width: 3px;
  }
}

.match-item {
  @apply mb-4;
}

.empty-state {
  @apply text-gray-400 text-sm text-center;
}

.page-header {
  @apply w-full;
}

.rivalry-header {
  @apply grid grid-cols-[1fr_auto_1fr] items-stretch gap-x-2 mb-12 relative mt-10 w-[95%] mx-auto;
  @apply rounded-lg border-2 border-gray-600/25 shadow-md shadow-black/20;
  @apply bg-gray-800/70;
  background-image: linear-gradient(
    -45deg,
    rgb(55 65 81 / 0.04) 0%,
    rgb(55 65 81 / 0.01) 20%,
    rgb(156 163 175 / 0.12) 50%,
    rgb(55 65 81 / 0.01) 80%,
    rgb(55 65 81 / 0.04) 100%
  );
  min-height: 11rem;

  .center {
    @apply relative z-10 flex flex-col items-center justify-between self-stretch;
    @apply px-4 pt-0 pb-0 min-w-[13rem];
  }

  .header {
    @apply text-center relative z-20;
    margin-top: -1.25rem;
  }

  .content {
    @apply flex flex-col items-center py-3;
  }

  .score {
    @apply inline-block px-4 py-1.5 bg-gray-400/50 font-bold rounded text-6xl mb-2;
  }

  .progress {
    @apply flex flex-col items-center gap-1 w-full max-w-[13rem] mb-2;
  }

  .progress-track {
    @apply w-full h-1.5 rounded-full bg-gray-700/80 overflow-hidden;
  }

  .progress-fill {
    @apply h-full rounded-full bg-gray-300/80;

    @include animation {
      transition: width 0.3s ease;
    }
  }

  .progress-label {
    @apply text-sm text-gray-400;
  }

  .winner-badge {
    @apply inline-block px-3 py-1 text-sm font-semibold rounded;
    @apply bg-dartboard-blue-mid text-white;
  }

  .actions {
    @apply flex flex-wrap justify-center gap-3 relative z-20 sm:gap-4;
    margin-bottom: -1.25rem;
  }

  :deep(.display-header.h1) {
    @apply mb-2 block w-full;
  }

  :deep(.season-header) {
    @apply flex items-baseline justify-center gap-2;
  }

  :deep(.season-meta) {
    @apply mb-0 w-full;
  }

  /* One look for the season number, whether it is a picker or a single season */
  .season-number {
    @apply inline-block border-0 border-b-2 border-current;
    @apply text-inherit uppercase;
    @apply px-1 py-0 text-center;
    font-family: inherit;
    font-size: inherit;
    font-weight: inherit;
    line-height: inherit;
    letter-spacing: -1px;
  }

  select.season-number {
    @apply appearance-none bg-transparent cursor-pointer outline-none;
    background-image: none;

    option {
      @apply text-base normal-case text-black;
      letter-spacing: normal;
    }
  }
}
</style>
