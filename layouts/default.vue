<template>
  <NuxtLayout name="wide">
    <template #title>
      <slot name="title" />
    </template>
    <div class="mx-auto w-full max-w-4xl">
      <slot />
    </div>
  </NuxtLayout>
</template>
