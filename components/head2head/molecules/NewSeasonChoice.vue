<script setup lang="ts">
// Types
import type {
  CompetitionEdition,
  NewSeasonOrigin,
} from "~/interfaces/competition";
import type { ModalOption, ModalOptionValue } from "~/interfaces/modal";
// Constants
import { NEW_SEASON_ORIGINS } from "~/constants/competition";
// Utils
import { formatX01MatchConfigSummary } from "~/utils/match";
import { routes } from "~/utils/routes";

const model = defineModel<boolean>({ required: true });

const { edition, from = NEW_SEASON_ORIGINS.season } = defineProps<{
  edition: CompetitionEdition;
  from?: NewSeasonOrigin;
}>();

const { startNewEdition } = useCompetitionEditions();

const pending = ref(false);

const nextSeasonNumber = computed(() => edition.editionNumber + 1);

// Spell out what "keep" means, so the choice does not rely on memory
const currentSetup = computed(() => {
  const { amountMatches, matchConfig } = edition.competitionConfig;
  const matches = `${amountMatches} matches`;

  if (!matchConfig) {
    return matches;
  }

  return `${matches} · ${formatX01MatchConfigSummary(matchConfig, true)}`;
});

const choices = computed<ModalOption[]>(() => [
  {
    label: "Keep these settings",
    hint: currentSetup.value,
    value: true,
  },
  {
    label: "Change settings",
    hint: "Pick the number of matches and the X01 format",
    value: false,
  },
]);

const chooseSame = async () => {
  if (pending.value) {
    return;
  }

  pending.value = true;
  try {
    const created = await startNewEdition(edition.competitionId, edition);
    model.value = false;
    await navigateTo(
      routes.head2head.season(edition.competitionId, created.editionNumber),
    );
  } finally {
    pending.value = false;
  }
};

const chooseDifferent = async () => {
  if (pending.value) {
    return;
  }

  model.value = false;
  await navigateTo({
    path: routes.head2head.newSeason(edition.competitionId),
    query: from === NEW_SEASON_ORIGINS.overview ? { from } : {},
  });
};

const choose = (keepSettings: ModalOptionValue) => {
  if (keepSettings) {
    chooseSame();

    return;
  }

  chooseDifferent();
};
</script>

<template>
  <GamesX01DecisionModal
    :visible="model"
    :title="`Start season ${nextSeasonNumber}`"
    description="Keep this season’s match settings, or change them?"
    :options="choices"
    :show-undo="false"
    :busy="pending"
    dismissible
    @select="choose"
    @close="model = false"
  >
    <p role="status" class="sr-only">
      {{ pending ? "Starting new season" : "" }}
    </p>
  </GamesX01DecisionModal>
</template>
