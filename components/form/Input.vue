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

defineEmits(["update:modelValue"]);

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
    "w-full border rounded-lg px-4 py-3 focus:border-dartboard-red focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
  const variantClasses: Record<InputVariant, string> = {
    dark: "bg-gray-700 border-gray-600 text-white",
    light: "bg-white border-gray-300 text-gray-900",
  };
  return `${baseClasses} ${variantClasses[props.variant || "dark"]}`;
});
</script>

<template>
  <div>
    <label v-if="$slots.label" :class="labelClasses">
      <slot name="label" />
    </label>
    <input
      :value="modelValue"
      @input="
        $emit('update:modelValue', ($event.target as HTMLInputElement).value)
      "
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :class="inputClasses"
    />
  </div>
</template>
