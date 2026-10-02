---
description: Font Awesome — register icons; custom icons in assets/icons
globs:
  - "**/*.vue"
  - "plugins/fontawesome.ts"
  - "assets/icons/**"
alwaysApply: false
---

# Font Awesome

Icons go through Font Awesome + `plugins/fontawesome.ts`. Do not invent a second icon system (raw SVGs everywhere, emoji as UI icons, whole unused packs).

## Patterns

1. **Reuse** an icon already used in the app when the meaning matches.
2. **Pack icon** (e.g. `@fortawesome/free-solid-svg-icons`): import the **specific** icon definition and pass it to `FontAwesomeIcon` — do not import/register entire packs.
3. **Custom icon** (not in Free): add `assets/icons/faSomething.ts` as an `IconDefinition`, then `library.add(...)` in `plugins/fontawesome.ts` (see `faCamel`, `faPlay`).
4. Render with `FontAwesomeIcon` from `@fortawesome/vue-fontawesome` (or the registered `font-awesome-icon` component).

## Do / Don't

- ✅ One icon import at a time; register customs in the plugin
- ❌ Don't add CSS `@fortawesome` kits or parallel icon libraries
- ❌ Don't copy SVG paths into SFCs when an FA icon fits
