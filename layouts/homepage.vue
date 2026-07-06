<template>
  <NuxtLayout name="wide">
    <template #title>
      <slot name="title" />
    </template>
    <div
      class="max-w-6xl mx-auto grid grid-cols-[minmax(0,1fr)_16rem] gap-6 items-start"
    >
      <div class="flex gap-4 items-stretch col-span-2">
        <slot name="fullWidth" />
      </div>
      <div class="flex flex-col gap-6">
        <slot />
      </div>
      <aside class="w-64 shrink-0 flex flex-col gap-0">
        <slot name="sidebar" />
      </aside>
    </div>
  </NuxtLayout>
</template>
