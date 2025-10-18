<template>
  <div>
    <label
      v-if="$slots.label"
      class="block text-sm font-medium text-gray-300 mb-2"
    >
      <slot name="label" />
    </label>
    <input
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-dartboard-red focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
    />
  </div>
</template>

<script setup>
defineProps({
  modelValue: [String, Number],
  type: {
    type: String,
    default: "text",
  },
  placeholder: String,
  disabled: Boolean,
  required: Boolean,
});

defineEmits(["update:modelValue"]);
</script>
