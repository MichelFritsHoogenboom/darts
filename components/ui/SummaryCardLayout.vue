<script setup lang="ts">
withDefaults(
  defineProps<{
    to?: string;
    wrapperClass?: string;
  }>(),
  {
    wrapperClass: "",
  },
);
</script>

<template>
  <component
    :is="to ? 'NuxtLink' : 'div'"
    :to="to"
    class="stat-well flex flex-col gap-2 py-2 px-6 border border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200"
    :class="wrapperClass"
  >
    <h3
      class="grid grid-cols-[20%_1fr_20%] font-bold flex justify-between items-center"
    >
      <div>
        <slot name="left" />
      </div>
      <div>
        <slot name="center" />
      </div>
      <div class="flex items-center gap-2 justify-self-end">
        <slot name="actions" />
      </div>
    </h3>
    <slot />
  </component>
</template>
