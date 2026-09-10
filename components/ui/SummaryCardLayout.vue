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
  @apply grid grid-cols-[20%_1fr_20%] font-bold flex justify-between items-center;
}

.actions {
  @apply flex items-center gap-2 justify-self-end;
}
</style>
