---
description: Animations — prefers-reduced-motion via animation mixin; VueUse only when JS must drive motion
globs:
  - "**/*.vue"
  - "**/*.scss"
  - "**/*.css"
alwaysApply: false
---

# Accessible Motion Rules

Apply **only** when adding or changing visible motion. Do not turn this into a general accessibility pass.

**In scope:** `transition`, `animation`, `@keyframes`, movement `transform`, `scroll-behavior` / smooth scroll APIs, carousels, autoplay, Vue `<Transition>` / `<TransitionGroup>`, modal/overlay enter-leave, `requestAnimationFrame`, decorative loops (e.g. sparkle).

**Out of scope:** colour/opacity-only feedback, instant show/hide, unrelated a11y.

## Goals

1. **CSS first** — for CSS animations/transitions, handle reduced motion in the stylesheet. Do **not** call `usePreferredReducedMotion()` for that. Only use that helper when JavaScript itself drives the motion (scroll, autoplay, rAF) and a media query cannot stop it.
2. **Tokens** — prefer shared duration/easing tokens (CSS variables or theme) when they exist. Do not invent one-off magic numbers when a token already fits. Follow `.cursor/rules/styling` for where shared CSS lives.
3. **`prefers-reduced-motion`** — disable or reduce non-essential motion when the user asks (CSS first).
4. **Works without motion and without JS** — content and controls stay available. JS may enhance motion; it must not own the feature.

## Decision ladder

**Default is CSS. JS is the exception.**

1. **No motion touched** → skip.
2. **CSS `animation` / `transition`** → use the shared `@mixin animation` (below). **No VueUse. No JS.**
3. **Other CSS motion** (`transform` that must not apply, `scroll-behavior`, Vue transition classes that need custom kills) → local `@media (prefers-reduced-motion: reduce)` for what the mixin does not cover. **No VueUse. No JS.**
4. **JS must drive it** (`scrollTo` / `scrollBy` / `scrollIntoView`, autoplay, rAF) → `usePreferredReducedMotion()` from `@vueuse/core` (`matchMedia` only if VueUse is unavailable).
5. **Both layers** → do the CSS step **and** 4. Never replace a working CSS media query with JS alone.

## CSS `animation` / `transition` — use the mixin

Shared mixin: `assets/css/utilities/animation.scss`.

Import where needed:

```scss
@use "~/assets/css/utilities/animation" as *;
```

Include on the **same selector** that sets `animation` and/or `transition`. Under `prefers-reduced-motion: reduce` the mixin always sets `animation: none` and `transition: none`.

```scss
.loader {
  @include animation {
    animation: spin 1s linear infinite;
  }
}
```

```scss
.card {
  @include animation {
    transition: transform 0.3s ease;

    &:hover {
      transform: translateY(-0.25rem);
    }
  }
}
```

Animated children each get their own include (see `assets/css/sparkle.scss`).

**Do not** hand-roll `@media (prefers-reduced-motion: reduce) { animation: none; transition: none; }` when the mixin fits — use `@include animation`.

Note: with only `transition: none`, a hover `transform` can still apply **instantly**. If movement itself must not happen, add a local reduce override (`transform: none` on that state).

## Other CSS reduced motion

For `scroll-behavior`, forced `transform: none`, or Vue `<Transition>` class hooks that need a custom kill — use a local media query:

```scss
.carousel {
  scroll-behavior: smooth;

  @media (prefers-reduced-motion: reduce) {
    scroll-behavior: auto;
  }
}
```

- Override **locally** — never a global `* { animation: none; transition: none; }`.
- Put the media query **last** in the selector.
- `transition-duration: 0.01ms` only when a Vue transition hook must still fire.
- Opacity/colour feedback under reduced motion is fine.

## JS reduced motion (only if CSS cannot)

```ts
import { usePreferredReducedMotion } from "@vueuse/core";

const prefersReducedMotion = usePreferredReducedMotion();

viewport.scrollBy({
  left: step,
  behavior: prefersReducedMotion.value ? "auto" : "smooth",
});
```

- **rAF / decorative loops:** skip and show the final frame when reduced motion is on.
- **Autoplay:** do not start (or stop); keep manual controls.
- **Modals:** no slide/scale — jump to open/closed.

## Progressive enhancement

- Prefer CSS motion so it still works with JS off (and still respects reduced motion).
- Do not hide content/controls behind JS-only animation.
- Carousels and modals stay usable if JS never runs or motion is skipped.

## Exceptions

No reduced-motion work when: you did not change motion; the change is instant; feedback is colour/opacity only with no movement. When unsure, add support.

## Do / Don't

- ✅ `@include animation { … }` for CSS `animation` / `transition` (via `assets/css/utilities/animation.scss`)
- ✅ Local media query only for what the mixin does not cover (`scroll-behavior`, forced `transform: none`, …)
- ✅ `usePreferredReducedMotion()` only for scroll / autoplay / rAF
- ❌ Don't hand-roll `animation: none` / `transition: none` media queries when the mixin fits
- ❌ Don't use VueUse when CSS can handle it
- ❌ Don't use a global motion reset
- ❌ Don't treat reduced motion as a layout breakpoint
- ❌ Don't start autoplay/rAF loops under reduced motion
- ❌ Don't communicate information through motion alone
