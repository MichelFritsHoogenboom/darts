<script setup lang="ts">
import type {
  BestAverages,
  CompareSide,
  PlayerStats,
  StatsCompareNumberRow,
  StatsCompareRow,
  StatsCompareSection,
} from "~/interfaces/stats";
import { emptyBestAverages } from "~/utils/averages";
import { getPlayerIdsFromStats } from "~/utils/player";
import {
  betterCheckout,
  betterNumber,
  formatAverageDisplay,
  formatCheckoutHitThrown,
  formatCheckoutPercentage,
  formatCheckoutDisplayRangeLabel,
  formatScoreDisplayRangeLabel,
  formatStatCount,
  sumCheckoutDisplayRange,
  sumScoreDisplayRange,
} from "~/utils/stats";
import {
  CHECKOUT_DISPLAY_RANGES,
  STATS_COMPARE_KIND,
  SEASON_SCORE_DISPLAY_RANGES,
} from "~/constants/stats";
import { X01_GAME_PLAYED_IN } from "~/interfaces/x01MatchConfig";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faCamel } from "~/assets/icons/faCamel";

const { competitionEditionId, matchId } = defineProps<{
  competitionEditionId?: string;
  matchId?: string;
}>();

const isMatchScope = computed(() => !!matchId);
const showCamelIcons = computed(() => !isMatchScope.value);

const loading = ref(false);
const player1Stats = ref<PlayerStats>();
const player2Stats = ref<PlayerStats>();
const player1Best = ref<BestAverages>(emptyBestAverages());
const player2Best = ref<BestAverages>(emptyBestAverages());
const player1CamelWins = ref(0);
const player2CamelWins = ref(0);
const isSetMatch = ref(false);
const seasonComplete = ref(false);

const { getPlayerStatsForMatch, getPlayerStatsForCompetitionEdition } =
  usePlayerStats();
const { getMatch, getMatchesByIds } = useMatches();
const {
  getEdition,
  queryEditionBestAverages,
  queryEditionCamelMatchWins,
} = useCompetitionEditions();

const load = async () => {
  loading.value = true;
  player1Stats.value = undefined;
  player2Stats.value = undefined;
  player1Best.value = emptyBestAverages();
  player2Best.value = emptyBestAverages();
  player1CamelWins.value = 0;
  player2CamelWins.value = 0;
  isSetMatch.value = false;
  seasonComplete.value = false;

  try {
    if (matchId) {
      const match = await getMatch(matchId);
      if (!match) return;

      const matchStats = await getPlayerStatsForMatch(matchId);
      const [player1Id, player2Id] = getPlayerIdsFromStats(matchStats);
      player1Stats.value = matchStats.find((stat) => stat.playerId === player1Id);
      player2Stats.value = matchStats.find((stat) => stat.playerId === player2Id);

      isSetMatch.value =
        match.matchConfig.gamePlayedIn === X01_GAME_PLAYED_IN.sets;

      if (player1Id && player2Id) {
        const [best1, best2] = await Promise.all([
          queryEditionBestAverages(player1Id, [match]),
          queryEditionBestAverages(player2Id, [match]),
        ]);
        player1Best.value = best1;
        player2Best.value = best2;
      }
      return;
    }

    if (!competitionEditionId) return;

    const edition = await getEdition(competitionEditionId);
    if (!edition) return;

    const [editionStats, matches] = await Promise.all([
      getPlayerStatsForCompetitionEdition(competitionEditionId),
      getMatchesByIds([...edition.matches]),
    ]);
    const [player1Id, player2Id] = getPlayerIdsFromStats(editionStats);
    player1Stats.value = editionStats.find((stat) => stat.playerId === player1Id);
    player2Stats.value = editionStats.find((stat) => stat.playerId === player2Id);

    isSetMatch.value =
      edition.competitionConfig.matchConfig?.gamePlayedIn ===
      X01_GAME_PLAYED_IN.sets;
    seasonComplete.value = !!edition.winner;

    if (!player1Id || !player2Id) return;

    const finished = matches.filter((match) => !!match.winner);
    const [best1, best2, camelWins] = await Promise.all([
      queryEditionBestAverages(player1Id, finished),
      queryEditionBestAverages(player2Id, finished),
      queryEditionCamelMatchWins([player1Id, player2Id], finished),
    ]);
    player1Best.value = best1;
    player2Best.value = best2;
    player1CamelWins.value = camelWins[player1Id] ?? 0;
    player2CamelWins.value = camelWins[player2Id] ?? 0;
  } finally {
    loading.value = false;
  }
};

watch(
  () => [competitionEditionId, matchId] as const,
  () => {
    void load();
  },
  { immediate: true },
);

const sections = computed((): StatsCompareSection[] => {
  const p1 = player1Stats.value;
  const p2 = player2Stats.value;
  if (!p1 || !p2) return [];

  const averageRows: StatsCompareNumberRow[] = [
    {
      kind: STATS_COMPARE_KIND.number,
      label: "Average",
      player1: p1.average,
      player2: p2.average,
      format: "average",
    },
    {
      kind: STATS_COMPARE_KIND.number,
      label: "First 9",
      player1: p1.firstNineAverage,
      player2: p2.firstNineAverage,
      format: "average",
    },
    {
      kind: STATS_COMPARE_KIND.number,
      label: "Scoring average",
      player1: p1.scoringDartsAverage,
      player2: p2.scoringDartsAverage,
      format: "average",
    },
    {
      kind: STATS_COMPARE_KIND.number,
      label: "Best leg",
      player1: player1Best.value.bestLegAverage ?? 0,
      player2: player2Best.value.bestLegAverage ?? 0,
      format: "average",
    },
  ];

  if (isSetMatch.value) {
    averageRows.push({
      kind: STATS_COMPARE_KIND.number,
      label: "Best set",
      player1: player1Best.value.bestSetAverage ?? 0,
      player2: player2Best.value.bestSetAverage ?? 0,
      format: "average",
    });
  }

  if (!isMatchScope.value) {
    averageRows.push({
      kind: STATS_COMPARE_KIND.number,
      label: "Best match",
      player1: player1Best.value.bestMatchAverage ?? 0,
      player2: player2Best.value.bestMatchAverage ?? 0,
      format: "average",
    });
  }

  const scoreRows: StatsCompareRow[] = SEASON_SCORE_DISPLAY_RANGES.map(
    (range) => {
      const label = formatScoreDisplayRangeLabel(range);
      const player1Value = sumScoreDisplayRange(p1.scores, range);
      const player2Value = sumScoreDisplayRange(p2.scores, range);
      const isGoldenCamel =
        range.keys.length === 1 && range.keys[0] === "goldenCamel";

      if (isGoldenCamel && showCamelIcons.value) {
        return {
          kind: STATS_COMPARE_KIND.camel,
          label,
          player1: player1Value,
          player2: player2Value,
        };
      }

      return {
        kind: STATS_COMPARE_KIND.number,
        label,
        player1: player1Value,
        player2: player2Value,
        format: "int",
      };
    },
  );

  return [
    { title: "Averages", rows: averageRows },
    { title: "Scores", rows: scoreRows },
    {
      title: "Checkouts",
      rows: [
        {
          kind: STATS_COMPARE_KIND.number,
          label: "Highest checkout",
          player1: p1.highestCheckout,
          player2: p2.highestCheckout,
          format: "int",
        },
        ...CHECKOUT_DISPLAY_RANGES.map((range) => ({
          kind: STATS_COMPARE_KIND.checkout,
          label: formatCheckoutDisplayRangeLabel(range),
          player1: sumCheckoutDisplayRange(p1.checkouts, range),
          player2: sumCheckoutDisplayRange(p2.checkouts, range),
        })),
      ],
    },
  ];
});

const displayNumber = (value: number, format?: "average" | "int") =>
  format === "average" ? formatAverageDisplay(value) : formatStatCount(value);

const camelSlots = (count: number) =>
  Array.from({ length: Math.max(0, count) }, (_, index) => index);

const camels = computed(() => {
  const p1 = player1Stats.value;
  const p2 = player2Stats.value;
  if (!p1 || !p2) {
    return {
      player1Small: 0,
      player2Small: 0,
      player1HasLarge: false,
      player2HasLarge: false,
    };
  }

  const player1Golden = p1.scores.goldenCamel;
  const player2Golden = p2.scores.goldenCamel;
  const player1Small =
    player1CamelWins.value +
    (seasonComplete.value && player1Golden > player2Golden ? 1 : 0);
  const player2Small =
    player2CamelWins.value +
    (seasonComplete.value && player2Golden > player1Golden ? 1 : 0);

  return {
    player1Small,
    player2Small,
    player1HasLarge: seasonComplete.value && player1Small > player2Small,
    player2HasLarge: seasonComplete.value && player2Small > player1Small,
  };
});

const isHighlighted = (
  row: StatsCompareRow,
  side: NonNullable<CompareSide>,
) => {
  if (row.kind === STATS_COMPARE_KIND.checkout) {
    return betterCheckout(row.player1, row.player2) === side;
  }
  return betterNumber(row.player1, row.player2) === side;
};
</script>

<template>
  <div v-if="loading" class="empty-state">Loading...</div>
  <div v-else-if="player1Stats && player2Stats" class="stats-compare">
    <section v-for="section in sections" :key="section.title" class="section">
      <h3 class="title">{{ section.title }}</h3>
      <div class="panel">
        <div
          v-for="(row, index) in section.rows"
          :key="`${section.title}-${row.label}-${index}`"
          class="row"
        >
          <div class="value player1">
            <div
              v-if="row.kind === STATS_COMPARE_KIND.camel"
              class="camels"
              aria-hidden="true"
            >
              <span
                v-if="camels.player1HasLarge"
                class="camel large"
                title="Golden camel winner this season"
              >
                <FontAwesomeIcon :icon="faCamel" />
              </span>
              <span
                v-for="camelIndex in camelSlots(camels.player1Small)"
                :key="`player1-camel-${camelIndex}`"
                class="camel"
                :title="
                  camelIndex < player1CamelWins
                    ? 'Camel match won'
                    : 'Most golden camels this season'
                "
              >
                <FontAwesomeIcon :icon="faCamel" />
              </span>
            </div>
            <span
              class="chip"
              :class="{ highlighted: isHighlighted(row, 'player1') }"
            >
              <template v-if="row.kind === STATS_COMPARE_KIND.checkout">
                <span :title="formatCheckoutPercentage(row.player1, 1)">
                  {{ formatCheckoutHitThrown(row.player1) }}
                </span>
              </template>
              <template v-else-if="row.kind === STATS_COMPARE_KIND.camel">
                {{ formatStatCount(row.player1) }}
              </template>
              <template v-else>
                {{ displayNumber(row.player1, row.format) }}
              </template>
            </span>
          </div>
          <div class="label">{{ row.label }}</div>
          <div class="value player2">
            <span
              class="chip"
              :class="{ highlighted: isHighlighted(row, 'player2') }"
            >
              <template v-if="row.kind === STATS_COMPARE_KIND.checkout">
                <span :title="formatCheckoutPercentage(row.player2, 1)">
                  {{ formatCheckoutHitThrown(row.player2) }}
                </span>
              </template>
              <template v-else-if="row.kind === STATS_COMPARE_KIND.camel">
                {{ formatStatCount(row.player2) }}
              </template>
              <template v-else>
                {{ displayNumber(row.player2, row.format) }}
              </template>
            </span>
            <div
              v-if="row.kind === STATS_COMPARE_KIND.camel"
              class="camels"
              aria-hidden="true"
            >
              <span
                v-for="camelIndex in camelSlots(camels.player2Small)"
                :key="`player2-camel-${camelIndex}`"
                class="camel"
                :title="
                  camelIndex < player2CamelWins
                    ? 'Camel match won'
                    : 'Most golden camels this season'
                "
              >
                <FontAwesomeIcon :icon="faCamel" />
              </span>
              <span
                v-if="camels.player2HasLarge"
                class="camel large"
                title="Golden camel winner this season"
              >
                <FontAwesomeIcon :icon="faCamel" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.stats-compare {
  --season-chip: #3d5a80;
  --season-chip-hot: #1a6fe8;
  @apply w-full;
}

.section {
  @apply mb-6;
}

.title {
  @apply font-bold uppercase tracking-wide text-gray-200 mb-2 text-center text-lg;
}

.panel {
  @apply px-5 py-2 backdrop-blur-md rounded-none;
  background:
    linear-gradient(
      165deg,
      rgb(75 85 99 / 0.28) 0%,
      rgb(31 41 55 / 0.5) 45%,
      rgb(17 24 39 / 0.62) 100%
    );
  border: 1px solid rgb(156 163 175 / 0.14);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.07),
    0 10px 28px rgb(0 0 0 / 0.35);
}

.row {
  @apply grid grid-cols-[1fr_auto_1fr] items-center gap-12 py-3;
  border-bottom: 1px solid rgb(75 85 99 / 0.35);

  &:last-child {
    border-bottom: 0;
  }

  &:hover {
    background: rgb(255 255 255 / 0.02);
  }
}

.label {
  @apply text-center text-gray-200 min-w-[13rem] px-6;
  font-size: 18px;
}

.value {
  @apply flex items-center gap-2;

  &.player1 {
    @apply justify-end;
  }

  &.player2 {
    @apply justify-start;
  }
}

.chip {
  @apply inline-block min-w-[3rem] px-1 text-center text-lg font-bold rounded text-white/80;
  background-color: var(--season-chip);

  &.highlighted {
    @apply text-white;
    background-color: var(--season-chip-hot);
  }
}

.camels {
  @apply flex flex-wrap items-center gap-1 max-w-[10rem];
}

.camel {
  @apply text-gray-400;
  font-size: 1rem;

  :deep(svg) {
    @apply h-[1em] w-[1em];
  }

  &.large {
    font-size: 1.55rem;
  }
}

.value.player1 .camel.large {
  @apply mr-3;
}

.value.player2 .camel.large {
  @apply ml-3;
}

.empty-state {
  @apply text-center text-gray-400 py-6;
}
</style>
