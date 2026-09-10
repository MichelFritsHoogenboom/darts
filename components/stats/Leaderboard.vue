<script setup lang="ts">
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faMedal, faTrophy } from "@fortawesome/free-solid-svg-icons";
import type { LeaderboardEntry } from "~/interfaces/stats";
import { createPlayerNameGetter } from "~/utils/player";
import { isWithinLastWeek } from "~/utils/date";
import {
  formatLeaderboardValue,
  type LeaderboardValueFormat,
} from "~/utils/stats";

const {
  entries,
  emptyText = "Nog geen resultaten.",
  valueFormat = "int",
} = defineProps<{
  entries: LeaderboardEntry[];
  emptyText?: string;
  valueFormat?: LeaderboardValueFormat;
}>();

const { loadPlayers, players } = usePlayers();

const getPlayerName = computed(() =>
  createPlayerNameGetter([...players.value]),
);

watch(
  () => entries.map((entry) => entry.playerId).join(","),
  async () => {
    const playerIds = [...new Set(entries.map((entry) => entry.playerId))];
    if (playerIds.length) await loadPlayers(playerIds);
  },
  { immediate: true },
);
</script>

<template>
  <div class="leaderboard">
    <p v-if="entries.length === 0" class="empty">{{ emptyText }}</p>

    <ol v-else class="list">
      <li
        v-for="(entry, index) in entries"
        :key="entry.id"
        class="row"
        :title="entry.lost ? 'Wedstrijd verloren' : undefined"
      >
        <span class="rank">
          <FontAwesomeIcon v-if="index === 0" :icon="faTrophy" class="trophy" />

          <FontAwesomeIcon
            v-else-if="index < 3"
            :icon="faMedal"
            class="medal"
          />
          <template v-else>{{ index + 1 }}</template>
        </span>

        <UiDisplayHeader
          tag-size="span"
          display-size="h2"
          compact
          class="score"
          :class="{ lost: entry.lost }"
        >
          {{ formatLeaderboardValue(entry.value, valueFormat) }}
        </UiDisplayHeader>

        <span class="player" :class="{ lost: entry.lost }">{{
          getPlayerName(entry.playerId)
        }}</span>
        <time
          class="date"
          :class="{ recent: isWithinLastWeek(entry.date) }"
          :datetime="entry.date.toISOString()"
        >
          {{ entry.date.toLocaleDateString() }}
        </time>
      </li>
    </ol>
  </div>
</template>

<style scoped lang="scss">
@use "~/assets/css/glow" as *;

.leaderboard {
  @apply w-full overflow-hidden rounded-lg border border-gray-600/30 bg-gray-800/40 backdrop-blur-sm;
}

.empty {
  @apply m-0 px-4 py-6 text-center text-sm text-gray-400;
}

.list {
  @apply m-0 list-none p-0;
}

.row {
  @apply grid items-center gap-5 px-3 py-2.5;
  grid-template-columns: auto auto minmax(0, 1fr) auto;
  @apply border-b border-gray-700/50 transition-colors duration-200;

  &:last-child {
    @apply border-b-0;
  }

  &:hover {
    @apply bg-white/[0.03];
  }

  &:nth-child(-n + 3) {
    @apply bg-gradient-to-r from-gray-700/25 to-transparent;
  }

  &:nth-child(1) .rank {
    @apply bg-gray-700/35 ring-1 ring-gray-600/40;
    @include glow-gold(0.3, 0.4);
  }

  &:nth-child(1) .trophy {
    @apply text-amber-200/75;
  }

  &:nth-child(2) .rank,
  &:nth-child(3) .rank {
    @apply bg-gray-600/20 ring-1 ring-gray-500/35;
  }

  &:nth-child(2) .medal {
    @apply text-gray-300/80;
  }

  &:nth-child(3) .medal {
    @apply text-amber-500/60;
  }

  &:nth-child(1) :deep(.score) {
    @apply text-dartboard-red;
  }
}

.rank {
  @apply flex h-7 w-7 shrink-0 items-center justify-center rounded-full;
  @apply bg-gray-700/80 text-xs font-bold tabular-nums text-gray-300;
}

.medal,
.trophy {
  @apply h-3.5 w-3.5;
}

.player {
  @apply truncate text-sm text-gray-300;
}

.score.lost,
.player.lost {
  @apply opacity-50;
}

.date {
  @apply shrink-0 text-xs text-gray-500 whitespace-nowrap;

  &.recent {
    @apply font-medium text-sky-200;
    @include glow-sky;
  }
}
</style>
