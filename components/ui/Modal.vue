<script setup lang="ts">
// Vendor
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { onKeyStroke, useToggle } from "@vueuse/core";
import { watch } from "vue";

interface Props {
  modelValue: boolean;
}

interface Emits {
  (e: "update:modelValue", value: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const titleId = useId();

const [isOpen, toggle] = useToggle(props.modelValue);

// Watch for external changes to modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    isOpen.value = newValue;
  },
);

// Watch for internal changes and emit
watch(isOpen, (newValue) => {
  emit("update:modelValue", newValue);
});

const close = () => {
  isOpen.value = false;
};

const open = () => {
  isOpen.value = true;
};

onKeyStroke("Escape", () => {
  if (!isOpen.value) {
    return;
  }

  close();
});

// Expose methods for parent components
defineExpose({
  open,
  close,
  toggle,
});
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="transform scale-95 opacity-0"
    enter-to-class="transform scale-100 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="transform scale-100 opacity-100"
    leave-to-class="transform scale-95 opacity-0"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 overflow-y-auto"
      @click="close"
    >
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />

      <!-- Modal container -->
      <div
        class="flex min-h-full items-end justify-center p-4 sm:items-center sm:p-0"
      >
        <div
          class="panel"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="$slots.title ? titleId : undefined"
          @click.stop
        >
          <div class="body">
            <div class="head">
              <h3 :id="titleId" class="title">
                <slot name="title" />
              </h3>
              <button type="button" class="close" @click="close">
                <span class="sr-only">Close</span>
                <FontAwesomeIcon :icon="faXmark" class="w-5 h-5" />
              </button>
            </div>

            <slot />
          </div>

          <div v-if="$slots.footer" class="footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped lang="postcss">
.panel {
  @apply relative w-full overflow-hidden text-left;
  @apply bg-gray-800 text-white shadow-xl;
  @apply sm:my-8 sm:max-w-lg;
}

.body {
  @apply px-6 py-6;
}

.head {
  @apply flex justify-between items-center gap-4 mb-4;
}

.title {
  @apply text-lg font-semibold leading-6 text-white;
}

.close {
  @apply text-gray-400 hover:text-gray-200 transition-colors;
}

.footer {
  @apply flex flex-col-reverse gap-3 px-6 py-4 border-t border-gray-700;
  @apply sm:flex-row sm:justify-end;
}
</style>
