<script lang="ts" setup>
import type { Leg, PlayerLeg, Score } from "~/interfaces/leg";
import type { Player } from "~/interfaces/player";
import { createPlayerNameGetter } from "~/utils/player";
import CheckoutDouble from "./CheckoutDouble.vue";

const { legIndex, leg, players, playerLegs, scoresByPlayer } = defineProps<{
  legIndex: number;
  leg: Leg;
  players: Player[];
  playerLegs: PlayerLeg[];
  scoresByPlayer: Record<string, Score[]>;
}>();

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

// Use utility to get player names
const getPlayerName = createPlayerNameGetter(players);

// Check if this is a high score (100+)
const isHighScore = (score: number): boolean => {
  return score >= 100;
};
</script>

<template>
  <div class="leg-summary bg-gray-800 rounded-lg px-4 pb-2 pt-1 mb-4">
    <div class="overflow-x-auto">
      <table class="w-full text-xs border-collapse">
        <thead>
          <tr class="pb-2 font-bold text-sm">
            <th colspan="9" class="py-2">
              <StatsPlayersWithCenter
                :players="[...players]"
                size="small"
                :player-legs="playerLegs"
                :winner-id="leg.winner"
              >
                <span class="text-md font-bold">
                  Leg
                  <template v-if="legIndex !== undefined"
                    >{{ legIndex + 1 }}
                  </template>
                </span>
              </StatsPlayersWithCenter>
            </th>
          </tr>
          <tr class="border-b-2 border-gray-600">
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
        <tbody>
          <tr class="border-b border-gray-600">
            <td
              class="text-center p-2 bg-red-900/30 border-r-2 border-gray-600 font-bold"
            >
              {{ getTotalScore(players[0].id, 0) }}
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
              {{ getTotalScore(players[1].id, 0) }}
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
              {{ getTotalScore(players[0].id, roundIndex) }}
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
