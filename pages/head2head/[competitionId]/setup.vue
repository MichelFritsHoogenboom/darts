<script setup lang="ts">
import { defaultX01MatchConfig } from "~/interfaces/x01MatchConfig";
import type { Player } from "~/interfaces/player";
import { getPlayerFullName } from "~/utils/player";

definePageMeta({
  layout: false,
});

const route = useRoute();
const competitionId = computed(() => route.params.competitionId as string);

const { getCompetition } = useCompetitions();
const { getCurrentEdition, createH2HMatch } = useCompetitionEditions();
const { loadPlayers, players } = usePlayers();

const matchConfig = ref({ ...defaultX01MatchConfig });
const saving = ref(false);
const editionPlayerIds = ref<string[]>([]);

onBeforeMount(async () => {
  const competition = await getCompetition(competitionId.value);
  if (!competition) {
    await navigateTo("/head2head");
    return;
  }

  const edition = await getCurrentEdition(competitionId.value);
  if (!edition || edition.winner) {
    await navigateTo(`/head2head/${competitionId.value}`);
    return;
  }

  editionPlayerIds.value = [...edition.playerIds];
  await loadPlayers(editionPlayerIds.value);
});

const editionPlayers = computed(() =>
  editionPlayerIds.value
    .map((id) => (players.value as Player[]).find((p) => p.id === id))
    .filter((p): p is Player => p !== undefined)
);

const startMatch = async () => {
  saving.value = true;
  try {
    const competition = await getCompetition(competitionId.value);
    const edition = await getCurrentEdition(competitionId.value);
    if (!competition || !edition) return;

    const saved = await createH2HMatch(
      edition,
      competition,
      { ...matchConfig.value }
    );
    await navigateTo(`/match/${saved.id}`);
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <NuxtLayout name="default">
    <template #title>
      <h1 class="text-xl font-bold text-white mb-2">Wedstrijd instellen</h1>
    </template>

    <div class="max-w-4xl mx-auto">
      <div class="player-card inactive rounded-lg p-8 mb-6">
        <h2 class="text-lg font-semibold text-white mb-4">Spelers</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="player in editionPlayers"
            :key="player.id"
            class="bg-gray-700 p-4"
          >
            <p class="text-white font-medium">{{ getPlayerFullName(player) }}</p>
          </div>
        </div>
      </div>

      <SetupX01MatchSetup v-model="matchConfig">
        <template #footer>
          <div class="flex gap-4 justify-end w-full">
            <NuxtLink
              :to="`/head2head/${competitionId}`"
              class="btn-gray px-6 py-2"
            >
              Annuleren
            </NuxtLink>
            <FormButton :disabled="saving" @click="startMatch">
              Start wedstrijd
            </FormButton>
          </div>
        </template>
      </SetupX01MatchSetup>
    </div>
  </NuxtLayout>
</template>
