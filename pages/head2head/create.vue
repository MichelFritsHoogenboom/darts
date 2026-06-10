<script setup lang="ts">
import {
  createCompetition,
  createCompetitionEdition,
} from "~/interfaces/competition";
import { defaultX01MatchConfig } from "~/interfaces/x01MatchConfig";
import type { Player } from "~/interfaces/player";
import { sortPlayerIds } from "~/utils/rivalry";
import { GAME_TYPES } from "~/interfaces/match";

definePageMeta({
  layout: false,
});

const AMOUNT_MATCH_OPTIONS = [3, 7, 9, 11, 13, 15, 17, 19, 21].map((n) => ({
  value: n,
  label: `${n} wedstrijden`,
}));

const { players, loading, error, savePlayer, loadPlayers } = usePlayers();
const { saveCompetition } = useCompetitions();
const { saveEdition, findHead2HeadCompetitionForPair } =
  useCompetitionEditions();

const selectedPlayers = ref<string[]>([]);
const amountMatches = ref(7);
const useFixedConfig = ref(false);
const matchConfig = ref({ ...defaultX01MatchConfig });
const showPlayerForm = ref(false);
const playerSelectorRef = ref<{ resetDropdown: () => void } | null>(null);

const duplicateCompetition = ref<{ id: string } | null>(null);
const submitError = ref<string | null>(null);
const saving = ref(false);

onBeforeMount(async () => {
  await loadPlayers();
});

const canCreate = computed(() => selectedPlayers.value.length === 2);

watch(
  selectedPlayers,
  async (ids) => {
    duplicateCompetition.value = null;
    if (ids.length === 2) {
      const existing = await findHead2HeadCompetitionForPair(ids[0], ids[1]);
      if (existing) {
        duplicateCompetition.value = { id: existing.id };
      }
    }
  },
  { deep: true },
);

const handlePlayerSubmit = async (playerData: Player) => {
  const savedPlayer = await savePlayer(playerData);
  showPlayerForm.value = false;
  if (savedPlayer?.id) {
    addPlayer(savedPlayer.id);
  }
};

const addPlayer = (playerId: string) => {
  if (!selectedPlayers.value.includes(playerId)) {
    selectedPlayers.value.push(playerId);
  }
  playerSelectorRef.value?.resetDropdown();
};

const removePlayer = (playerId: string) => {
  const index = selectedPlayers.value.indexOf(playerId);
  if (index > -1) {
    selectedPlayers.value.splice(index, 1);
  }
};

const createRivalry = async () => {
  if (!canCreate.value || duplicateCompetition.value) return;

  saving.value = true;
  submitError.value = null;

  try {
    const sortedIds = sortPlayerIds(selectedPlayers.value);
    const competition = createCompetition();
    await saveCompetition(competition);

    const edition = createCompetitionEdition({
      competitionId: competition.id,
      editionNumber: 1,
      playerIds: sortedIds,
      competitionConfig: {
        amountMatches: amountMatches.value,
        matchConfig: useFixedConfig.value
          ? { ...matchConfig.value }
          : undefined,
        gameType: GAME_TYPES.x01,
      },
    });

    await saveEdition(edition);
    await navigateTo("/head2head");
  } catch (err) {
    submitError.value = err instanceof Error ? err.message : "Opslaan mislukt";
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <NuxtLayout name="default">
    <template #title>
      <h1 class="text-xl font-bold text-white mb-2">Nieuwe rivalry</h1>
    </template>

    <div class="max-w-4xl mx-auto">
      <SetupPlayerSelector
        ref="playerSelectorRef"
        :available-players="players as Player[]"
        :selected-players="selectedPlayers"
        :loading="loading"
        :error="error"
        @add-player="showPlayerForm = true"
        @select-player="addPlayer"
        @remove-player="removePlayer"
      />

      <div class="player-card inactive rounded-lg p-8 mb-6">
        <FormSelect v-model="amountMatches" :options="AMOUNT_MATCH_OPTIONS">
          <template #label>Aantal wedstrijden</template>
        </FormSelect>
      </div>

      <div class="player-card inactive rounded-lg p-8 mb-6">
        <FormCheckbox v-model="useFixedConfig">
          <template #label
            >Vaste wedstrijdinstellingen voor dit seizoen</template
          >
        </FormCheckbox>
      </div>

      <SetupX01MatchSetup v-if="useFixedConfig" v-model="matchConfig" />

      <div
        v-if="duplicateCompetition"
        class="mb-6 p-4 bg-yellow-900/40 border border-yellow-700 rounded-lg text-yellow-100"
      >
        Deze spelers hebben al een rivalry.
        <NuxtLink
          :to="`/head2head/${duplicateCompetition.id}`"
          class="underline font-semibold ml-1"
        >
          Bekijk bestaande rivalry
        </NuxtLink>
      </div>

      <p v-if="submitError" class="text-red-400 mb-4">{{ submitError }}</p>

      <div class="flex gap-4 justify-end">
        <NuxtLink to="/head2head" class="btn-gray px-6 py-2"
          >Annuleren</NuxtLink
        >
        <FormButton
          :disabled="!canCreate || !!duplicateCompetition || saving"
          @click="createRivalry"
        >
          Aanmaken
        </FormButton>
      </div>

      <UiModal v-model="showPlayerForm">
        <template #title>Speler toevoegen</template>
        <FormPlayerForm
          @submit="handlePlayerSubmit"
          @cancel="showPlayerForm = false"
        />
      </UiModal>
    </div>
  </NuxtLayout>
</template>
