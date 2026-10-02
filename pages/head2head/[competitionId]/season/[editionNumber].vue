<script setup lang="ts">
import type { Match } from "~/interfaces/match";
import type { Player } from "~/interfaces/player";
import type { PlayerStats } from "~/interfaces/stats";
import type { CompetitionEdition } from "~/interfaces/competition";
import { canStartNewMatch, computeEditionStandings } from "~/utils/rivalry";
import { getPlayerIdsFromStats, createPlayerNameGetter } from "~/utils/player";
import { routes } from "~/utils/routes";
import { formatX01MatchConfigSummary } from "~/utils/match";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faTrophy } from "@fortawesome/free-solid-svg-icons";
import { faCamel } from "~/assets/icons/faCamel";

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
  queryRivalryCamelSeasonWins,
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
const camelSeasonWinsByPlayer = ref<Record<string, number>>({});
const showChampionOverlay = ref(false);
const startingMatch = ref(false);
const activeTab = ref<"matches" | "stats">("matches");

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

const seasonWinsFor = (playerId: string | undefined) =>
  playerId ? (seasonWinsByPlayer.value[playerId] ?? 0) : 0;

const camelSeasonWinsFor = (playerId: string | undefined) =>
  playerId ? (camelSeasonWinsByPlayer.value[playerId] ?? 0) : 0;

const getPlayerName = computed(() =>
  createPlayerNameGetter(rivalryPlayers.value),
);

const averageFor = (playerId: string | undefined) => {
  if (!playerId) return 0;
  const stats = loadedEditionPlayerStats.value.find(
    (entry) => entry.playerId === playerId,
  );
  return stats?.average ?? 0;
};

const matchProgressPercent = computed(() => {
  if (!amountMatches.value) return 0;
  return Math.min(100, (finishedCount.value / amountMatches.value) * 100);
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
  <NuxtLayout name="with-sidebar">
    <template #title>
      <h1 class="page-title">{{ pageTitle }}</h1>
    </template>

    <template #fullWidth>
      <div v-if="editionLoading && !edition" class="loading">Loading...</div>

      <div v-else-if="edition" class="page-header">
        <div class="card-panel rivalry-header">
          <div v-if="rivalryPlayers.length >= 2" class="side side--left">
            <div class="player-meta">
              <div class="player-name">
                {{ getPlayerName(rivalryPlayers[0].id) }}
              </div>
              <ul class="player-stats">
                <li class="player-stats__row" title="3 dart average">
                  <span class="player-stats__label">Season avg.</span>
                  <span class="player-stats__value">{{
                    averageFor(rivalryPlayers[0].id).toFixed(2)
                  }}</span>
                </li>
                <li class="player-stats__row">
                  <span class="player-stats__label">
                    <FontAwesomeIcon
                      :icon="faTrophy"
                      class="player-stats__icon"
                    />
                    Season wins
                  </span>
                  <span class="player-stats__value">{{
                    seasonWinsFor(rivalryPlayers[0].id)
                  }}</span>
                </li>
                <li class="player-stats__row">
                  <span class="player-stats__label">
                    <FontAwesomeIcon
                      :icon="faCamel"
                      class="player-stats__icon"
                    />
                    Camel wins
                  </span>
                  <span class="player-stats__value">{{
                    camelSeasonWinsFor(rivalryPlayers[0].id)
                  }}</span>
                </li>
              </ul>
            </div>
            <div
              class="silhouette-frame"
              :class="{
                'silhouette-frame--winner':
                  edition.winner === rivalryPlayers[0].id,
              }"
            >
              <PlayerImage :player="rivalryPlayers[0]" :silhouette-index="0" />
            </div>
          </div>

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
                  class="season-select"
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
                <span v-else>{{ edition.editionNumber }}</span>
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
                  :aria-label="`${finishedCount} of ${amountMatches} matches played`"
                >
                  <div
                    class="progress-fill"
                    :style="{ width: `${matchProgressPercent}%` }"
                  />
                </div>
                <span class="progress-label">
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
              <FormButton v-if="showStartEdition" @click="beginNewEdition">
                New season
              </FormButton>
            </div>
          </div>

          <div v-if="rivalryPlayers.length >= 2" class="side side--right">
            <div
              class="silhouette-frame"
              :class="{
                'silhouette-frame--winner':
                  edition.winner === rivalryPlayers[1].id,
              }"
            >
              <PlayerImage :player="rivalryPlayers[1]" :silhouette-index="1" />
            </div>
            <div class="player-meta player-meta--end">
              <div class="player-name">
                {{ getPlayerName(rivalryPlayers[1].id) }}
              </div>
              <ul class="player-stats">
                <li class="player-stats__row" title="3 dart average">
                  <span class="player-stats__label">Season avg.</span>
                  <span class="player-stats__value">{{
                    averageFor(rivalryPlayers[1].id).toFixed(2)
                  }}</span>
                </li>
                <li class="player-stats__row">
                  <span class="player-stats__label">
                    <FontAwesomeIcon
                      :icon="faTrophy"
                      class="player-stats__icon"
                    />
                    Season wins
                  </span>
                  <span class="player-stats__value">{{
                    seasonWinsFor(rivalryPlayers[1].id)
                  }}</span>
                </li>
                <li class="player-stats__row">
                  <span class="player-stats__label">
                    <FontAwesomeIcon
                      :icon="faCamel"
                      class="player-stats__icon"
                    />
                    Camel wins
                  </span>
                  <span class="player-stats__value">{{
                    camelSeasonWinsFor(rivalryPlayers[1].id)
                  }}</span>
                </li>
              </ul>
            </div>
          </div>
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
  @apply w-full overflow-visible;
}

.rivalry-header {
  @apply grid grid-cols-[1fr_auto_1fr] items-stretch gap-x-2 mb-12 relative mt-10 w-[95%] mx-auto;
  @apply border-gray-600/25 shadow-md shadow-black/20 overflow-visible;
  padding: 0 !important;
  background-color: rgb(31 41 55 / 0.7);
  background-image: linear-gradient(
    -45deg,
    rgb(55 65 81 / 0.04) 0%,
    rgb(55 65 81 / 0.01) 20%,
    rgb(156 163 175 / 0.12) 50%,
    rgb(55 65 81 / 0.01) 80%,
    rgb(55 65 81 / 0.04) 100%
  );
  min-height: 11rem;

  .side {
    @apply relative flex items-stretch overflow-visible min-h-[11rem];
  }

  .side--left {
    @apply justify-start;

    .silhouette-frame {
      @apply ml-auto;
    }
  }

  .side--right {
    @apply justify-end;

    .silhouette-frame {
      @apply mr-auto;
    }
  }

  .silhouette-frame {
    @apply relative z-0 shrink-0 self-end;
    margin-top: -5rem;
    margin-bottom: 0.875rem;
    border-bottom: 3px solid rgb(75 85 99 / 0.55);

    &--winner {
      border-bottom-color: theme("colors.dartboard.blue.bright");
    }

    :deep(.player-image) {
      .photo,
      .sizer {
        @apply h-64 w-auto block;
      }
    }
  }

  .player-meta {
    @apply relative z-10 flex flex-col justify-end gap-1.5 self-stretch;
    @apply w-max max-w-[16rem] pl-7 pr-4 pt-5 pb-1;
    @apply backdrop-blur-sm box-border;
    text-align: left;
    background: linear-gradient(
      90deg,
      rgb(17 24 39 / 0.55) 0%,
      rgb(17 24 39 / 0.28) 65%,
      transparent 100%
    );
  }

  .player-meta--end {
    @apply pl-4 pr-7;
    text-align: right;
    background: linear-gradient(
      270deg,
      rgb(17 24 39 / 0.55) 0%,
      rgb(17 24 39 / 0.28) 65%,
      transparent 100%
    );
  }

  .player-name {
    @apply text-3xl font-bold text-white leading-tight mb-1 whitespace-nowrap;
  }

  .player-stats {
    @apply m-0 p-0 list-none;
  }

  .player-stats__row {
    @apply flex items-center justify-between gap-4 py-2;
    border-bottom: 1px solid rgb(75 85 99 / 0.35);

    &:last-child {
      border-bottom: 0;
    }
  }

  .player-meta--end .player-stats__row {
    @apply flex-row-reverse;
  }

  .player-stats__label {
    @apply inline-flex items-center gap-2 text-base text-gray-400;
  }

  .player-stats__icon {
    @apply text-gray-400 shrink-0;
    height: 0.9375rem;
    width: 0.9375rem;
  }

  .player-stats__value {
    @apply font-oswald font-bold text-xl text-logo tabular-nums;
    letter-spacing: -0.5px;
    transform: skewX(-8deg);
  }

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
    @apply inline-block px-4 py-1.5 bg-gray-400/50 font-bold rounded text-3xl mb-2;
  }

  .progress {
    @apply flex flex-col items-center gap-1 w-full max-w-[13rem] mb-2;
  }

  .progress-track {
    @apply w-full h-1.5 rounded-full bg-gray-700/80 overflow-hidden;
  }

  .progress-fill {
    @apply h-full rounded-full bg-gray-300/80;
    transition: width 0.3s ease;
  }

  .progress-label {
    @apply text-sm text-gray-400;
  }

  .winner-badge {
    @apply inline-block px-3 py-1 text-sm font-semibold rounded;
    @apply bg-dartboard-blue-mid text-white;
  }

  .actions {
    @apply flex justify-center gap-4 relative z-20;
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
</style>
