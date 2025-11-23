<script lang="ts" setup>
import type { Leg, PlayerLeg, Score } from "~/interfaces/leg";
import type { Player } from "~/interfaces/player";
import { createPlayerNameGetter } from "~/utils/player";
import CheckoutDouble from "./CheckoutDouble.vue";
import PlayerNameWithBadge from "./PlayerNameWithBadge.vue";

const props = defineProps<{
  leg: Leg;
  players: Player[];
  playerLegs: PlayerLeg[];
  scoresByPlayer: Record<string, Score[]>;
}>();

// Get max rounds for this leg
const maxRounds = computed(() => {
  let max = 0;
  Object.values(props.scoresByPlayer).forEach((scores) => {
    max = Math.max(max, scores.length);
  });
  return max;
});

// Get remaining score for a player after a specific round
const getRemainingScore = (playerId: string, roundIndex: number): number => {
  const scores = props.scoresByPlayer[playerId] || [];
  const totalThrown = scores
    .slice(0, roundIndex + 1)
    .reduce((sum, score) => sum + score.totalScore, 0);
  return props.leg.gameType - totalThrown;
};

// Get score for a specific player and round
const getScore = (playerId: string, roundIndex: number): Score | undefined => {
  return props.scoresByPlayer[playerId]?.[roundIndex];
};

// Use utility to get player names
const getPlayerName = createPlayerNameGetter(props.players);

// Check if this is a high score (100+)
const isHighScore = (score: number): boolean => {
  return score >= 100;
};
</script>

<template>
  <div class="bg-gray-800 rounded-lg p-4 mb-4">
    <div class="overflow-x-auto">
      <table class="w-full text-xs border-collapse">
        <thead>
          <tr class="pb-2 font-bold text-sm">
            <th colspan="3" class="p-2">
              <PlayerNameWithBadge
                :player-id="players[0].id"
                :players="players"
                :winner-id="leg.winner"
                :player-legs="playerLegs"
              />
            </th>
            <th colspan="3" class="p-2 text-lg font-bold">
              {{ leg.gameType }}
            </th>
            <th colspan="3" class="p-2">
              <PlayerNameWithBadge
                v-if="players[1]"
                :player-id="players[1].id"
                :players="players"
                :winner-id="leg.winner"
                :player-legs="playerLegs"
              />
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
          <tr
            v-for="roundIndex in maxRounds"
            :key="roundIndex"
            class="border-b border-gray-600"
          >
            <!-- Left Player (First Player) -->
            <td
              class="text-center p-2 bg-red-900/30 border-r-2 border-gray-600 font-bold"
              :class="{
                'text-green-400':
                  getRemainingScore(players[0].id, roundIndex - 1) ===
                    props.leg.gameType && roundIndex === 1,
                'text-red-400':
                  getRemainingScore(players[0].id, roundIndex - 1) === 0,
              }"
            >
              <div v-if="getScore(players[0].id, roundIndex - 1)">
                {{ getScore(players[0].id, roundIndex - 1)!.totalScore }}
              </div>
              <CheckoutDouble
                v-if="getRemainingScore(players[0].id, roundIndex - 1) === 0"
                :score="getScore(players[0].id, roundIndex - 1)!"
              />
            </td>

            <td class="text-left p-2 border-r border-gray-600">
              {{ getPlayerName(players[0].id) }}
            </td>

            <td class="text-center p-2 border-r border-gray-600">
              <span v-if="getScore(players[0].id, roundIndex - 1)">
                {{ getScore(players[0].id, roundIndex - 1)!.totalScore }}
              </span>
              <span v-else class="text-gray-500">-</span>
            </td>

            <td
              class="text-center p-2 bg-gray-700 border-r-2 border-gray-600 font-semibold"
              :class="{
                'text-green-400':
                  players[0].id === leg.startingPlayer && roundIndex === 1,

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
              {{ roundIndex }}
            </td>

            <!-- Center Score (Right Player's Remaining) -->
            <td
              class="text-center p-2 bg-gray-700 border-r-2 border-gray-600 font-semibold"
              :class="{
                'text-green-400':
                  players[1]?.id === leg.startingPlayer && roundIndex === 1,
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
              <span
                v-if="players[1] && getScore(players[1].id, roundIndex - 1)"
              >
                {{ getScore(players[1].id, roundIndex - 1)!.totalScore }}
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
                v-if="players[1] && getScore(players[1].id, roundIndex - 1) &&
                isHighScore(getScore(players[1].id, roundIndex -
                1)!.totalScore)"
              >
                {{ getScore(players[1].id, roundIndex - 1)!.totalScore }}
              </div>
              <CheckoutDouble
                v-if="getRemainingScore(players[1].id, roundIndex - 1) === 0"
                :score="getScore(players[1].id, roundIndex - 1)!"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
