<template>
  <NuxtLayout name="skeleton">
    <template #title>
      <slot name="title" />
    </template>
    <div class="mx-auto px-4 py-4 container">
      <slot />
    </div>
  </NuxtLayout>
</template>
