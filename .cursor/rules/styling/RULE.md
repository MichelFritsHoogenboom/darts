---
description: CSS/SCSS — component first, utilities folder, scoped styles, tokens (no BEM)
globs:
  - "**/*.vue"
  - "**/*.scss"
  - "**/*.css"
alwaysApply: false
---

# Styling Rules

## Layers (component first)

Prefer the strongest layer that fits. Do not invent CSS “shared UI” for something that should be a Vue component.

| Layer | When | Where |
| --- | --- | --- |
| **Vue component** | Reusable UI with its own markup and/or behaviour | `components/…` |
| **CSS utility** | Presentation-only reuse — **not** worth its own component | `assets/css/utilities/` |
| **Scoped styles** | Styles that belong to one SFC | `<style scoped>` in that component |

**Rule of thumb:** if it can be a component, make a component. Only then add a CSS utility.

`assets/css/main.css` is the CSS entry (Tailwind layers + imports). Do **not** grow it into a grab-bag of one-off or component-worthy styles. New shared presentation-only CSS goes under `assets/css/utilities/` (e.g. `animation.scss` for the reduced-motion animation mixin). Complex one-offs (pseudo-elements, masks, nth-child, glow) stay in scoped CSS/SCSS or existing helpers such as `assets/css/glow.scss`.

## Class naming

- **No BEM.** No `__` or `--` modifiers.
- In scoped styles: one clear root class when useful; child sections use short names (`header`, `actions`, `row`) or nest under the root. Do **not** prefix children with the parent name (e.g. not `.summary-card-header` inside `.summary-card` — use `.header`).
- State: normal classes or native attributes (`.active`, `.invalid`, `:disabled`). Do not require `data-*` for state.

Aligns with root `AGENTS.md` (CSS / Vue classes).

## Tailwind

- **OK:** coarse layout and spacing in templates (`flex`, `grid`, `gap-*`, responsive prefixes).
- **Avoid:** long utility strings that encode a full button / input / card look. That belongs in a **component** or a **CSS utility**.
- `@apply` belongs in CSS/SCSS (utilities or scoped), not as an excuse to leave design-only class lists in the template.
- Existing `@apply` / theme usage in `main.css` and scoped styles is fine; do not expand that pattern for new component-worthy UI.

## Colors and tokens

- Prefer theme tokens / CSS variables / existing config colors over hardcoded hex/rgb in components.
- **No** requirement to use a `dartboard-` prefix — not every color is board-themed. Use the token that matches the design intent.
- Do not invent new one-off hex values when an existing token already fits.

## Do / Don't

- ✅ Component when markup + reuse (or behaviour) justifies it
- ✅ CSS utility in `assets/css/utilities/` when presentation-only and shared
- ✅ Scoped styles for local layout and complex CSS
- ✅ Short class names; no BEM
- ❌ Don't dump design into template `class="…"` strings — if that UI can be a Vue component, make a component; otherwise extract a CSS utility
- ❌ Don't put single-component styles into `main.css`
- ❌ Don't force a full Tailwind removal — follow these layers for new and touched UI
