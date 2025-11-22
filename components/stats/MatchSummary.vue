<script lang="ts" setup>
import type { Match } from "~/interfaces/match";
import { X01_GAME_PLAYED_IN } from "~/interfaces/x01MatchConfig";

const { match } = defineProps<{
  match: Match;
}>();

const { players } = useGame(match);

const gameState = useGame(match);
const { getPlayerWinnerCountOf, matchGame, loadMatchGame } = useX01Game(
  match,
  gameState
);

// Load match game data when component mounts
onBeforeMount(async () => {
  await loadMatchGame();
});
</script>

<template>
  <div class="bg-gray-700 rounded-lg p-4 mb-6">
    <h3 class="text-lg font-bold mb-2">
      {{ match.matchConfig.gameType }}
      {{ match.matchConfig.gameWinDefinition }}
      <template
        v-if="match.matchConfig.gamePlayedIn === X01_GAME_PLAYED_IN.sets"
      >
        {{ match.matchConfig.setsToWin }}
      </template>
      <template v-else>
        {{ match.matchConfig.legsToWinParent }}
      </template>

      {{ match.matchConfig.gamePlayedIn }}
    </h3>
    <div :class="`grid grid-cols-${players.length} gap-4 text-sm`">
      <div v-for="player in players" :key="player.id">
        <div class="font-bold text-dartboard-red">
          {{ getPlayerDisplayName(player) }}
        </div>
        <div v-if="match.matchConfig.gamePlayedIn === X01_GAME_PLAYED_IN.sets">
          Sets: {{ getPlayerWinnerCountOf(player.id, matchGame) }}
        </div>
        <div v-else>
          Legs:
          {{ getPlayerWinnerCountOf(player.id, matchGame) }}
        </div>
      </div>
    </div>
  </div>
</template>
