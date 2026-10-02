---
description: Reuse components/form — FormButton, FormInput, FormSelect, FormCheckbox
globs:
  - "**/*.vue"
  - "components/form/**"
alwaysApply: false
---

# Form components

Shared controls live in `components/form/`. Nuxt resolves them as `Form*` (folder prefix):

| Component | Use for |
| --- | --- |
| `FormButton` | Actions / submit — variants & sizes already defined |
| `FormInput` | Text fields |
| `FormSelect` | Selects |
| `FormCheckbox` | Checkboxes |
| `FormPlayerForm` | Player create/edit flow |

## Rules

- Prefer these over raw `<button>` / `<input>` / `<select>` when building forms or primary actions that match existing screens (`setup`, head2head create/setup, overlays).
- Extend props/variants on the shared component when the same control needs a new look — do not fork a one-off styled native control next to `FormButton`.
- Domain-specific forms (e.g. player fields) belong as form molecules/organisms that **compose** these atoms, not as duplicate primitives.

## Do / Don't

- ✅ `<FormButton variant="primary" @click="...">`
- ❌ Don't add parallel `MyButton.vue` for the same job
- ❌ Don't restyle a naked `<button>` when `FormButton` variants cover it
