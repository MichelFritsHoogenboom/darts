<script setup lang="ts">
defineProps({
  modelValue: Boolean,
  disabled: Boolean,
  required: Boolean,
});

defineEmits(["update:modelValue"]);
</script>

<template>
  <label class="flex items-center cursor-pointer">
    <input
      :checked="modelValue"
      @change="
        $emit('update:modelValue', ($event.target as HTMLInputElement).checked)
      "
      :disabled="disabled"
      :required="required"
      type="checkbox"
      class="w-4 h-4 text-dartboard-red bg-gray-700 border-gray-600 focus:ring-dartboard-red focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
    />
    <span v-if="$slots.label" class="ml-2 text-sm font-medium text-gray-300">
      <slot name="label" />
    </span>
  </label>
</template>
