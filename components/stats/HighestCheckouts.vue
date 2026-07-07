<script setup lang="ts">
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faMedal } from "@fortawesome/free-solid-svg-icons";
import type { Score } from "~/interfaces/leg";
import { createPlayerNameGetter } from "~/utils/player";
import { isWithinLastWeek } from "~/utils/date";

const { scores } = defineProps<{
  scores: Score[];
}>();

const { loadPlayers, players } = usePlayers();

const getPlayerName = computed(() =>
  createPlayerNameGetter([...players.value]),
);

onMounted(async () => {
  const playerIds = [...new Set(scores.map((score) => score.playerId))];
  await loadPlayers(playerIds);
});
</script>

<template>
  <div class="leaderboard">
    <p v-if="scores.length === 0" class="empty">Nog geen checkouts.</p>

    <ol v-else class="list">
      <li v-for="(score, index) in scores" :key="score.id" class="row">
        <span class="rank">
          <FontAwesomeIcon v-if="index < 3" :icon="faMedal" class="medal" />
          <template v-else>{{ index + 1 }}</template>
        </span>

        <UiDisplayHeader
          tag-size="span"
          display-size="h2"
          compact
          class="score"
        >
          {{ score.totalScore }}
        </UiDisplayHeader>

        <span class="player">{{ getPlayerName(score.playerId) }}</span>
        <time
          class="date"
          :class="{ recent: isWithinLastWeek(score.createdAt) }"
          :datetime="score.createdAt.toISOString()"
        >
          {{ score.createdAt.toLocaleDateString() }}
        </time>
      </li>
    </ol>
  </div>
</template>

<style scoped lang="scss">
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
    @apply bg-gradient-to-r from-white/[0.04] to-transparent;
  }

  &:nth-child(1) .rank {
    @apply bg-amber-500/20 ring-1 ring-amber-400/40;
  }

  &:nth-child(1) .medal {
    @apply text-amber-300;
  }

  &:nth-child(2) .rank {
    @apply bg-gray-400/15 ring-1 ring-gray-300/30;
  }

  &:nth-child(2) .medal {
    @apply text-gray-200;
  }

  &:nth-child(3) .rank {
    @apply bg-orange-500/15 ring-1 ring-orange-400/30;
  }

  &:nth-child(3) .medal {
    @apply text-orange-300;
  }

  &:nth-child(1) :deep(.score) {
    @apply text-dartboard-red;
  }
}

.rank {
  @apply flex h-7 w-7 shrink-0 items-center justify-center rounded-full;
  @apply bg-gray-700/80 text-xs font-bold tabular-nums text-gray-300;
}

.medal {
  @apply h-3.5 w-3.5;
}

.details {
  @apply flex min-w-0 flex-col gap-0.5;
}

.player {
  @apply truncate text-sm text-gray-300;
}

.date {
  @apply shrink-0 text-xs text-gray-500 whitespace-nowrap;

  &.recent {
    @apply rounded px-1.5 py-0.5 font-medium text-sky-200;
    background: rgb(56 189 248 / 0.12);
    box-shadow: 0 0 12px rgb(125 211 252 / 0.35);
  }
}
</style>
