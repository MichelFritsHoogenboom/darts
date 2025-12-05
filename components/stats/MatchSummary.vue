<script lang="ts" setup>
import type { Match } from "~/interfaces/match";
import type { Set } from "~/interfaces/set";
import type { Leg, PlayerLeg, Score } from "~/interfaces/leg";
import { X01_GAME_PLAYED_IN } from "~/interfaces/x01MatchConfig";
import { getPlayerWinnerCount } from "~/utils/match";
import { useToggle } from "@vueuse/core";
import LegSummary from "./LegSummary.vue";
import SetSummary from "./SetSummary.vue";

const { match, openDetails = false } = defineProps<{
  match: Match;
  openDetails?: boolean;
}>();

const { players } = useGame(match);

const gameState = useGame(match);
const { matchGame, loadMatchGame } = useX01Game(match, gameState);

const { getLegsForSet } = useLegs();
const { getPlayerLegsForLeg } = usePlayerLegs();
const { getScoresForPlayerLeg } = useScores();

// Toggle to show/hide summary (defaults to false - hidden)
const [showSummary, toggleSummary] = useToggle(openDetails);

// Store loaded leg data with scores, organized by set (if sets mode)
const setsWithLegs = ref<
  Array<{
    set: Set;
    legsWithScores: Array<{
      leg: Leg;
      playerLegs: PlayerLeg[];
      scoresByPlayer: Record<string, Score[]>;
    }>;
  }>
>([]);

// Store loaded leg data for direct legs mode
const legsWithScores = ref<
  Array<{
    leg: Leg;
    playerLegs: PlayerLeg[];
    scoresByPlayer: Record<string, Score[]>;
  }>
>([]);

// Helper function to load a leg with its playerLegs and scores
const loadLegWithScores = async (
  leg: Leg
): Promise<{
  leg: Leg;
  playerLegs: PlayerLeg[];
  scoresByPlayer: Record<string, Score[]>;
}> => {
  const playerLegs = await getPlayerLegsForLeg(leg.id);

  // Load scores for each playerLeg
  const scoresByPlayer: Record<string, Score[]> = {};
  await Promise.all(
    playerLegs.map(async (playerLeg) => {
      const scores = await getScoresForPlayerLeg(playerLeg.id);
      scoresByPlayer[playerLeg.playerId] = scores;
    })
  );

  return {
    leg,
    playerLegs,
    scoresByPlayer,
  };
};

// Load all legs and their scores, organized by set if in sets mode
const loadLegsData = async () => {
  await loadMatchGame();

  if (match.matchConfig.gamePlayedIn === X01_GAME_PLAYED_IN.sets) {
    // Sets mode: organize legs by set
    const sets = matchGame.value as Set[];
    const setsData = await Promise.all(
      sets.map(async (set) => {
        const setLegs = await getLegsForSet(set.id);

        // Sort legs according to the order in set.game array
        const sortedLegs = setLegs.sort((a, b) => {
          const indexA = set.game.indexOf(a.id);
          const indexB = set.game.indexOf(b.id);
          // If not found in set.game, sort by updatedAt as fallback
          if (indexA === -1 && indexB === -1) {
            return a.updatedAt.getTime() - b.updatedAt.getTime();
          }
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });

        const legsData = await Promise.all(
          sortedLegs.map((leg) => loadLegWithScores(leg))
        );

        return {
          set,
          legsWithScores: legsData,
        };
      })
    );

    setsWithLegs.value = setsData;
  } else {
    // Direct legs mode
    const allLegs = matchGame.value as Leg[];
    const legsData = await Promise.all(
      allLegs.map((leg) => loadLegWithScores(leg))
    );

    legsWithScores.value = legsData;
  }
};

// Load data when component mounts
onBeforeMount(async () => {
  await loadLegsData();
});
</script>

<template>
  <div class="bg-gray-700 rounded-lg py-2 px-4">
    <h3
      class="grid grid-cols-[20%_1fr_20%] font-bold flex justify-between items-center"
    >
      <div>
        <span class="text-xs font-normal">
          {{ match.updatedAt.toLocaleDateString() }}
        </span>
        <div class="text-sm">
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
        </div>
      </div>

      <div>
        <StatsPlayersWithCenter
          size="medium"
          :players="[...players]"
          :player-legs="legsWithScores.flatMap((legData) => legData.playerLegs)"
          :winner-id="match.winner"
          :show-badge="false"
        >
          <span
            class="inline-block px-2 bg-gray-400/50 rounded-lg font-small font-bold"
          >
            {{
              players[0] ? getPlayerWinnerCount(players[0].id, matchGame) : 0
            }}
            -
            {{
              players[1] ? getPlayerWinnerCount(players[1].id, matchGame) : 0
            }}
          </span>
        </StatsPlayersWithCenter>
      </div>
      <div class="flex items-center gap-2 justify-self-end">
        <button
          @click="toggleSummary()"
          class="text-sm px-3 py-1 bg-gray-600 font-normal hover:bg-gray-500 rounded transition-colors no-wrap"
          :class="{ 'bg-gray-500': showSummary }"
        >
          {{ showSummary ? "Hide" : "Show" }} Details
        </button>
        <a
          v-if="!match.winner"
          :href="`/match/${match.id}`"
          class="text-sm px-3 py-1 bg-gray-500 hover:bg-red-500 rounded transition-colors no-wrap flex items-center gap-2 min-h-[1.75rem]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 640 640"
            class="w-4 h-4 fill-current"
          >
            <path
              d="M471.1 297.4C483.6 309.9 483.6 330.2 471.1 342.7L279.1 534.7C266.6 547.2 246.3 547.2 233.8 534.7C221.3 522.2 221.3 501.9 233.8 489.4L403.2 320L233.9 150.6C221.4 138.1 221.4 117.8 233.9 105.3C246.4 92.8 266.7 92.8 279.2 105.3L471.2 297.3z"
            />
          </svg>
        </a>
      </div>
    </h3>

    <!-- Display sets with their legs when in sets mode -->
    <div v-if="showSummary" class="mt-2">
      <SetSummary
        v-if="match.matchConfig.gamePlayedIn === X01_GAME_PLAYED_IN.sets"
        v-for="(setData, setIndex) in setsWithLegs"
        :key="setData.set.id"
        :set="setData.set"
        :set-index="setIndex"
        :players="[...players]"
        :legs-with-scores="setData.legsWithScores"
      />

      <!-- Display legs directly when in legs mode -->
      <LegSummary
        v-else
        v-for="(legData, index) in legsWithScores"
        :key="legData.leg.id"
        :leg-index="index"
        :leg="legData.leg"
        :players="[...players]"
        :player-legs="legData.playerLegs"
        :scores-by-player="legData.scoresByPlayer"
      />
    </div>
  </div>
</template>
