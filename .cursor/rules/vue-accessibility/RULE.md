---
description: Vue templates — semantics, names/ARIA, keyboard, disabled/loading states
globs:
  - "**/*.vue"
alwaysApply: false
---

# Vue Accessibility Rules

Apply all guidelines below. ARIA only fills gaps native HTML cannot. Never put `aria-hidden` or `role="presentation"` on a focusable control **or on an ancestor of one**. Anything interactive must work with the keyboard.

If a native HTML element already has the right role, keyboard behaviour, and name, use it.

## Semantics

Use the element that matches the meaning. Do not fake controls with `div` / `span` + `role` / `@click`. Do not override native semantics (e.g. `<h2 role="tab">`) unless you truly must.

| Intent | Element |
| --- | --- |
| Action | `<button type="button">` / `submit` / `reset` |
| Navigation | `<a href="...">` with a real URL — never `href="#"` + `@click.prevent` for an action |
| Labelled input | `<label>` + control |
| List | `<ul>` / `<ol>` / `<li>` |
| Landmark | `<main>`, `<nav>`, `<header>`, `<footer>`, `<aside>` |
| Heading | `<h1>`–`<h6>` in a sensible outline |

```vue
<!-- ❌ BAD -->
<div class="close" @click="close">Close</div>
<span class="link" @click="goToMatch">{{ name }}</span>
<a href="#" @click.prevent="save">Save</a>

<!-- ✅ GOOD -->
<button type="button" class="close" @click="close">Close</button>
<a :href="matchUrl">{{ name }}</a>
<button type="button" @click="save">Save</button>
```

## Accessible names and ARIA

Every interactive control needs a short accessible name. Prefer **visible text**.

**Name priority (first that fits):**

1. Child text — `<button>Save</button>`
2. `<label for="id">` or wrapping `<label>`
3. `aria-labelledby` → id of visible text
4. `aria-label` — icon-only / no visible label

**Do not:**

- Rely on `placeholder` or `title` as the only name (weak browser fallback)
- Add `aria-label` when visible text should already be the name (hides child content from AT)
- Give an accessible name that contradicts or omits the visible label (voice users say what they see)
- Use “left” / “right” when you mean previous/next — use `t('previous')`, `t('next')`, `t('close')`

```vue
<!-- ❌ BAD -->
<button type="button" @click="close"><CloseIcon /></button>
<input placeholder="Email" />

<!-- ✅ GOOD -->
<button type="button" @click="close" :aria-label="t('close')">
  <CloseIcon aria-hidden="true" />
</button>
<label>
  Email
  <input type="email" v-model="email" autocomplete="email" />
</label>
```

### Forms

- Every input has a programmatic label. Prefer `useId()` for `for` / `id`.
- Wire help/errors with `aria-describedby`; set `aria-invalid="true"` on error.
- Announce new errors with `role="alert"` or `aria-live`.

```vue
<label :for="inputId">{{ label }}</label>
<input
  :id="inputId"
  v-model="model"
  :aria-invalid="hasError"
  :aria-describedby="hasError ? errorId : undefined"
/>
<p v-if="hasError" :id="errorId" role="alert">{{ errorMessage }}</p>
```

### ARIA only when needed

| Attribute | When |
| --- | --- |
| `aria-expanded` / `aria-controls` | Disclosure, accordion, menu |
| `aria-current="page"` | Current nav item |
| `aria-hidden="true"` | Decorative icon / duplicate text only — **never** on a focusable control, and **never** on an ancestor of a focusable control |
| `aria-disabled="true"` | Soft-disabled / loading — stays focusable; block activation in JS |
| `aria-busy="true"` | Region/control is updating |
| `aria-live="polite"` / `role="status"` | Soft updates (loading/saved) |
| `role="alert"` | Urgent error |
| `role="dialog"` + name | Custom modal |

Informative images: meaningful `alt`. Decorative: `alt=""`. Do not convey meaning with colour alone.

### `aria-hidden` and children

`aria-hidden="true"` removes the element **and its entire subtree** from the accessibility tree. It does **not** remove descendants from the tab order.

- **Never** wrap a `<button>`, `<a href>`, or other focusable control in `aria-hidden`. Keyboard users can still Tab to it; AT hears nothing (and a child `aria-label` does not help — the whole subtree is ignored).
- Put `aria-hidden` only on **non-interactive** decoration (icon next to visible text, spinner). Keep the interactive control outside that subtree.
- `aria-hidden="false"` on a child does **not** undo a hidden ancestor.
- To hide a whole inactive region (closed menu, background behind a modal): prefer `inert` (removes from AT **and** tab order), or `display: none` / `hidden`. Do not use `aria-hidden` alone on a container that still has focusable children.

```vue
<!-- ❌ BAD - button inside aria-hidden; still focusable, invisible to AT -->
<div aria-hidden="true">
  <button type="button" :aria-label="t('close')" @click="close">
    <CloseIcon />
  </button>
</div>

<!-- ✅ GOOD - only the decorative icon is hidden -->
<button type="button" :aria-label="t('close')" @click="close">
  <CloseIcon aria-hidden="true" />
</button>

<!-- ✅ GOOD - inactive UI: inert (or display:none), not aria-hidden alone -->
<div v-show="isOpen" :inert="!isOpen">
  <button type="button" @click="close">{{ t("close") }}</button>
</div>
```

## Disabled and loading states

State must be clear to keyboard and AT users — not only by greying the control out.

### Disabled

- Prefer an enabled control that explains the problem (validation, helper text) over a mysterious disabled control when the user can fix it.
- Use native `disabled` when the control is truly unavailable and leaving the tab order is fine.
- Use `aria-disabled="true"` when it must **stay focusable**. That attribute does **not** block clicks — ignore activation in the handler yourself.
- Still needs an accessible name. Do not put `disabled` on `<a>` — use `<button>`, or `aria-disabled` + prevent navigation.

```vue
<!-- ❌ BAD -->
<button type="button" class="is-disabled" @click="submit">Submit</button>

<!-- ✅ GOOD -->
<button type="submit" disabled>{{ t("submit") }}</button>

<button type="button" :aria-disabled="isInactive" @click="onSubmit">
  {{ t("submit") }}
</button>
```

```ts
const onSubmit = () => {
  if (isInactive.value) {
    return;
  }

  submit();
};
```

### Loading

- Do not remove the focused control from the DOM while loading.
- Prefer `aria-disabled="true"` over native `disabled` for short in-flight actions so focus can stay.
- Update the visible label / name (`t('saving')`) — a spinner alone is invisible to AT. Mark decorative spinners `aria-hidden="true"`.
- Set `aria-busy="true"` on the busy control or region.
- Announce with `role="status"` / `aria-live="polite"`. Keep the live region in the DOM; change its text when status changes.

```vue
<button
  type="button"
  :aria-disabled="isLoading"
  :aria-busy="isLoading"
  @click="onSave"
>
  <Spinner v-if="isLoading" aria-hidden="true" />
  {{ isLoading ? t("saving") : t("save") }}
</button>
<p role="status" class="visually-hidden">
  {{ isLoading ? t("saving") : saveStatusMessage }}
</p>
```

```ts
const onSave = async () => {
  if (isLoading.value) {
    return;
  }

  await save();
};
```

## Keyboard navigation

Anything clickable must work from the keyboard.

- **Tab / Shift+Tab** between components; **arrows** (etc.) inside composites (tabs, menus, listboxes).
- Tab order follows reading order. Never `tabindex` > `0`. Use `0` to add to the tab order; `-1` for programmatic focus only.
- Keep a **visible** focus style — no `outline: none` without a replacement. Focused controls must not sit fully under sticky UI.
- **Dialogs:** trap focus while open, Escape closes, restore focus to the opener. After close/delete, do not leave focus on `document.body`.
- Prefer `<button>` / `<a href>` so Enter/Space come free — do not `@click` a `div`/`span`.

```vue
<!-- ❌ BAD -->
<div class="chip" @click="select(option)">{{ option.label }}</div>

<!-- ✅ GOOD -->
<button type="button" class="chip" @click="select(option)">
  {{ option.label }}
</button>
```
