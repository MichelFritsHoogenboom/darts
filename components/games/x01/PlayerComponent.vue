<script lang="ts" setup>
import type { Player } from "~/interfaces/player";
import type { Score, Leg } from "~/interfaces/leg";
import type { PlayerStats } from "~/interfaces/stats";
import type { Set } from "~/interfaces/set";

const { $listen, $unlisten } = useNuxtApp();
const {
  player,
  currentPlayerId,
  currentLeg,
  currentSet,
  matchGame,
  currentSetGame,
} = defineProps<{
  player: Player;
  currentPlayerId: string;
  realTimeScore: number;
  currentLeg?: Leg | null;
  currentSet?: Set | null;
  matchGame: Set[];
  currentSetGame?: Leg[];
}>();

const {
  getPlayerStatsForMatch,
  getPlayerStatsForSet,
  getPlayerStatsByPlayerLegId,
} = usePlayerStats();
const { getScoresForMatch } = useScores();
const {
  calculateAndUpdateMatchPlayerStatsAverages,
  calculateAndUpdateSetPlayerStatsAverages,
  calculateAndUpdatePlayerLegAverages,
} = useAverages();
const { getPlayerLegsForLeg } = usePlayerLegs();
const { getLegsForMatch } = useLegs();
const { getSetsForMatch } = useSets();

const matchId = inject<string>("matchId");

const matchPlayerStats = ref<PlayerStats | undefined>(undefined);
const setPlayerStats = ref<PlayerStats | undefined>(undefined);
const legPlayerStats = ref<PlayerStats | undefined>(undefined);
const playerScores = ref<Score[]>([]);
const lastSetAverage = ref<number>(0);
const lastLegAverage = ref<number>(0);

const updatePlayerAverages = async () => {
  if (!matchId) return;

  await calculateAndUpdateMatchPlayerStatsAverages(matchId);
  await updateMatchPlayerStats();

  // Also update set and leg averages if applicable
  if (currentSet) {
    await calculateAndUpdateSetPlayerStatsAverages(currentSet.id);
    await updateSetPlayerStats();

    const allSets = await getSetsForMatch(matchId);
    await updateLastSetAverage(allSets);
  }

  const allLegs = await getLegsForMatch(matchId);

  await updateLastLegAverage(allLegs);

  if (currentLeg) {
    await calculateAndUpdatePlayerLegAverages(currentLeg.id);
    await updateLegPlayerStats();
  }
};

const updateLastLegAverage = async (allLegs: Leg[]) => {
  if (allLegs?.length > 1) {
    await updateLegPlayerStats();

    const secondLastLeg = allLegs.at(-2);
    if (secondLastLeg) {
      const allPlayerLegs = await getPlayerLegsForLeg(secondLastLeg.id);

      // Find player leg for current player
      const playerLegForCurrentPlayer = allPlayerLegs.find(
        (pl) => pl.playerId === player.id,
      );

      if (playerLegForCurrentPlayer) {
        // Get playerStats for this playerLeg
        const stats = await getPlayerStatsByPlayerLegId(
          playerLegForCurrentPlayer.id,
        );

        // Set lastLegAverage to the average from stats
        lastLegAverage.value = stats?.average || 0;
      } else {
        lastLegAverage.value = 0;
      }
    } else {
      lastLegAverage.value = 0;
    }
  }
};

const updateLastSetAverage = async (allSets: Set[]) => {
  if (allSets?.length > 1) {
    const secondLastSet = allSets.at(-2);
    if (secondLastSet) {
      const setStats = await getPlayerStatsForSet(secondLastSet.id);
      const stats = setStats.find((stat) => stat.playerId === player.id);
      lastSetAverage.value = stats?.average ?? 0;
    } else {
      lastSetAverage.value = 0;
    }
  }
};

const updateMatchPlayerStats = async () => {
  const matchStats = await getPlayerStatsForMatch(matchId!);
  matchPlayerStats.value = matchStats.find(
    (stat) => stat.playerId === player.id,
  );
};

const updateSetPlayerStats = async () => {
  if (!currentSet) {
    setPlayerStats.value = undefined;
    return;
  }

  const setStats = await getPlayerStatsForSet(currentSet.id);
  setPlayerStats.value = setStats.find((stat) => stat.playerId === player.id);
};

const updateLegPlayerStats = async () => {
  if (!currentLeg) {
    legPlayerStats.value = undefined;
    return;
  }

  // Get all player legs for the current leg
  const playerLegs = await getPlayerLegsForLeg(currentLeg.id);
  // Find the player leg for this player
  const playerLeg = playerLegs.find((pl) => pl.playerId === player.id);

  if (!playerLeg) {
    legPlayerStats.value = undefined;
    return;
  }

  // Get stats for this player leg
  const stats = await getPlayerStatsByPlayerLegId(playerLeg.id);
  legPlayerStats.value = stats || undefined;
};

const updatePlayerScores = async () => {
  const scores = await getScoresForMatch(matchId!);
  playerScores.value = scores.filter((score) => score.playerId === player.id);
};

const updateStatsCurrentPlayer = async () => {
  if (currentPlayerId === player.id) {
    updateStats();
  }
};

const updateStats = async () => {
  await updatePlayerAverages();
  await updatePlayerScores();
};

onMounted(async () => {
  // Initialize data
  await updatePlayerAverages();
  await updatePlayerScores();

  // Listen for score submission events
  $listen("score-submitted", updateStatsCurrentPlayer);
  $listen("undo-last-turn", updateStats);
  $listen("leg-finished", updateStats);
  $listen("set-finished", updateStats);
});

onBeforeUnmount(() => {
  // Clean up event listeners
  $unlisten("score-submitted", updateStats);
  $unlisten("undo-last-turn", updateStats);
  $unlisten("leg-finished", updateStats);
  $unlisten("set-finished", updateStats);
});
</script>
<template>
  <div class="flex flex-col items-center justify-start gap-4">
    <div class="pb-2 text-center">
      <div class="font-bold text-3xl">
        <StatsPlayerNameWithBadge
          :playerId="player.id"
          :players="[player]"
          :average="matchPlayerStats?.average || 0"
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
      <GamesX01Averages
        :matchAverage="matchPlayerStats.average"
        :legAverage="legPlayerStats?.average || 0"
        :setAverage="setPlayerStats?.average || 0"
        :lastSetAverage="lastSetAverage"
        :lastLegAverage="lastLegAverage || legPlayerStats?.average || 0"
      />
    </div>
    <div class="stat-well">
      <GamesX01Checkouts :playerId="player.id" />
    </div>
  </div>
</template>

<style></style>
