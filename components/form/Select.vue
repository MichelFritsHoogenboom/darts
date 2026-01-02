<script setup lang="ts" generic="T extends string | number">
interface SelectOption<T extends string | number = string | number> {
  value: T;
  label: string;
}

const { modelValue, options, disabled } = defineProps<{
  modelValue?: T;
  options: SelectOption<T>[];
  disabled?: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: T];
}>();

const handleInput = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  // HTML select always returns string, so we need to convert if original value was a number
  let value: T;
  if (typeof modelValue === "number") {
    // Convert string to number
    value = Number(target.value) as T;
  } else {
    // Keep as string
    value = target.value as T;
  }
  emit("update:modelValue", value);
};
</script>

<template>
  <div>
    <label
      v-if="$slots.label"
      class="block text-sm font-medium text-gray-300 mb-2"
    >
      <slot name="label" />
    </label>
    <select
      :value="modelValue"
      @input="handleInput"
      :disabled="disabled"
      class="w-full bg-gray-700 border border-gray-600 px-4 py-3 text-white focus:border-dartboard-red focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
        :selected="option.value === modelValue"
      >
        {{ option.label }}
      </option>
    </select>
  </div>
</template>
