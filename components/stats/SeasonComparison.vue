<script setup lang="ts">
import type { DartsThrownHit, PlayerStats } from "~/interfaces/stats";
import type { BestAverages } from "~/interfaces/stats";
import { emptyBestAverages } from "~/utils/averages";
import {
  betterCheckout,
  betterNumber,
  checkoutsAboveLabel,
  formatAverageDisplay,
  formatCheckoutHitThrown,
  formatCheckoutPercentage,
  formatCheckoutRangeKey,
  formatScoreRangeLabel,
  formatStatCount,
  scoreRangeValue,
  sumCheckoutsAbove,
} from "~/utils/stats";
import {
  CHECKOUT_KEYS_UP_TO_100,
  SEASON_SCORE_COMPARE_KEYS,
} from "~/constants/stats";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faCamel } from "~/assets/icons/faCamel";

const {
  left,
  right,
  leftBest = emptyBestAverages(),
  rightBest = emptyBestAverages(),
  leftCamelWins = 0,
  rightCamelWins = 0,
  isSetMatch = false,
  seasonComplete = false,
} = defineProps<{
  left: PlayerStats;
  right: PlayerStats;
  leftBest?: BestAverages;
  rightBest?: BestAverages;
  leftCamelWins?: number;
  rightCamelWins?: number;
  isSetMatch?: boolean;
  seasonComplete?: boolean;
}>();

type NumberRow = {
  kind: "number";
  label: string;
  left: number;
  right: number;
  format?: "average" | "int";
};

type CheckoutRow = {
  kind: "checkout";
  label: string;
  left: DartsThrownHit;
  right: DartsThrownHit;
};

type CamelRow = {
  kind: "camel";
  label: string;
  left: number;
  right: number;
};

type CompareRow = NumberRow | CheckoutRow | CamelRow;

type Section = {
  title: string;
  rows: CompareRow[];
};

const sections = computed((): Section[] => {
  const averageRows: NumberRow[] = [
    {
      kind: "number",
      label: "Gemiddelde",
      left: left.average,
      right: right.average,
      format: "average",
    },
    {
      kind: "number",
      label: "Eerste 9",
      left: left.firstNineAverage,
      right: right.firstNineAverage,
      format: "average",
    },
    {
      kind: "number",
      label: "Scorend gemiddelde",
      left: left.scoringDartsAverage,
      right: right.scoringDartsAverage,
      format: "average",
    },
    {
      kind: "number",
      label: "Beste leg",
      left: leftBest.bestLegAverage ?? 0,
      right: rightBest.bestLegAverage ?? 0,
      format: "average",
    },
  ];

  if (isSetMatch) {
    averageRows.push({
      kind: "number",
      label: "Beste set",
      left: leftBest.bestSetAverage ?? 0,
      right: rightBest.bestSetAverage ?? 0,
      format: "average",
    });
  }

  averageRows.push({
    kind: "number",
    label: "Beste wedstrijd",
    left: leftBest.bestMatchAverage ?? 0,
    right: rightBest.bestMatchAverage ?? 0,
    format: "average",
  });

  const scoreRows: CompareRow[] = SEASON_SCORE_COMPARE_KEYS.map((key) => {
    if (key === "goldenCamel") {
      return {
        kind: "camel" as const,
        label: formatScoreRangeLabel(key),
        left: scoreRangeValue(left.scores, key),
        right: scoreRangeValue(right.scores, key),
      };
    }
    return {
      kind: "number" as const,
      label: formatScoreRangeLabel(key),
      left: scoreRangeValue(left.scores, key),
      right: scoreRangeValue(right.scores, key),
      format: "int" as const,
    };
  });

  return [
    { title: "Gemiddelden", rows: averageRows },
    { title: "Scores", rows: scoreRows },
    {
      title: "Checkouts",
      rows: [
        {
          kind: "number",
          label: "Hoogste checkout",
          left: left.highestCheckout,
          right: right.highestCheckout,
          format: "int",
        },
        ...CHECKOUT_KEYS_UP_TO_100.map((key) => ({
          kind: "checkout" as const,
          label: formatCheckoutRangeKey(key),
          left: left.checkouts[key],
          right: right.checkouts[key],
        })),
        {
          kind: "checkout",
          label: checkoutsAboveLabel(left.checkouts),
          left: sumCheckoutsAbove(left.checkouts),
          right: sumCheckoutsAbove(right.checkouts),
        },
      ],
    },
  ];
});

const displayNumber = (value: number, format?: "average" | "int") =>
  format === "average" ? formatAverageDisplay(value) : formatStatCount(value);

const camelSlots = (count: number) =>
  Array.from({ length: Math.max(0, count) }, (_, index) => index);

const leftSmallCamels = computed(() => {
  const seasonBonus =
    seasonComplete && left.scores.goldenCamel > right.scores.goldenCamel
      ? 1
      : 0;
  return leftCamelWins + seasonBonus;
});

const rightSmallCamels = computed(() => {
  const seasonBonus =
    seasonComplete && right.scores.goldenCamel > left.scores.goldenCamel
      ? 1
      : 0;
  return rightCamelWins + seasonBonus;
});

const leftHasLargeCamel = computed(
  () => seasonComplete && leftSmallCamels.value > rightSmallCamels.value,
);

const rightHasLargeCamel = computed(
  () => seasonComplete && rightSmallCamels.value > leftSmallCamels.value,
);

const isHighlighted = (row: CompareRow, side: "left" | "right") => {
  if (row.kind === "checkout") {
    return betterCheckout(row.left, row.right) === side;
  }
  return betterNumber(row.left, row.right) === side;
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
          <div class="value left">
            <div
              v-if="row.kind === 'camel'"
              class="camels"
              aria-hidden="true"
            >
              <UiIconSparkle
                v-if="leftHasLargeCamel"
                class="camel large"
                title="Gouden kameel winnaar dit seizoen"
              >
                <FontAwesomeIcon :icon="faCamel" />
              </UiIconSparkle>
              <UiIconSparkle
                v-for="camelIndex in camelSlots(leftSmallCamels)"
                :key="`left-camel-${camelIndex}`"
                class="camel"
                :title="
                  camelIndex < leftCamelWins
                    ? 'Kameel-wedstrijd gewonnen'
                    : 'Meeste gouden kamelen dit seizoen'
                "
                :style="{ animationDelay: `${camelIndex * 0.15}s` }"
              >
                <FontAwesomeIcon :icon="faCamel" />
              </UiIconSparkle>
            </div>
            <UiStatWellValue
              size="large"
              :highlighted="isHighlighted(row, 'left')"
            >
              <template v-if="row.kind === 'checkout'">
                <span :title="formatCheckoutPercentage(row.left, 1)">
                  {{ formatCheckoutHitThrown(row.left) }}
                </span>
              </template>
              <template v-else-if="row.kind === 'camel'">
                {{ formatStatCount(row.left) }}
              </template>
              <template v-else>
                {{ displayNumber(row.left, row.format) }}
              </template>
            </UiStatWellValue>
          </div>
          <div class="label">{{ row.label }}</div>
          <div class="value right">
            <UiStatWellValue
              size="large"
              :highlighted="isHighlighted(row, 'right')"
            >
              <template v-if="row.kind === 'checkout'">
                <span :title="formatCheckoutPercentage(row.right, 1)">
                  {{ formatCheckoutHitThrown(row.right) }}
                </span>
              </template>
              <template v-else-if="row.kind === 'camel'">
                {{ formatStatCount(row.right) }}
              </template>
              <template v-else>
                {{ displayNumber(row.right, row.format) }}
              </template>
            </UiStatWellValue>
            <div
              v-if="row.kind === 'camel'"
              class="camels"
              aria-hidden="true"
            >
              <UiIconSparkle
                v-for="camelIndex in camelSlots(rightSmallCamels)"
                :key="`right-camel-${camelIndex}`"
                class="camel"
                :title="
                  camelIndex < rightCamelWins
                    ? 'Kameel-wedstrijd gewonnen'
                    : 'Meeste gouden kamelen dit seizoen'
                "
                :style="{ animationDelay: `${camelIndex * 0.15}s` }"
              >
                <FontAwesomeIcon :icon="faCamel" />
              </UiIconSparkle>
              <UiIconSparkle
                v-if="rightHasLargeCamel"
                class="camel large"
                title="Gouden kameel winnaar dit seizoen"
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

    &.left {
      @apply justify-end;
    }

    &.right {
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

  .value.left .camel.large {
    @apply mr-3;
  }

  .value.right .camel.large {
    @apply ml-3;
  }
}
</style>
