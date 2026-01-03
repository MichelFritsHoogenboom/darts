<script lang="ts" setup>
import type { Player } from "~/interfaces/player";
import type { Score } from "~/interfaces/leg";
import type { PlayerStats } from "~/interfaces/stats";

const { $listen, $unlisten } = useNuxtApp();
const { player, currentPlayerId } = defineProps<{
  player: Player;
  currentPlayerId: string;
  realTimeScore: number;
}>();

const { getPlayerStatsForMatch } = usePlayerStats();
const { getScoresForMatch } = useScores();
const { calculateAndUpdateMatchPlayerStatsAverages } = useAverages();

const matchId = inject<string>("matchId");

const updatePlayerAverages = async () => {
  if (!matchId) return;

  await calculateAndUpdateMatchPlayerStatsAverages(matchId);
  await updateMatchPlayerStats();
};

const matchPlayerStats = ref<PlayerStats | undefined>(undefined);
const playerScores = ref<Score[]>([]);

const updateMatchPlayerStats = async () => {
  const matchStats = await getPlayerStatsForMatch(matchId!);
  matchPlayerStats.value = matchStats.find(
    (stat) => stat.playerId === player.id
  );
};

const updatePlayerScores = async () => {
  const scores = await getScoresForMatch(matchId!);
  playerScores.value = scores.filter((score) => score.playerId === player.id);
};

const updateStats = async () => {
  if (currentPlayerId === player.id) {
    await updatePlayerAverages();
    await updatePlayerScores();
  }
};

// Ensure average is always a number (handle cases where it might be stored as string)
const playerAverage = computed(() => {
  const avg = matchPlayerStats.value?.average;
  if (typeof avg === "number") return avg;
  return Number(avg) || 0;
});

onMounted(async () => {
  // Initialize data
  await updatePlayerAverages();
  await updatePlayerScores();

  // Listen for score submission events
  $listen("score-submitted", updateStats);
  $listen("undo-last-turn", updateStats);
});

onBeforeUnmount(() => {
  // Clean up event listeners
  $unlisten("score-submitted", updateStats);
  $unlisten("undo-last-turn", updateStats);
});
</script>
<template>
  <div class="flex flex-col items-center justify-start gap-4">
    <div class="pb-2 text-center">
      <div class="font-bold text-3xl">
        <StatsPlayerNameWithBadge
          :playerId="player.id"
          :players="[player]"
          :average="playerAverage"
        />
      </div>
    </div>
    <div class="stat-well">
      <strong>Mogelijke uitgooi:</strong>
      <GamesX01CheckoutSuggestions :score="realTimeScore" class="col-span-2" />
    </div>
    <div class="stat-well" v-if="matchPlayerStats">
      <GamesX01ScoreCounts
        :playerStats="matchPlayerStats"
        :playerScores="playerScores"
      />
    </div>
    <div class="stat-well" v-if="matchPlayerStats">
      <GamesX01Averages :matchplayerStats="matchPlayerStats" />
    </div>
    <div class="stat-well">
      <GamesX01Checkouts :playerId="player.id" />
    </div>
  </div>
</template>

<style></style>
