<script lang="ts" setup>
import type { Match } from "~/interfaces/match";
const { matchId } = defineProps<{ matchId: string }>();

const { getMatch } = useMatches();

const match = ref<Match | null>(null);

onMounted(async () => {
  match.value = await getMatch(matchId);
});
</script>
<template>
  <div>
    <h1>Match Summary</h1>
    <p>Match ID: {{ matchId }}</p>
    <p>Match: {{ match }}</p>
  </div>
</template>

<style></style>
