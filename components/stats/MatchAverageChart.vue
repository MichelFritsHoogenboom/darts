<script setup lang="ts">
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
} from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import { Line } from "vue-chartjs";
import type { Player } from "~/interfaces/player";
import type { MatchAverageChartPoint } from "~/interfaces/matchSummary";
import { matchAverageChartSetBreakIndices } from "~/utils/averages";
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

const VIEW_BOTH = "both";

type MetricKey =
  | "matchAverage"
  | "legAverage"
  | "legScoringDartsAverage"
  | "legFirstNineAverage";

const METRICS: {
  key: MetricKey;
  label: string;
  borderDash: number[];
  borderWidth: number;
}[] = [
  {
    key: "matchAverage",
    label: "Match",
    borderDash: [],
    borderWidth: 4,
  },
  {
    key: "legAverage",
    label: "Leg",
    borderDash: [],
    borderWidth: 2.5,
  },
  {
    key: "legScoringDartsAverage",
    label: "Scoring",
    borderDash: [6, 4],
    borderWidth: 1.5,
  },
  {
    key: "legFirstNineAverage",
    label: "First 9",
    borderDash: [2, 3],
    borderWidth: 1.5,
  },
];

/** Player 1 warm/red family; player 2 cool/blue family. */
const PLAYER_COLORS = ["#e57373", "#1a6fe8"] as const;

const DEFAULT_HIDDEN_METRICS = new Set<MetricKey>([
  "matchAverage",
  "legFirstNineAverage",
]);

const datasetKey = (playerId: string, metric: MetricKey) =>
  `${playerId}:${metric}`;

const { players, seriesByPlayerId } = defineProps<{
  players: Player[];
  seriesByPlayerId: Record<string, MatchAverageChartPoint[]>;
}>();

const getPlayerName = computed(() => createPlayerNameGetter(players));

/** `both` or a player id */
const selectedView = ref<string>(VIEW_BOTH);

/** Hidden dataset keys (`playerId:metric`). First 9 off by default. */
const hiddenKeys = ref(new Set<string>());

const resetHiddenKeys = () => {
  const next = new Set<string>();
  for (const player of players) {
    for (const metric of METRICS) {
      if (DEFAULT_HIDDEN_METRICS.has(metric.key)) {
        next.add(datasetKey(player.id, metric.key));
      }
    }
  }
  hiddenKeys.value = next;
};

resetHiddenKeys();

const viewTabs = computed(() => [
  { id: VIEW_BOTH, label: "Both" },
  ...players.map((player) => ({
    id: player.id,
    label: getPlayerName.value(player.id),
  })),
]);

watch(
  () => players.map((p) => p.id).join(","),
  () => {
    const valid =
      selectedView.value === VIEW_BOTH ||
      players.some((p) => p.id === selectedView.value);
    if (!valid) {
      selectedView.value = VIEW_BOTH;
    }
    resetHiddenKeys();
  },
);

const toggleDataset = (key: string) => {
  const next = new Set(hiddenKeys.value);
  if (next.has(key)) {
    next.delete(key);
  } else {
    next.add(key);
  }
  hiddenKeys.value = next;
};

const referencePoints = computed(() => {
  const firstId = players[0]?.id;
  return firstId ? (seriesByPlayerId[firstId] ?? []) : [];
});

const labels = computed(() =>
  referencePoints.value.map((point) => `Leg ${point.legIndex}`),
);

const setBreakIndices = computed(() =>
  matchAverageChartSetBreakIndices(referencePoints.value),
);

const showBoth = computed(() => selectedView.value === VIEW_BOTH);

const visiblePlayerIds = computed(() => {
  if (showBoth.value) {
    return players.map((p) => p.id).filter(Boolean);
  }
  return selectedView.value ? [selectedView.value] : [];
});

type LegendItem = {
  key: string;
  label: string;
  color: string;
  borderDash: number[];
  borderWidth: number;
  hidden: boolean;
};

type LegendRow = {
  playerLabel: string | null;
  items: LegendItem[];
};

const legendRows = computed((): LegendRow[] =>
  visiblePlayerIds.value.map((playerId) => {
    const playerIndex = Math.max(
      0,
      players.findIndex((p) => p.id === playerId),
    );
    const color = PLAYER_COLORS[playerIndex % PLAYER_COLORS.length];
    const name = getPlayerName.value(playerId);

    return {
      playerLabel: showBoth.value ? name : null,
      items: METRICS.map((metric) => {
        const key = datasetKey(playerId, metric.key);
        return {
          key,
          label: metric.label,
          color,
          borderDash: metric.borderDash,
          borderWidth: metric.borderWidth,
          hidden: hiddenKeys.value.has(key),
        };
      }),
    };
  }),
);

const chartData = computed((): ChartData<"line"> => {
  const datasets = visiblePlayerIds.value.flatMap((playerId) => {
    const playerIndex = Math.max(
      0,
      players.findIndex((p) => p.id === playerId),
    );
    const color = PLAYER_COLORS[playerIndex % PLAYER_COLORS.length];
    const points = seriesByPlayerId[playerId] ?? [];
    const name = getPlayerName.value(playerId);

    return METRICS.map((metric) => {
      const key = datasetKey(playerId, metric.key);
      return {
        label: showBoth.value ? `${name} · ${metric.label}` : metric.label,
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

const chartOptions = computed((): ChartOptions<"line"> => {
  const annotations: Record<
    string,
    {
      type: "line";
      xMin: number;
      xMax: number;
      borderColor: string;
      borderWidth: number;
      borderDash: number[];
      label: {
        display: boolean;
        content: string;
        position: "start";
        color: string;
        backgroundColor: string;
        font: { size: number };
      };
    }
  > = {};

  setBreakIndices.value.forEach((index, i) => {
    annotations[`setBreak${i}`] = {
      type: "line",
      xMin: index - 0.5,
      xMax: index - 0.5,
      borderColor: "rgba(156, 163, 175, 0.55)",
      borderWidth: 1,
      borderDash: [4, 4],
      label: {
        display: true,
        content: `Set ${i + 2}`,
        position: "start",
        color: "rgb(156, 163, 175)",
        backgroundColor: "rgba(17, 24, 39, 0.75)",
        font: { size: 10 },
      },
    };
  });

  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 750,
      easing: "easeOutQuart",
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(17, 24, 39, 0.92)",
        titleColor: "#fff",
        bodyColor: "rgb(229, 231, 235)",
        callbacks: {
          label: (ctx) => {
            const value = ctx.parsed.y;
            if (value == null) return `${ctx.dataset.label}: —`;
            return `${ctx.dataset.label}: ${value.toFixed(2)}`;
          },
        },
      },
      annotation: {
        annotations,
      },
    },
    scales: {
      x: {
        ticks: { color: "rgb(156, 163, 175)" },
        grid: { color: "rgba(75, 85, 99, 0.35)" },
        border: { color: "rgba(75, 85, 99, 0.5)" },
      },
      y: {
        title: {
          display: true,
          text: "Average",
          color: "rgb(156, 163, 175)",
        },
        ticks: { color: "rgb(156, 163, 175)" },
        grid: { color: "rgba(75, 85, 99, 0.35)" },
        border: { color: "rgba(75, 85, 99, 0.5)" },
        beginAtZero: true,
      },
    },
  };
});

/** Remount chart when series selection changes so lines animate in. */
const chartKey = computed(
  () =>
    `${selectedView.value}:${visiblePlayerIds.value.join(",")}:${labels.value.length}`,
);
</script>

<template>
  <div class="match-average-chart">
    <div class="controls">
      <div class="tabs">
        <button
          v-for="tab in viewTabs"
          :key="tab.id"
          type="button"
          class="tab"
          :class="{ active: selectedView === tab.id }"
          @click="selectedView = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <p v-if="labels.length === 0" class="empty">No legs to chart yet.</p>
    <template v-else>
      <div class="canvas-wrap">
        <Line :key="chartKey" :data="chartData" :options="chartOptions" />
      </div>

      <div class="legend" aria-label="Chart legend">
        <div v-for="(row, ri) in legendRows" :key="ri" class="legend-row">
          <span v-if="row.playerLabel" class="legend-player">
            {{ row.playerLabel }}
          </span>
          <button
            v-for="item in row.items"
            :key="item.key"
            type="button"
            class="legend-item"
            :class="{ muted: item.hidden }"
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
.match-average-chart {
  @apply w-full;
}

.controls {
  @apply flex flex-wrap items-center gap-3 mb-3 px-1;
}

.tabs {
  @apply flex gap-1;
}

.tab {
  @apply px-2 py-1 text-sm font-medium text-gray-400 bg-transparent border-0 cursor-pointer transition-colors rounded;

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

.canvas-wrap {
  @apply w-full px-1;
  height: 16rem;
}

.legend {
  @apply flex flex-col gap-1.5 mt-3 px-1;
}

.legend-row {
  @apply flex flex-wrap items-center gap-x-3 gap-y-1;
}

.legend-player {
  @apply text-xs font-semibold text-gray-300 mr-1 min-w-[4.5rem];
}

.legend-item {
  @apply inline-flex items-center gap-1.5 text-xs text-gray-200 bg-transparent border-0 cursor-pointer p-0 transition-opacity;

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
