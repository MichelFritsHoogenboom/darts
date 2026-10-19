<script setup lang="ts">
// Vendor
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { onKeyStroke } from "@vueuse/core";
// Types
import type { ModalOption, ModalOptionValue } from "~/interfaces/modal";

const {
  visible,
  options,
  optionButtonClass = "btn-gray w-full py-3",
  showUndo = true,
  dismissible = false,
  busy = false,
  undoLabel = "Undo",
  undoTitle = "Undo last throw (Ctrl+Z)",
} = defineProps<{
  visible: boolean;
  title: string;
  description: string;
  options: ModalOption[];
  optionButtonClass?: string;
  showUndo?: boolean;
  /** Opt-in close affordance: a close button, Escape and a backdrop click. */
  dismissible?: boolean;
  busy?: boolean;
  undoLabel?: string;
  undoTitle?: string;
}>();

const emit = defineEmits<{
  select: [value: ModalOptionValue];
  undo: [];
  close: [];
}>();

const titleId = useId();

const optionRefs = ref<HTMLButtonElement[]>([]);

const setOptionRef = (el: unknown, index: number) => {
  if (el instanceof HTMLButtonElement) {
    optionRefs.value[index] = el;
  }
};

const focusOption = (index: number) => {
  const count = options.length;
  if (count === 0) {
    return;
  }
  const nextIndex = (index + count) % count;
  optionRefs.value[nextIndex]?.focus({ focusVisible: true });
};

const dismiss = () => {
  if (!dismissible) {
    return;
  }

  emit("close");
};

onKeyStroke("Escape", () => {
  if (!visible) {
    return;
  }

  dismiss();
});

watch(
  () => [visible, options.length] as const,
  ([isVisible, optionCount]) => {
    if (!isVisible || optionCount === 0) {
      if (!isVisible) {
        optionRefs.value = [];
      }
      return;
    }

    requestAnimationFrame(() => focusOption(0));
  },
);
</script>

<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click="dismiss"
  >
    <div
      class="relative bg-gray-800 p-8 max-w-md w-full mx-auto text-center"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      @click.stop
    >
      <button v-if="dismissible" type="button" class="close" @click="dismiss">
        <span class="sr-only">Close</span>
        <FontAwesomeIcon :icon="faXmark" class="w-5 h-5" />
      </button>

      <h2 :id="titleId" class="text-2xl font-bold mb-2">{{ title }}</h2>
      <p class="text-gray-300 mb-6">{{ description }}</p>

      <slot />

      <div class="flex flex-col gap-3">
        <button
          v-for="(option, index) in options"
          :key="option.label"
          :ref="(el) => setOptionRef(el, index)"
          type="button"
          class="disabled:opacity-50 disabled:cursor-not-allowed"
          :class="optionButtonClass"
          :disabled="busy"
          @click="emit('select', option.value)"
          @keydown.down.prevent="focusOption(index + 1)"
          @keydown.up.prevent="focusOption(index - 1)"
        >
          <span class="option-label">{{ option.label }}</span>
          <span v-if="option.hint" class="option-hint">{{ option.hint }}</span>
        </button>

        <div v-if="showUndo" class="flex justify-start">
          <button
            type="button"
            class="rounded-br-lg bg-dartboard-blue hover:bg-dartboard-blue-dark disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-3 mt-2 text-sm transition-colors duration-200"
            :title="undoTitle"
            @click="emit('undo')"
          >
            {{ undoLabel }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.close {
  @apply absolute top-3 right-3 text-gray-400 hover:text-gray-200 transition-colors;
}

.option-label {
  @apply block;
}

.option-hint {
  @apply block text-sm font-normal text-gray-300;
}
</style>
