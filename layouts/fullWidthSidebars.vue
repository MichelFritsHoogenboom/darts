<template>
  <NuxtLayout name="skeleton">
    <template #title>
      <slot name="title" />
    </template>
    <div class="layout">
      <div class="sidebar">
        <slot name="left" />
      </div>
      <div class="content">
        <slot />
      </div>
      <div class="sidebar">
        <slot name="right" />
      </div>
    </div>
  </NuxtLayout>
</template>

<style scoped lang="scss">
.layout {
  @apply flex-1 grid grid-cols-[22%_56%_22%] gap-4 pb-4 px-2;
}

.sidebar {
  @apply flex flex-col items-center justify-start gap-4;
}

.content {
  @apply flex flex-col gap-4;
}
</style>
