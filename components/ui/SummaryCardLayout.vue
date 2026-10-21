<script setup lang="ts">
const { wrapperClass = "" } = defineProps<{
  to?: string;
  wrapperClass?: string;
}>();
</script>

<template>
  <UiSummaryCard :to="to" :wrapper-class="wrapperClass">
    <div class="header">
      <div>
        <slot name="left" />
      </div>
      <div>
        <slot name="center" />
      </div>
      <div class="actions">
        <slot name="actions" />
      </div>
    </div>
    <slot />
  </UiSummaryCard>
</template>

<style scoped lang="postcss">
.header {
  @apply grid grid-cols-1 gap-2 font-bold items-center;
  /* From sm up the action column takes what its controls need, so an icon row
     never wraps; only the narrow single-column layout is allowed to wrap. */
  @apply sm:grid-cols-[20%_minmax(0,1fr)_auto] sm:gap-x-3 sm:gap-y-0;
}

.actions {
  @apply flex flex-wrap items-center gap-2;
  @apply sm:flex-nowrap sm:justify-end sm:justify-self-end;
}
</style>
