<script lang="ts" setup>
import type { Leg, PlayerLeg, Score } from "~/interfaces/leg";
import type { Player } from "~/interfaces/player";
import { formatDateTime } from "~/utils/date";
import { createPlayerNameGetter } from "~/utils/player";
import { useToggle } from "@vueuse/core";
import CheckoutDouble from "./CheckoutDouble.vue";
import type { PlayerStats } from "~/interfaces/stats";

const { legIndex, leg, players, playerLegs, scoresByPlayer } = defineProps<{
  legIndex: number;
  leg: Leg;
  players: Player[];
  playerLegs: PlayerLeg[];
  scoresByPlayer: Record<string, Score[]>;
}>();

// Composable for getting player stats
const { getPlayerStatsByPlayerLegId } = usePlayerStats();

// Get max rounds for this leg
const maxRounds = computed(() => {
  let max = 0;
  Object.values(scoresByPlayer).forEach((scores) => {
    max = Math.max(max, scores.length);
  });
  return max;
});

// Get remaining score for a player after a specific round
const getRemainingScore = (playerId: string, roundIndex: number): number => {
  const scores = scoresByPlayer[playerId] || [];
  const totalThrown = scores
    .slice(0, roundIndex + 1)
    .reduce((sum, score) => sum + score.totalScore, 0);
  return leg.gameType - totalThrown;
};

// Get score for a specific player and round
const getScore = (playerId: string, roundIndex: number): Score | undefined => {
  return scoresByPlayer[playerId]?.[roundIndex];
};

// Safely get totalScore, returns 0 if score doesn't exist
const getTotalScore = (playerId: string, roundIndex: number): number => {
  return getScore(playerId, roundIndex)?.totalScore ?? 0;
};

// Get player stats for all players in the leg
const playerStatsArray = ref<PlayerStats[]>([]);

const loadPlayerStats = async () => {
  const statsPromises = playerLegs.map(async (playerLeg) => {
    const stats = await getPlayerStatsByPlayerLegId(playerLeg.id);
    return stats;
  });

  const statsArray = await Promise.all(statsPromises);
  // Filter out null values
  playerStatsArray.value = statsArray.filter(
    (stats): stats is PlayerStats => stats !== null,
  );
};

// Load player stats on mount
onMounted(() => {
  loadPlayerStats();
});

// Use utility to get player names
const getPlayerName = createPlayerNameGetter(players);

// Check if this is a high score (80+)
const isHighScore = (score: number): boolean => {
  return score >= 80;
};

// Toggle to show/hide leg details (defaults to false - hidden)
const [showLegDetails, toggleLegDetails] = useToggle(false);
</script>

<template>
  <div class="leg-summary bg-gray-800 border-b border-gray-700 px-4 pb-2 pt-1">
    <div class="overflow-x-auto">
      <table class="w-full text-sm border-collapse">
        <thead>
          <tr class="pb-2 font-bold text-sm">
            <th colspan="9" class="py-2">
              <div
                class="grid grid-cols-[1fr_6fr_1fr] items-center justify-center gap-2"
              >
                <span></span>
                <StatsPlayersWithCenter
                  :player-stats="playerStatsArray"
                  :players="players"
                  size="small"
                  :winner-id="leg.winner"
                >
                  <span class="text-sm font-bold">
                    Leg
                    <template v-if="legIndex !== undefined"
                      >{{ legIndex + 1 }}
                    </template>
                  </span>
                </StatsPlayersWithCenter>
                <button
                  @click="toggleLegDetails()"
                  class="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 transition-colors"
                  :class="{ 'bg-gray-600': showLegDetails }"
                >
                  {{ showLegDetails ? "−" : "+" }}
                </button>
              </div>
            </th>
          </tr>
          <tr v-if="showLegDetails" class="border-b-2 border-gray-600">
            <!-- Left Player Columns -->
            <th
              class="text-center p-2 bg-red-900/30 border-r-2 border-gray-600"
            >
              !
            </th>
            <th
              class="text-left p-2 font-bold text-dartboard-red border-r border-gray-600"
            >
              Player
            </th>
            <th class="text-center p-2 border-r border-gray-600">Thrown</th>
            <th class="text-center p-2 bg-gray-700 border-r-2 border-gray-600">
              Score
            </th>

            <!-- Center Round Column -->
            <th class="text-center p-2 bg-gray-700 border-r-2 border-gray-600">
              Rnd
            </th>
            <th class="text-center p-2 bg-gray-700 border-r-2 border-gray-600">
              Score
            </th>

            <!-- Right Player Columns -->
            <th class="text-center p-2 border-l-2 border-gray-600">Thrown</th>
            <th
              class="text-left p-2 font-bold text-dartboard-red border-l border-gray-600"
            >
              Player
            </th>
            <th
              class="text-center p-2 bg-red-900/30 border-l-2 border-gray-600"
            >
              !
            </th>
          </tr>
        </thead>
        <tbody v-if="showLegDetails">
          <tr class="border-b border-gray-600">
            <td
              class="text-center p-2 bg-red-900/30 border-r-2 border-gray-600 font-bold"
            >
              <template v-if="isHighScore(getTotalScore(players[0].id, 0))">
                {{ getTotalScore(players[0].id, 0) }}
              </template>
            </td>
            <td class="text-left p-2 border-r border-gray-600">
              {{ getPlayerName(players[0].id) }}
            </td>
            <td class="text-center p-2 border-r border-gray-600">
              {{ getTotalScore(players[0].id, 0) }}
            </td>
            <td
              class="text-center p-2 bg-gray-700 border-r-2 border-gray-600 font-semibold"
              :class="{
                'text-green-400': players[0].id === leg.startingPlayer,
              }"
            >
              {{ leg.gameType }}
            </td>
            <td
              class="text-center p-2 bg-gray-700 border-r-2 border-gray-600 font-semibold"
            >
              1
            </td>
            <td
              class="text-center p-2 bg-gray-700 border-r-2 border-gray-600 font-semibold"
              :class="{
                'text-green-400': players[1].id === leg.startingPlayer,
              }"
            >
              {{ leg.gameType }}
            </td>
            <td class="text-center p-2 border-r border-gray-600">
              {{ getTotalScore(players[1].id, 0) }}
            </td>
            <td class="text-left p-2 border-r border-gray-600">
              {{ getPlayerName(players[1].id) }}
            </td>
            <td
              class="text-center p-2 bg-red-900/30 border-l-2 border-gray-600 font-bold"
            >
              <template v-if="isHighScore(getTotalScore(players[1].id, 0))">
                {{ getTotalScore(players[1].id, 0) }}
              </template>
            </td>
          </tr>
          <tr
            v-for="roundIndex in maxRounds"
            :key="roundIndex"
            class="border-b border-gray-600"
          >
            <!-- Left Player (First Player) -->
            <td
              class="text-center p-2 bg-red-900/30 border-r-2 border-gray-600 font-bold"
              :class="{
                'text-red-400':
                  getRemainingScore(players[0].id, roundIndex) === 0,
              }"
            >
              <div
                v-if="
                  players[1] &&
                  getScore(players[1].id, roundIndex) &&
                  isHighScore(getTotalScore(players[0].id, roundIndex))
                "
              >
                {{ getTotalScore(players[0].id, roundIndex) }}
              </div>

              <CheckoutDouble
                v-if="
                  getRemainingScore(players[0].id, roundIndex - 1) === 0 &&
                  getScore(players[0].id, roundIndex - 1)
                "
                :score="getScore(players[0].id, roundIndex - 1)!"
              />
            </td>

            <td class="text-left p-2 border-r border-gray-600">
              {{ getPlayerName(players[0].id) }}
            </td>

            <td class="text-center p-2 border-r border-gray-600">
              <span v-if="getScore(players[0].id, roundIndex)">
                {{ getTotalScore(players[0].id, roundIndex) }}
              </span>
              <span v-else class="text-gray-500">-</span>
            </td>

            <td
              class="text-center p-2 bg-gray-700 border-r-2 border-gray-600 font-semibold"
              :class="{
                'text-red-400':
                  getRemainingScore(players[0].id, roundIndex - 1) === 0,
              }"
            >
              <span v-if="getScore(players[0].id, roundIndex - 1)">
                {{ getRemainingScore(players[0].id, roundIndex - 1) }}
              </span>
              <span v-else class="text-gray-500">-</span>
            </td>

            <!-- Center Round Number -->
            <td
              class="text-center p-2 bg-gray-700 border-r-2 border-gray-600 font-semibold"
            >
              {{ roundIndex + 1 }}
            </td>

            <!-- Center Score (Right Player's Remaining) -->
            <td
              class="text-center p-2 bg-gray-700 border-r-2 border-gray-600 font-semibold"
              :class="{
                'text-red-400':
                  getRemainingScore(players[1]?.id || '', roundIndex - 1) === 0,
              }"
            >
              <span
                v-if="players[1] && getScore(players[1].id, roundIndex - 1)"
              >
                {{ getRemainingScore(players[1].id, roundIndex - 1) }}
              </span>
              <span v-else-if="players[1]" class="text-gray-500">-</span>
            </td>

            <!-- Right Player (Second Player) -->
            <td class="text-center p-2 border-l-2 border-gray-600">
              <span v-if="players[1] && getScore(players[1].id, roundIndex)">
                {{ getTotalScore(players[1].id, roundIndex) }}
              </span>
              <span v-else-if="players[1]" class="text-gray-500">-</span>
            </td>

            <td class="text-left p-2 border-l border-gray-600">
              <span v-if="players[1]">{{ getPlayerName(players[1].id) }}</span>
            </td>

            <td
              class="text-center p-2 bg-red-900/30 border-l-2 border-gray-600 font-bold"
              :class="{
                'text-red-400':
                  getRemainingScore(players[1].id, roundIndex) === 0,
              }"
            >
              <div
                v-if="
                  players[1] &&
                  getScore(players[1].id, roundIndex) &&
                  isHighScore(getTotalScore(players[1].id, roundIndex))
                "
              >
                {{ getTotalScore(players[1].id, roundIndex) }}
              </div>
              <CheckoutDouble
                v-if="
                  players[1] &&
                  getRemainingScore(players[1].id, roundIndex - 1) === 0 &&
                  getScore(players[1].id, roundIndex - 1)
                "
                :score="getScore(players[1].id, roundIndex - 1)!"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
