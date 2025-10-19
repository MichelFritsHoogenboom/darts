<template>
  <div>
    <label v-if="$slots.label" :class="labelClasses">
      <slot name="label" />
    </label>
    <input
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :class="inputClasses"
    />
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  modelValue: [String, Number],
  type: {
    type: String,
    default: "text",
  },
  placeholder: String,
  disabled: Boolean,
  required: Boolean,
  variant: {
    type: String,
    default: "dark", // dark or light
  },
});

defineEmits(["update:modelValue"]);

const labelClasses = computed(() => {
  const baseClasses = "block text-sm font-medium mb-2";
  const variantClasses = {
    dark: "text-gray-300",
    light: "text-gray-700",
  };
  return `${baseClasses} ${variantClasses[props.variant]}`;
});

const inputClasses = computed(() => {
  const baseClasses =
    "w-full border rounded-lg px-4 py-3 focus:border-dartboard-red focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
  const variantClasses = {
    dark: "bg-gray-700 border-gray-600 text-white",
    light: "bg-white border-gray-300 text-gray-900",
  };
  return `${baseClasses} ${variantClasses[props.variant]}`;
});
</script>
