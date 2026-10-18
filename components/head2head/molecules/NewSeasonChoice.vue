<script setup lang="ts">
// Types
import type { CompetitionEdition } from "~/interfaces/competition";
// Utils
import { routes } from "~/utils/routes";

const model = defineModel<boolean>({ required: true });

const { edition, from = "season" } = defineProps<{
  edition: CompetitionEdition;
  from?: "overview" | "season";
}>();

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
</script>

<template>
  <UiModal v-model="model">
    <template #title>New season</template>

    <p class="support">
      Keep this season&rsquo;s settings, or change them for the next one.
    </p>

    <div class="choices">
      <FormButton
        variant="secondary"
        size="lg"
        full-width
        :disabled="pending"
        :aria-busy="pending"
        @click="chooseSame"
      >
        <span class="label">Same settings</span>
        <span class="hint">Keep matches &amp; X01 setup</span>
      </FormButton>

      <FormButton
        variant="secondary"
        size="lg"
        full-width
        :disabled="pending"
        @click="chooseDifferent"
      >
        <span class="label">Different settings</span>
        <span class="hint">Change matches &amp; X01 setup</span>
      </FormButton>
    </div>

    <p role="status" class="sr-only">
      {{ pending ? "Starting new season" : "" }}
    </p>
  </UiModal>
</template>

<style scoped lang="postcss">
.support {
  @apply text-gray-300 mb-5;
}

.choices {
  @apply grid grid-cols-1 sm:grid-cols-2 gap-3;
}

.label {
  @apply block;
}

.hint {
  @apply block text-sm font-normal text-gray-100;
}
</style>
