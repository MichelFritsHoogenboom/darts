<script setup lang="ts">
import type {
  CheckoutRanges,
  DartsThrownHit,
  PlayerStats,
  ScoreRanges,
} from "~/interfaces/stats";
import type { EditionBestAverages } from "~/utils/editionPlayerStats";
import { emptyEditionBestAverages } from "~/utils/editionPlayerStats";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faCamel } from "~/assets/icons/faCamel";

const {
  left,
  right,
  leftBest = emptyEditionBestAverages(),
  rightBest = emptyEditionBestAverages(),
  leftCamelWins = 0,
  rightCamelWins = 0,
  isSetMatch = false,
} = defineProps<{
  left: PlayerStats;
  right: PlayerStats;
  leftBest?: EditionBestAverages;
  rightBest?: EditionBestAverages;
  leftCamelWins?: number;
  rightCamelWins?: number;
  isSetMatch?: boolean;
}>();

type CompareSide = "left" | "right" | null;

type NumberRow = {
  kind: "number";
  label: string;
  left: number;
  right: number;
  format?: "average" | "int";
  showCamels?: boolean;
};

type CheckoutRow = {
  kind: "checkout";
  label: string;
  left: DartsThrownHit;
  right: DartsThrownHit;
};

type Section = {
  title: string;
  rows: Array<NumberRow | CheckoutRow>;
};

const formatAverage = (value: number) =>
  value > 0 ? value.toFixed(1) : "—";

const formatInt = (value: number) => (value > 0 ? String(value) : "0");

const formatCheckoutHitThrown = (value: DartsThrownHit) =>
  `${value.hit}/${value.thrown}`;

const formatCheckoutPct = (value: DartsThrownHit) => {
  if (!value.thrown) return "—";
  const pct = Math.round((value.hit / value.thrown) * 1000) / 10;
  return `${pct}%`;
};

const betterNumber = (a: number, b: number): CompareSide => {
  if (a === b) return null;
  return a > b ? "left" : "right";
};

const checkoutPct = (value: DartsThrownHit) =>
  value.thrown > 0 ? value.hit / value.thrown : undefined;

const betterCheckout = (
  a: DartsThrownHit,
  b: DartsThrownHit,
): CompareSide => {
  const pctA = checkoutPct(a);
  const pctB = checkoutPct(b);
  if (pctA !== undefined && pctB !== undefined) {
    if (pctA === pctB) {
      if (a.hit === b.hit) return null;
      return a.hit > b.hit ? "left" : "right";
    }
    return pctA > pctB ? "left" : "right";
  }
  if (pctA !== undefined) return "left";
  if (pctB !== undefined) return "right";
  if (a.hit === b.hit) return null;
  return a.hit > b.hit ? "left" : "right";
};

const sumAbove100 = (checkouts: CheckoutRanges): DartsThrownHit => {
  const keys: (keyof CheckoutRanges)[] = ["101-130", "131-150", "151-170"];
  return keys.reduce(
    (acc, key) => ({
      thrown: acc.thrown + checkouts[key].thrown,
      hit: acc.hit + checkouts[key].hit,
    }),
    { thrown: 0, hit: 0 },
  );
};

const scoreValue = (stats: PlayerStats, key: keyof ScoreRanges) =>
  stats.scores[key] ?? 0;

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
      left: leftBest.bestLegAverage,
      right: rightBest.bestLegAverage,
      format: "average",
    },
  ];

  if (isSetMatch) {
    averageRows.push({
      kind: "number",
      label: "Beste set",
      left: leftBest.bestSetAverage,
      right: rightBest.bestSetAverage,
      format: "average",
    });
  }

  averageRows.push({
    kind: "number",
    label: "Beste wedstrijd",
    left: leftBest.bestMatchAverage,
    right: rightBest.bestMatchAverage,
    format: "average",
  });

  const scoreKeys: Array<{
    key: keyof ScoreRanges;
    label: string;
    showCamels?: boolean;
  }> = [
    { key: "180", label: "180's" },
    { key: "162-179", label: "162–179" },
    { key: "126-161", label: "126–161" },
    { key: "90-125", label: "90–125" },
    { key: "66-89", label: "66–89" },
    { key: "54-65", label: "54–65" },
    { key: "goldenCamel", label: "Gouden kamelen", showCamels: true },
  ];

  const checkoutKeys: Array<{ key: keyof CheckoutRanges; label: string }> = [
    { key: "0-40", label: "0–40" },
    { key: "41-60", label: "41–60" },
    { key: "61-80", label: "61–80" },
    { key: "81-100", label: "81–100" },
  ];

  return [
    { title: "Gemiddelden", rows: averageRows },
    {
      title: "Scores",
      rows: scoreKeys.map(({ key, label, showCamels }) => ({
        kind: "number" as const,
        label,
        left: scoreValue(left, key),
        right: scoreValue(right, key),
        format: "int" as const,
        showCamels,
      })),
    },
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
        ...checkoutKeys.map(({ key, label }) => ({
          kind: "checkout" as const,
          label,
          left: left.checkouts[key],
          right: right.checkouts[key],
        })),
        {
          kind: "checkout",
          label: "101–170",
          left: sumAbove100(left.checkouts),
          right: sumAbove100(right.checkouts),
        },
      ],
    },
  ];
});

const displayNumber = (row: NumberRow, side: "left" | "right") => {
  const value = side === "left" ? row.left : row.right;
  return row.format === "average" ? formatAverage(value) : formatInt(value);
};

const camelSlots = (count: number) =>
  Array.from({ length: Math.max(0, count) }, (_, index) => index);

const leftSmallCamels = computed(() => {
  const seasonBonus =
    left.scores.goldenCamel > right.scores.goldenCamel ? 1 : 0;
  return leftCamelWins + seasonBonus;
});

const rightSmallCamels = computed(() => {
  const seasonBonus =
    right.scores.goldenCamel > left.scores.goldenCamel ? 1 : 0;
  return rightCamelWins + seasonBonus;
});

const leftHasLargeCamel = computed(
  () => leftSmallCamels.value > rightSmallCamels.value,
);

const rightHasLargeCamel = computed(
  () => rightSmallCamels.value > leftSmallCamels.value,
);

const isHighlighted = (
  row: NumberRow | CheckoutRow,
  side: "left" | "right",
) => {
  const better =
    row.kind === "number"
      ? betterNumber(row.left, row.right)
      : betterCheckout(row.left, row.right);
  return better === side;
};
</script>

<template>
  <div class="season-comparison">
    <section
      v-for="section in sections"
      :key="section.title"
      class="season-comparison__section"
    >
      <h3 class="season-comparison__title">{{ section.title }}</h3>
      <UiSummaryCard
        v-for="(row, index) in section.rows"
        :key="`${section.title}-${row.label}-${index}`"
      >
        <div class="season-comparison__row">
          <div class="season-comparison__value season-comparison__value--left">
            <div
              v-if="row.kind === 'number' && row.showCamels"
              class="season-comparison__camels"
              aria-hidden="true"
            >
              <UiIconSparkle
                v-if="leftHasLargeCamel"
                class="season-comparison__camel season-comparison__camel--large"
                title="Gouden kameel winnaar dit seizoen"
              >
                <FontAwesomeIcon :icon="faCamel" />
              </UiIconSparkle>
              <UiIconSparkle
                v-for="camelIndex in camelSlots(leftSmallCamels)"
                :key="`left-camel-${camelIndex}`"
                class="season-comparison__camel"
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
              <template v-if="row.kind === 'number'">
                {{ displayNumber(row, "left") }}
              </template>
              <span
                v-else
                :title="formatCheckoutPct(row.left)"
              >
                {{ formatCheckoutHitThrown(row.left) }}
              </span>
            </UiStatWellValue>
          </div>
          <div class="season-comparison__label">{{ row.label }}</div>
          <div class="season-comparison__value season-comparison__value--right">
            <UiStatWellValue
              size="large"
              :highlighted="isHighlighted(row, 'right')"
            >
              <template v-if="row.kind === 'number'">
                {{ displayNumber(row, "right") }}
              </template>
              <span
                v-else
                :title="formatCheckoutPct(row.right)"
              >
                {{ formatCheckoutHitThrown(row.right) }}
              </span>
            </UiStatWellValue>
            <div
              v-if="row.kind === 'number' && row.showCamels"
              class="season-comparison__camels"
              aria-hidden="true"
            >
              <UiIconSparkle
                v-for="camelIndex in camelSlots(rightSmallCamels)"
                :key="`right-camel-${camelIndex}`"
                class="season-comparison__camel"
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
                class="season-comparison__camel season-comparison__camel--large"
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
}

.season-comparison__section {
  @apply mb-6 flex flex-col gap-2;
}

.season-comparison__title {
  @apply text-sm font-bold uppercase tracking-wide text-gray-400 mb-1 text-center;
}

.season-comparison__row {
  @apply grid grid-cols-[1fr_auto_1fr] items-center gap-12;
}

.season-comparison__label {
  @apply text-center text-gray-200 min-w-[13rem] px-6;
  font-size: 18px;
}

.season-comparison__value {
  @apply flex items-center gap-2;
}

.season-comparison__value--left {
  @apply justify-end;
}

.season-comparison__value--right {
  @apply justify-start;
}

.season-comparison__camels {
  @apply flex flex-wrap items-center gap-1 max-w-[10rem];
}

.season-comparison__camel {
  @apply text-amber-400;
  font-size: 1rem;

  :deep(svg) {
    @apply h-[1em] w-[1em];
  }
}

.season-comparison__camel--large {
  font-size: 1.55rem;
}

.season-comparison__value--left .season-comparison__camel--large {
  @apply mr-3;
}

.season-comparison__value--right .season-comparison__camel--large {
  @apply ml-3;
}
</style>
