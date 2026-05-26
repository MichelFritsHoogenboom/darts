<script setup lang="ts">
import type { CheckoutRanges, PlayerStats } from "~/interfaces/stats";
import type { Score } from "~/interfaces/leg";

const { playerStats, playerCheckouts } = defineProps<{
  playerStats: PlayerStats;
  playerCheckouts: Score[];
}>();

const bestCheckouts = computed(() =>
  [...playerCheckouts].sort((a, b) => b.totalScore - a.totalScore).slice(0, 5),
);

const formatCheckoutRangeKey = (key: keyof CheckoutRanges) =>
  key.replace("-", " - ");

const checkoutPercentage = (thrown: number, hit: number) => {
  if (!thrown) return "—";
  return `${Math.round((hit / thrown) * 100)}%`;
};

const checkoutsAbove100 = computed(() => {
  let thrown = 0;
  let hit = 0;

  for (const key of Object.keys(
    playerStats.checkouts,
  ) as (keyof CheckoutRanges)[]) {
    const min = Number(key.split("-")[0]);
    if (min <= 100) continue;
    thrown += playerStats.checkouts[key].thrown;
    hit += playerStats.checkouts[key].hit;
  }

  return { thrown, hit };
});

const checkoutsAbove100Label = computed(() => {
  const keys = Object.keys(playerStats.checkouts) as (keyof CheckoutRanges)[];
  const above = keys.filter((key) => Number(key.split("-")[0]) > 100);
  if (!above.length) return "100+";

  const min = Math.min(...above.map((key) => Number(key.split("-")[0])));
  const max = Math.max(...above.map((key) => Number(key.split("-")[1])));
  return `${min} - ${max}`;
});
</script>
<template>
  <div class="score-counts__header">Checkouts</div>
  <div class="score-counts__header">Pogingen</div>
  <div class="score-counts__header">Percentage</div>

  <div>{{ formatCheckoutRangeKey("0-40") }}</div>
  <div>{{ playerStats.checkouts["0-40"].thrown }}</div>
  <div>
    {{
      checkoutPercentage(
        playerStats.checkouts["0-40"].thrown,
        playerStats.checkouts["0-40"].hit,
      )
    }}
  </div>
  <div>{{ formatCheckoutRangeKey("41-60") }}</div>
  <div>{{ playerStats.checkouts["41-60"].thrown }}</div>
  <div>
    {{
      checkoutPercentage(
        playerStats.checkouts["41-60"].thrown,
        playerStats.checkouts["41-60"].hit,
      )
    }}
  </div>
  <div>{{ formatCheckoutRangeKey("61-80") }}</div>
  <div>{{ playerStats.checkouts["61-80"].thrown }}</div>
  <div>
    {{
      checkoutPercentage(
        playerStats.checkouts["61-80"].thrown,
        playerStats.checkouts["61-80"].hit,
      )
    }}
  </div>
  <div>{{ formatCheckoutRangeKey("81-100") }}</div>
  <div>{{ playerStats.checkouts["81-100"].thrown }}</div>
  <div>
    {{
      checkoutPercentage(
        playerStats.checkouts["81-100"].thrown,
        playerStats.checkouts["81-100"].hit,
      )
    }}
  </div>
  <div>{{ checkoutsAbove100Label }}</div>
  <div>{{ checkoutsAbove100.thrown }}</div>
  <div>
    {{
      checkoutPercentage(
        checkoutsAbove100.thrown,
        checkoutsAbove100.hit,
      )
    }}
  </div>

  <div class="score-counts__footer">Hoogste checkouts</div>
  <div class="score-counts__footer col-span-2">
    {{
      bestCheckouts.length
        ? bestCheckouts.map((score) => score.totalScore).join(", ")
        : "—"
    }}
  </div>
</template>
<style scoped>
.score-counts__header {
  @apply mb-1 font-bold;
}
.score-counts__footer {
  @apply font-bold;
}
</style>
