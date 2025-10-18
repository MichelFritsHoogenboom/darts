<script setup>
import {
  X01_GAMETYPES,
  X01_GAME_PLAYED_IN,
  GAME_WIN_DEFINITION,
  SETS_TO_WIN_OPTIONS,
  LEGS_TO_WIN_SET_OPTIONS,
  LEGS_TO_WIN_MATCH_OPTIONS,
} from "~/interfaces/x01MatchConfig";

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue"]);

const config = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

// Convert constants to options format for Select components
const gameTypeOptions = Object.entries(X01_GAMETYPES).map(([key, value]) => ({
  value: value,
  label: `${value} Points`,
}));

const gamePlayedInOptions = Object.entries(X01_GAME_PLAYED_IN).map(
  ([key, value]) => ({
    value: value,
    label: value.charAt(0).toUpperCase() + value.slice(1),
  })
);

const winDefinitionOptions = Object.entries(GAME_WIN_DEFINITION).map(
  ([key, value]) => ({
    value: value,
    label: value,
  })
);

const setsToWinOptions = Object.entries(SETS_TO_WIN_OPTIONS).map(
  ([key, value]) => ({
    value: value,
    label: `${value} sets`,
  })
);

const legsToWinSetOptions = Object.entries(LEGS_TO_WIN_SET_OPTIONS).map(
  ([key, value]) => ({
    value: value,
    label: `${value} legs`,
  })
);

const legsToWinMatchOptions = Object.entries(LEGS_TO_WIN_MATCH_OPTIONS).map(
  ([key, value]) => ({
    value: value,
    label: `${value} legs`,
  })
);
</script>
<template>
  <div class="bg-gray-800 rounded-xl p-8">
    <!-- Game Type Selection -->
    <div class="mb-6">
      <FormSelect v-model="config.gameType" :options="gameTypeOptions">
        <template #label>Starting Points</template>
      </FormSelect>
    </div>

    <hr class="my-6 border-gray-700" />

    <!-- Game Played In Selection -->
    <div class="mb-6">
      <FormSelect v-model="config.gamePlayedIn" :options="gamePlayedInOptions">
        <template #label>Game Format</template>
      </FormSelect>
    </div>

    <div class="mb-6" v-if="config.gamePlayedIn === X01_GAME_PLAYED_IN.sets">
      <FormSelect
        v-model="config.legsToWinParent"
        :options="legsToWinSetOptions"
      >
        <template #label>Legs to Win</template>
      </FormSelect>
    </div>

    <hr class="my-6 border-gray-700" />

    <!-- Win Definition Selection -->
    <div class="mb-6">
      <FormSelect
        v-model="config.gameWinDefinition"
        :options="winDefinitionOptions"
      >
        <template #label>Win Condition</template>
      </FormSelect>
    </div>

    <!-- Sets to Win - Only show when gamePlayedIn is 'sets' -->
    <div v-if="config.gamePlayedIn === X01_GAME_PLAYED_IN.sets" class="mb-6">
      <FormSelect v-model="config.setsToWin" :options="setsToWinOptions">
        <template #label>Sets to Win</template>
      </FormSelect>
    </div>

    <!-- Legs to Win Parent -->
    <div v-if="config.gamePlayedIn === X01_GAME_PLAYED_IN.legs" class="mb-6">
      <FormSelect
        v-model="config.legsToWinParent"
        :options="legsToWinMatchOptions"
      >
        <template #label>Legs to Win</template>
      </FormSelect>
    </div>

    <div
      class="mb-6"
      v-if="
        config.gamePlayedIn === X01_GAME_PLAYED_IN.sets ||
        (config.gamePlayedIn === X01_GAME_PLAYED_IN.legs &&
          config.legsToWinParent > 1)
      "
    >
      <FormCheckbox v-model="config.tiebreak">
        <template #label>Enable Tiebreak</template>
      </FormCheckbox>
    </div>

    <hr class="my-6 border-gray-700" />
  </div>
</template>
