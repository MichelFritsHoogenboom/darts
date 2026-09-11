<script setup lang="ts">
import type {
  BestAverages,
  CompareSide,
  PlayerStats,
  SeasonCompareNumberRow,
  SeasonCompareRow,
  SeasonCompareSection,
} from "~/interfaces/stats";
import { emptyBestAverages } from "~/utils/averages";
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
  SEASON_COMPARE_KIND,
  SEASON_SCORE_DISPLAY_RANGES,
} from "~/constants/stats";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faCamel } from "~/assets/icons/faCamel";

const {
  player1Stats,
  player2Stats,
  player1Best = emptyBestAverages(),
  player2Best = emptyBestAverages(),
  player1CamelWins = 0,
  player2CamelWins = 0,
  isSetMatch = false,
  seasonComplete = false,
} = defineProps<{
  player1Stats: PlayerStats;
  player2Stats: PlayerStats;
  player1Best?: BestAverages;
  player2Best?: BestAverages;
  player1CamelWins?: number;
  player2CamelWins?: number;
  isSetMatch?: boolean;
  seasonComplete?: boolean;
}>();

const sections = computed((): SeasonCompareSection[] => {
  const averageRows: SeasonCompareNumberRow[] = [
    {
      kind: SEASON_COMPARE_KIND.number,
      label: "Average",
      player1: player1Stats.average,
      player2: player2Stats.average,
      format: "average",
    },
    {
      kind: SEASON_COMPARE_KIND.number,
      label: "First 9",
      player1: player1Stats.firstNineAverage,
      player2: player2Stats.firstNineAverage,
      format: "average",
    },
    {
      kind: SEASON_COMPARE_KIND.number,
      label: "Scoring average",
      player1: player1Stats.scoringDartsAverage,
      player2: player2Stats.scoringDartsAverage,
      format: "average",
    },
    {
      kind: SEASON_COMPARE_KIND.number,
      label: "Best leg",
      player1: player1Best.bestLegAverage ?? 0,
      player2: player2Best.bestLegAverage ?? 0,
      format: "average",
    },
  ];

  if (isSetMatch) {
    averageRows.push({
      kind: SEASON_COMPARE_KIND.number,
      label: "Best set",
      player1: player1Best.bestSetAverage ?? 0,
      player2: player2Best.bestSetAverage ?? 0,
      format: "average",
    });
  }

  averageRows.push({
    kind: SEASON_COMPARE_KIND.number,
    label: "Best match",
    player1: player1Best.bestMatchAverage ?? 0,
    player2: player2Best.bestMatchAverage ?? 0,
    format: "average",
  });

  const scoreRows: SeasonCompareRow[] = SEASON_SCORE_DISPLAY_RANGES.map(
    (range) => {
      const label = formatScoreDisplayRangeLabel(range);
      const player1Value = sumScoreDisplayRange(player1Stats.scores, range);
      const player2Value = sumScoreDisplayRange(player2Stats.scores, range);

      if (range.keys.length === 1 && range.keys[0] === "goldenCamel") {
        return {
          kind: SEASON_COMPARE_KIND.camel,
          label,
          player1: player1Value,
          player2: player2Value,
        };
      }

      return {
        kind: SEASON_COMPARE_KIND.number,
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
          kind: SEASON_COMPARE_KIND.number,
          label: "Highest checkout",
          player1: player1Stats.highestCheckout,
          player2: player2Stats.highestCheckout,
          format: "int",
        },
        ...CHECKOUT_DISPLAY_RANGES.map((range) => ({
          kind: SEASON_COMPARE_KIND.checkout,
          label: formatCheckoutDisplayRangeLabel(range),
          player1: sumCheckoutDisplayRange(player1Stats.checkouts, range),
          player2: sumCheckoutDisplayRange(player2Stats.checkouts, range),
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
  const player1Golden = player1Stats.scores.goldenCamel;
  const player2Golden = player2Stats.scores.goldenCamel;
  const player1Small =
    player1CamelWins +
    (seasonComplete && player1Golden > player2Golden ? 1 : 0);
  const player2Small =
    player2CamelWins +
    (seasonComplete && player2Golden > player1Golden ? 1 : 0);

  return {
    player1Small,
    player2Small,
    player1HasLarge: seasonComplete && player1Small > player2Small,
    player2HasLarge: seasonComplete && player2Small > player1Small,
  };
});

const isHighlighted = (
  row: SeasonCompareRow,
  side: NonNullable<CompareSide>,
) => {
  if (row.kind === SEASON_COMPARE_KIND.checkout) {
    return betterCheckout(row.player1, row.player2) === side;
  }
  return betterNumber(row.player1, row.player2) === side;
};
</script>

<template>
  <div class="season-comparison">
    <section v-for="section in sections" :key="section.title" class="section">
      <h3 class="title">{{ section.title }}</h3>
      <UiSummaryCard
        v-for="(row, index) in section.rows"
        :key="`${section.title}-${row.label}-${index}`"
      >
        <div class="row">
          <div class="value player1">
            <div
              v-if="row.kind === SEASON_COMPARE_KIND.camel"
              class="camels"
              aria-hidden="true"
            >
              <UiIconSparkle
                v-if="camels.player1HasLarge"
                class="camel large"
                title="Golden camel winner this season"
              >
                <FontAwesomeIcon :icon="faCamel" />
              </UiIconSparkle>
              <UiIconSparkle
                v-for="camelIndex in camelSlots(camels.player1Small)"
                :key="`player1-camel-${camelIndex}`"
                class="camel"
                :title="
                  camelIndex < player1CamelWins
                    ? 'Camel match won'
                    : 'Most golden camels this season'
                "
                :style="{ animationDelay: `${camelIndex * 0.15}s` }"
              >
                <FontAwesomeIcon :icon="faCamel" />
              </UiIconSparkle>
            </div>
            <UiStatWellValue
              size="large"
              :highlighted="isHighlighted(row, 'player1')"
            >
              <template v-if="row.kind === SEASON_COMPARE_KIND.checkout">
                <span :title="formatCheckoutPercentage(row.player1, 1)">
                  {{ formatCheckoutHitThrown(row.player1) }}
                </span>
              </template>
              <template v-else-if="row.kind === SEASON_COMPARE_KIND.camel">
                {{ formatStatCount(row.player1) }}
              </template>
              <template v-else>
                {{ displayNumber(row.player1, row.format) }}
              </template>
            </UiStatWellValue>
          </div>
          <div class="label">{{ row.label }}</div>
          <div class="value player2">
            <UiStatWellValue
              size="large"
              :highlighted="isHighlighted(row, 'player2')"
            >
              <template v-if="row.kind === SEASON_COMPARE_KIND.checkout">
                <span :title="formatCheckoutPercentage(row.player2, 1)">
                  {{ formatCheckoutHitThrown(row.player2) }}
                </span>
              </template>
              <template v-else-if="row.kind === SEASON_COMPARE_KIND.camel">
                {{ formatStatCount(row.player2) }}
              </template>
              <template v-else>
                {{ displayNumber(row.player2, row.format) }}
              </template>
            </UiStatWellValue>
            <div
              v-if="row.kind === SEASON_COMPARE_KIND.camel"
              class="camels"
              aria-hidden="true"
            >
              <UiIconSparkle
                v-for="camelIndex in camelSlots(camels.player2Small)"
                :key="`player2-camel-${camelIndex}`"
                class="camel"
                :title="
                  camelIndex < player2CamelWins
                    ? 'Camel match won'
                    : 'Most golden camels this season'
                "
                :style="{ animationDelay: `${camelIndex * 0.15}s` }"
              >
                <FontAwesomeIcon :icon="faCamel" />
              </UiIconSparkle>
              <UiIconSparkle
                v-if="camels.player2HasLarge"
                class="camel large"
                title="Golden camel winner this season"
              >
                <FontAwesomeIcon :icon="faCamel" />
              </UiIconSparkle>
            </div>
          </div>
        </div>
      </UiSummaryCard>
    </section>
  </div>
</template>

<style scoped lang="scss">
.season-comparison {
  @apply w-full;

  .section {
    @apply mb-6 flex flex-col gap-2;
  }

  .title {
    @apply text-sm font-bold uppercase tracking-wide text-gray-400 mb-1 text-center;
  }

  .row {
    @apply grid grid-cols-[1fr_auto_1fr] items-center gap-12;
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

  .camels {
    @apply flex flex-wrap items-center gap-1 max-w-[10rem];
  }

  .camel {
    @apply text-amber-400;
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
}
</style>
