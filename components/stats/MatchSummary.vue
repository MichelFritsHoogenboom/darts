<script lang="ts" setup>
import type { Match } from "~/interfaces/match";
import type { Set } from "~/interfaces/set";
import type { Leg, PlayerLeg, Score } from "~/interfaces/leg";
import { X01_GAME_PLAYED_IN } from "~/interfaces/x01MatchConfig";
import { getPlayerWinnerCount } from "~/utils/match";
import LegSummary from "./LegSummary.vue";
import SetSummary from "./SetSummary.vue";

const { match } = defineProps<{
  match: Match;
}>();

const { players } = useGame(match);

const gameState = useGame(match);
const { matchGame, loadMatchGame } = useX01Game(match, gameState);

const { getLegsForSet } = useLegs();
const { getPlayerLegsForLeg } = usePlayerLegs();
const { getScoresForPlayerLeg } = useScores();

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
        const legsData = await Promise.all(
          setLegs.map((leg) => loadLegWithScores(leg))
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
  <div class="bg-gray-700 rounded-lg p-4 mb-6">
    <h3
      class="grid grid-cols-[20%_1fr_20%] font-bold mb-2 flex justify-between items-center"
    >
      <span>
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
      </span>
      <div>
        <StatsPlayersWithCenter
          size="large"
          :players="[...players]"
          :player-legs="legsWithScores.flatMap((legData) => legData.playerLegs)"
          :winner-id="match.winner"
          :show-badge="false"
        >
          <template
            v-if="match.matchConfig.gamePlayedIn === X01_GAME_PLAYED_IN.sets"
          >
            {{
              players[0] ? getPlayerWinnerCount(players[0].id, matchGame) : 0
            }}
            -
            {{
              players[1] ? getPlayerWinnerCount(players[1].id, matchGame) : 0
            }}
          </template>
          <template v-else>
            {{
              players[0] ? getPlayerWinnerCount(players[0].id, matchGame) : 0
            }}
            -
            {{
              players[1] ? getPlayerWinnerCount(players[1].id, matchGame) : 0
            }}
          </template>
        </StatsPlayersWithCenter>
      </div>
      <span class="text-sm justify-self-end">
        {{ match.updatedAt.toLocaleDateString() }}
      </span>
    </h3>

    <!-- Display sets with their legs when in sets mode -->
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
</template>
