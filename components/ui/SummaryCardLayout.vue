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
  /* Side columns stay equal so the centre column is centred on the card: the
     detail rows below (SetSummary, LegSummary) align to that same centre. */
  @apply sm:grid-cols-[20%_1fr_20%] sm:gap-x-3 sm:gap-y-0;
}

.actions {
  @apply flex flex-wrap items-center gap-2;
  @apply sm:flex-nowrap sm:justify-end sm:justify-self-end;
}
</style>
