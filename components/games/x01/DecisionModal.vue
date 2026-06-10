<script setup lang="ts">
type ModalOptionValue = string | number | boolean;

type ModalOption = {
  label: string;
  value: ModalOptionValue;
};

withDefaults(
  defineProps<{
    visible: boolean;
    title: string;
    description: string;
    options: ModalOption[];
    optionButtonClass?: string;
    showUndo?: boolean;
    undoLabel?: string;
    undoTitle?: string;
  }>(),
  {
    optionButtonClass: "btn-gray w-full py-3",
    showUndo: true,
    undoLabel: "Undo",
    undoTitle: "Laatste worp ongedaan maken (Ctrl+Z)",
  },
);

defineEmits<{
  select: [value: ModalOptionValue];
  undo: [];
}>();
</script>

<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-gray-800 p-8 max-w-md w-full mx-auto text-center">
      <h2 class="text-2xl font-bold mb-2">{{ title }}</h2>
      <p class="text-gray-300 mb-6">{{ description }}</p>
      <div class="flex flex-col gap-3">
        <button
          v-for="option in options"
          :key="option.label"
          type="button"
          :class="optionButtonClass"
          @click="$emit('select', option.value)"
        >
          {{ option.label }}
        </button>

        <div v-if="showUndo" class="flex justify-start">
          <button
            type="button"
            class="rounded-br-lg bg-[#43588b] hover:bg-[#5a6fa0] disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-3 mt-2 text-sm transition-colors duration-200"
            :title="undoTitle"
            @click="$emit('undo')"
          >
            {{ undoLabel }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
