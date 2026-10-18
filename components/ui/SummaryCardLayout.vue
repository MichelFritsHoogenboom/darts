<script setup lang="ts">
const { wrapperClass = "" } = defineProps<{
  to?: string;
  wrapperClass?: string;
}>();
</script>

<template>
  <UiSummaryCard :to="to" :wrapper-class="wrapperClass">
    <h3 class="header">
      <div>
        <slot name="left" />
      </div>
      <div>
        <slot name="center" />
      </div>
      <div class="actions">
        <slot name="actions" />
      </div>
    </h3>
    <slot />
  </UiSummaryCard>
</template>

<style scoped lang="postcss">
.header {
  @apply grid grid-cols-1 gap-2 font-bold items-center;
  @apply sm:grid-cols-[20%_1fr_20%] sm:gap-0;
}

.actions {
  @apply flex flex-wrap items-center gap-2;
  @apply sm:justify-end sm:justify-self-end;
}
</style>
