<script setup lang="ts">
import { computed } from "vue";

type InputVariant = "dark" | "light";

const props = defineProps<{
  modelValue?: string | number;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  variant?: InputVariant;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string | number | undefined];
}>();

const labelClasses = computed(() => {
  const baseClasses = "block text-sm font-medium mb-2";
  const variantClasses: Record<InputVariant, string> = {
    dark: "text-gray-300",
    light: "text-gray-700",
  };
  return `${baseClasses} ${variantClasses[props.variant || "dark"]}`;
});

const inputClasses = computed(() => {
  const baseClasses =
    "w-full border  px-4 py-3 focus:border-dartboard-red focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
  const variantClasses: Record<InputVariant, string> = {
    dark: "bg-gray-700 border-gray-600 text-white",
    light: "bg-white border-gray-300 text-gray-900",
  };
  return `${baseClasses} ${variantClasses[props.variant || "dark"]}`;
});

// A number input must emit a number, or the string lands in a numeric field and
// is persisted as one. An empty field means "no value", not 0 or NaN.
const onInput = (event: Event) => {
  const { value, valueAsNumber } = event.target as HTMLInputElement;

  if (props.type !== "number") {
    emit("update:modelValue", value);

    return;
  }

  emit("update:modelValue", value === "" ? undefined : valueAsNumber);
};
</script>

<template>
  <div>
    <label v-if="$slots.label" :class="labelClasses">
      <slot name="label" />
    </label>
    <input
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :class="inputClasses"
      @input="onInput"
    />
  </div>
</template>
