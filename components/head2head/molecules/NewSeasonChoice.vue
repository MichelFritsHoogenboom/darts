<script setup lang="ts">
// Types
import type { CompetitionEdition } from "~/interfaces/competition";
import type { ModalOption, ModalOptionValue } from "~/interfaces/modal";
// Utils
import { routes } from "~/utils/routes";

const model = defineModel<boolean>({ required: true });

const { edition, from = "season" } = defineProps<{
  edition: CompetitionEdition;
  from?: "overview" | "season";
}>();

const choices: ModalOption[] = [
  {
    label: "Same settings",
    hint: "Keep matches & X01 setup",
    value: true,
  },
  {
    label: "Different settings",
    hint: "Change matches & X01 setup",
    value: false,
  },
];

const { startNewEdition } = useCompetitionEditions();

const pending = ref(false);

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
    query: from === "overview" ? { from } : {},
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
    title="New season"
    description="Keep this season’s settings, or change them for the next one."
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
