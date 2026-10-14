<script setup lang="ts">
// Vendor
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
// Types
import type { ChartData, ChartOptions } from "chart.js";
import type {
  AverageSeriesPoint,
  LegendRow,
  SetBreakAnnotation,
} from "~/interfaces/averageChart";
import type { Player } from "~/interfaces/player";
// Constants
import {
  AVERAGE_CHART_ANIMATION,
  AVERAGE_METRICS,
  AVERAGE_PLAYER_COLORS,
  AVERAGE_VIEW_ALL,
  CHART_COLORS,
  DEFAULT_HIDDEN_AVERAGE_METRICS,
} from "~/constants/averageChart";
// Composables
import { usePreferredReducedMotion } from "@vueuse/core";
// Components
import { Line } from "vue-chartjs";
// Utils
import { changeIndices } from "~/utils/array";
import { createPlayerNameGetter } from "~/utils/player";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin,
);

const { players, seriesByPlayerId } = defineProps<{
  players: Player[];
  seriesByPlayerId: Record<string, AverageSeriesPoint[]>;
}>();

const reducedMotion = usePreferredReducedMotion();

/** `all` or a player id */
const selectedView = ref<string>(AVERAGE_VIEW_ALL);

/** Hidden dataset keys (`playerId:metric`). */
const hiddenKeys = ref(new Set<string>());

const getPlayerName = computed(() => createPlayerNameGetter(players));

const showAll = computed(() => selectedView.value === AVERAGE_VIEW_ALL);

const viewTabs = computed(() => [
  { id: AVERAGE_VIEW_ALL, label: "All" },
  ...players.map((player) => ({
    id: player.id,
    label: getPlayerName.value(player.id),
  })),
]);

const visiblePlayerIds = computed(() => {
  if (showAll.value) {
    return players.map((player) => player.id);
  }

  return [selectedView.value];
});

const referencePoints = computed(() => {
  if (players.length === 0) {
    return [];
  }

  return seriesByPlayerId[players[0].id];
});

const labels = computed(() =>
  referencePoints.value.map((point) => `Leg ${point.legIndex}`),
);

/** Leg positions where a new set starts, labelled with that set's number. */
const setBreaks = computed(() =>
  changeIndices(referencePoints.value, (point) => point.setIndex).map(
    (index) => ({
      index,
      // A break exists only where `setIndex` changed, so it is set here.
      setNumber: referencePoints.value[index].setIndex! + 1,
    }),
  ),
);

const legendRows = computed((): LegendRow[] =>
  visiblePlayerIds.value.map((playerId) => ({
    playerLabel: showAll.value ? getPlayerName.value(playerId) : null,
    items: AVERAGE_METRICS.map((metric) => {
      const key = datasetKey(playerId, metric.key);

      return {
        key,
        label: metric.label,
        color: playerColor(playerId),
        borderDash: metric.borderDash,
        borderWidth: metric.borderWidth,
        hidden: hiddenKeys.value.has(key),
      };
    }),
  })),
);

const chartData = computed((): ChartData<"line"> => {
  const datasets = visiblePlayerIds.value.flatMap((playerId) => {
    const color = playerColor(playerId);
    const points = seriesByPlayerId[playerId];
    const name = getPlayerName.value(playerId);

    return AVERAGE_METRICS.map((metric) => {
      const key = datasetKey(playerId, metric.key);

      return {
        label: showAll.value ? `${name} · ${metric.label}` : metric.label,
        data: points.map((point) => point[metric.key]),
        borderColor: color,
        backgroundColor: color,
        borderWidth: metric.borderWidth,
        borderDash: metric.borderDash,
        pointRadius: metric.key === "matchAverage" ? 3.5 : 2.5,
        pointHoverRadius: 5,
        tension: 0.25,
        spanGaps: true,
        hidden: hiddenKeys.value.has(key),
      };
    });
  });

  return {
    labels: labels.value,
    datasets,
  };
});

const animateLines = computed(() => reducedMotion.value !== "reduce");

const chartOptions = computed((): ChartOptions<"line"> => {
  const annotations: Record<string, SetBreakAnnotation> = {};

  setBreaks.value.forEach(({ index, setNumber }, i) => {
    annotations[`setBreak${i}`] = {
      type: "line",
      xMin: index - 0.5,
      xMax: index - 0.5,
      borderColor: CHART_COLORS.setBreak,
      borderWidth: 1,
      borderDash: [4, 4],
      label: {
        display: true,
        content: `Set ${setNumber}`,
        position: "start",
        color: CHART_COLORS.axis,
        backgroundColor: CHART_COLORS.annotationBackground,
        font: { size: 10 },
      },
    };
  });

  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: animateLines.value ? { ...AVERAGE_CHART_ANIMATION } : false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: CHART_COLORS.tooltipBackground,
        titleColor: CHART_COLORS.tooltipTitle,
        bodyColor: CHART_COLORS.tooltipBody,
        // Draw each key as the line it belongs to, same width and dash as the
        // legend swatch, instead of a filled square that only repeats the
        // player colour.
        boxWidth: 24,
        boxHeight: 0,
        boxPadding: 6,
        multiKeyBackground: "transparent",
        callbacks: {
          // The axis counts legs across the match; the title also names the
          // set, so a leg can be matched to the scores panel.
          title: (items) => {
            const point = referencePoints.value[items[0].dataIndex];

            if (point.setIndex === undefined) {
              return `Leg ${point.legIndex}`;
            }

            return `Set ${point.setIndex + 1} · Leg ${point.setLegIndex}`;
          },
          label: (ctx) => {
            const value = ctx.parsed.y;

            if (value == null) {
              return `${ctx.dataset.label}: —`;
            }

            return `${ctx.dataset.label}: ${value.toFixed(2)}`;
          },
          labelColor: (ctx) => ({
            backgroundColor: "transparent",
            borderColor: ctx.dataset.borderColor as string,
            borderWidth: ctx.dataset.borderWidth as number,
            // chart.js types this as a pair; an empty array is valid and solid.
            borderDash: ctx.dataset.borderDash as [number, number],
          }),
        },
      },
      annotation: {
        annotations,
      },
    },
    scales: {
      x: {
        ticks: { color: CHART_COLORS.axis },
        grid: { color: CHART_COLORS.grid },
        border: { color: CHART_COLORS.border },
      },
      y: {
        title: {
          display: true,
          text: "Average",
          color: CHART_COLORS.axis,
        },
        ticks: { color: CHART_COLORS.axis },
        grid: { color: CHART_COLORS.grid },
        border: { color: CHART_COLORS.border },
        beginAtZero: true,
      },
    },
  };
});

/** Remount chart when series selection changes so lines animate in. */
const chartKey = computed(() => {
  if (!animateLines.value) {
    return "static";
  }

  return `${selectedView.value}:${visiblePlayerIds.value.join(",")}:${labels.value.length}`;
});

/** Spoken alternative to the canvas, which carries no data for screen readers. */
const chartSummary = computed(() =>
  legendRows.value
    .map((row) => {
      const shown = row.items
        .filter((item) => !item.hidden)
        .map((item) => item.label);
      const name = row.playerLabel ?? "Selected player";

      return `${name}: ${shown.join(", ")} across ${labels.value.length} legs.`;
    })
    .join(" "),
);

const datasetKey = (playerId: string, metric: string) =>
  `${playerId}:${metric}`;

const playerColor = (playerId: string) => {
  const index = Math.max(
    0,
    players.findIndex((player) => player.id === playerId),
  );

  return AVERAGE_PLAYER_COLORS[index % AVERAGE_PLAYER_COLORS.length];
};

const resetHiddenKeys = () => {
  const next = new Set<string>();

  for (const player of players) {
    for (const metric of AVERAGE_METRICS) {
      if (DEFAULT_HIDDEN_AVERAGE_METRICS.has(metric.key)) {
        next.add(datasetKey(player.id, metric.key));
      }
    }
  }

  hiddenKeys.value = next;
};

const toggleDataset = (key: string) => {
  const next = new Set(hiddenKeys.value);

  if (next.has(key)) {
    next.delete(key);
  } else {
    next.add(key);
  }

  hiddenKeys.value = next;
};

watch(
  () => players.map((player) => player.id).join(","),
  () => {
    const valid =
      selectedView.value === AVERAGE_VIEW_ALL ||
      players.some((player) => player.id === selectedView.value);

    if (!valid) {
      selectedView.value = AVERAGE_VIEW_ALL;
    }

    resetHiddenKeys();
  },
  { immediate: true },
);
</script>

<template>
  <div class="match-average-chart">
    <div class="controls">
      <div class="views" role="group" aria-label="Chart player view">
        <button
          v-for="tab in viewTabs"
          :key="tab.id"
          type="button"
          class="view"
          :class="{ active: selectedView === tab.id }"
          :aria-pressed="selectedView === tab.id"
          @click="selectedView = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <p v-if="labels.length === 0" class="empty">No legs to chart yet.</p>

    <template v-else>
      <div class="canvas">
        <Line :key="chartKey" :data="chartData" :options="chartOptions" />
      </div>

      <p class="sr-only" role="status">{{ chartSummary }}</p>

      <div class="legend" role="group" aria-label="Chart legend">
        <div v-for="(row, ri) in legendRows" :key="ri" class="row">
          <span v-if="row.playerLabel" class="player">
            {{ row.playerLabel }}
          </span>

          <button
            v-for="item in row.items"
            :key="item.key"
            type="button"
            class="item"
            :class="{ muted: item.hidden }"
            :aria-pressed="!item.hidden"
            @click="toggleDataset(item.key)"
          >
            <span
              class="swatch"
              :style="{
                borderBottomColor: item.color,
                borderBottomWidth: `${Math.max(item.borderWidth, 1.5)}px`,
                borderBottomStyle: item.borderDash.length ? 'dashed' : 'solid',
              }"
            />
            {{ item.label }}
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
@use "~/assets/css/utilities/animation" as *;

.match-average-chart {
  // Body matches LegSummary / the stats panel inside a match card
  @apply w-full bg-gray-800 pb-2;
}

.controls {
  // Matches the SetSummary / stats panel header bar
  @apply flex flex-wrap items-center gap-3 mb-3 bg-gray-900 px-4 py-2 text-white;
}

.views {
  @apply flex gap-1;
}

.view {
  @apply px-2 py-1 text-sm font-medium text-gray-400 bg-transparent border-0 cursor-pointer rounded;

  @include animation {
    @apply transition-colors;
  }

  &:hover {
    @apply text-gray-200;
  }

  &.active {
    @apply text-white bg-gray-600;
  }
}

.empty {
  @apply text-center text-sm text-gray-400 py-8 m-0;
}

.canvas {
  @apply w-full px-4;
  height: 16rem;
}

.legend {
  @apply flex flex-col gap-1.5 mt-3 px-4;
}

.row {
  @apply flex flex-wrap items-center gap-x-3 gap-y-1;
}

.player {
  @apply text-xs font-semibold text-gray-300 mr-1 min-w-[4.5rem];
}

.item {
  @apply inline-flex items-center gap-1.5 text-xs text-gray-200 bg-transparent border-0 cursor-pointer p-0;

  @include animation {
    @apply transition-opacity;
  }

  &.muted {
    @apply opacity-40 line-through;
  }

  &:hover {
    @apply text-white;
  }
}

.swatch {
  @apply inline-block w-6 shrink-0;
  height: 0;
  border: none;
  border-bottom-width: 2px;
}
</style>
