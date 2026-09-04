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
  <UiSummaryCard :to="to" :wrapper-class="wrapperClass">
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
  </UiSummaryCard>
</template>
