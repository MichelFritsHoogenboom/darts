<template>
  <span class="icon-sparkle">
    <slot />
  </span>
</template>

<style scoped lang="scss">
@use "~/assets/css/sparkle" as *;

.icon-sparkle {
  @include icon-sparkle-wrapper;
}
</style>
