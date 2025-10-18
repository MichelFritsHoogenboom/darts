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
      @input="$emit('update:modelValue', $event.target.value)"
      :disabled="disabled"
      class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-dartboard-red focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
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

<script setup>
defineProps({
  modelValue: [String, Number],
  options: {
    type: Array,
    required: true,
  },
  disabled: Boolean,
});

defineEmits(["update:modelValue"]);
</script>
