<script setup lang="ts">
import { routes } from "~/utils/routes";
</script>

<template>
  <div class="min-h-screen main-background">
    <header class="text-center bg-gray-950 mb-3">
      <div class="mx-auto px-4 py-1">
        <div class="grid grid-cols-3">
          <div>
            <NuxtLink :to="routes.home">
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
  @apply relative text-white bg-page;
  min-width: 1300px;
  width: 100dvw;
  z-index: 1;
}

.main-background::before,
.main-background::after {
  @apply pointer-events-none;
  content: "";
}

/* Photo base — lighting layers sit above this. Pinned to the viewport with
   `fixed` rather than `background-attachment`, so the blurred layer composites
   once instead of repainting every scroll frame. */
.main-background::before {
  @apply fixed inset-0;
  background-image: url("../assets/images/background.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0.12;
  filter: grayscale(100%) blur(1px);
  z-index: -2;
}

/* Depth: grid + top-light + vertical dark wash over the photo */
.main-background::after {
  @apply absolute inset-0;
  background:
    linear-gradient(
      color-mix(in srgb, theme("colors.page.DEFAULT") 35%, transparent),
      color-mix(in srgb, theme("colors.page.DEFAULT") 85%, transparent)
    ),
    radial-gradient(
      ellipse 55% 40% at 50% 12%,
      color-mix(in srgb, theme("colors.page.light") 25%, transparent) 0%,
      transparent 70%
    ),
    repeating-linear-gradient(
      0deg,
      theme("colors.white / 2.5%") 0px,
      theme("colors.white / 2.5%") 1px,
      transparent 1px,
      transparent 12px
    ),
    repeating-linear-gradient(
      90deg,
      theme("colors.white / 2.5%") 0px,
      theme("colors.white / 2.5%") 1px,
      transparent 1px,
      transparent 12px
    );
  z-index: -1;
}
</style>
