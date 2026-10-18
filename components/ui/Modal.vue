<script setup lang="ts">
// Vendor
import { onKeyStroke, useToggle } from "@vueuse/core";
import { computed, watch } from "vue";

interface Props {
  modelValue: boolean;
  skin?: "light" | "dark";
}

interface Emits {
  (e: "update:modelValue", value: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const titleId = useId();

const [isOpen, toggle] = useToggle(props.modelValue);

const isDark = computed(() => props.skin === "dark");

const panelClass = computed(() =>
  isDark.value ? "bg-gray-800 text-gray-100" : "bg-white",
);

const bodyClass = computed(() => (isDark.value ? "bg-gray-800" : "bg-white"));

const titleClass = computed(() =>
  isDark.value ? "text-white" : "text-gray-900",
);

const closeClass = computed(() =>
  isDark.value
    ? "text-gray-400 hover:text-gray-200"
    : "text-gray-400 hover:text-gray-600",
);

const footerClass = computed(() =>
  isDark.value ? "bg-gray-900/60" : "bg-gray-50",
);

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
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

      <!-- Modal container -->
      <div
        class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0"
      >
        <div
          class="relative transform overflow-hidden text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
          :class="panelClass"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="$slots.title ? titleId : undefined"
          @click.stop
        >
          <!-- Modal content -->
          <div class="px-4 pb-4 pt-5 sm:p-6 sm:pb-4" :class="bodyClass">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                <div class="flex justify-between items-center mb-4">
                  <h3
                    :id="titleId"
                    class="text-lg font-semibold leading-6"
                    :class="titleClass"
                  >
                    <slot name="title" />
                  </h3>
                  <button type="button" :class="closeClass" @click="close">
                    <span class="sr-only">Close</span>
                    <svg
                      class="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div class="mt-2">
                  <slot />
                </div>
              </div>
            </div>
          </div>

          <!-- Modal footer -->
          <div
            v-if="$slots.footer"
            class="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6"
            :class="footerClass"
          >
            <slot name="footer" />
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
