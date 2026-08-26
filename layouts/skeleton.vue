<template>
  <div class="min-h-screen main-background">
    <header class="text-center bg-gray-950 mb-3">
      <div class="mx-auto px-4 py-1">
        <div class="grid grid-cols-3">
          <div>
            <NuxtLink to="/">
              <img
                src="~/assets/images/logo.svg"
                alt="ADL Amateur Darts League Logo"
                title="ADL Amateur Darts League"
                class="h-8 w-auto filter brightness-0 invert"
              />
            </NuxtLink>
          </div>
          <div>
            <slot name="title" />
          </div>
          <div class="flex justify-end items-center">
            <UiAppHeaderMenu />
          </div>
        </div>
      </div>
    </header>
    <div class="mx-auto px-4 py-4">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.main-background {
  @apply bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900;
  min-width: 1300px;
  width: 100dvw;
}
</style>
