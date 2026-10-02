---
description: Vue SFCs — feature + atomic folders, no withDefaults, script setup, templates
globs:
  - "**/*.vue"
alwaysApply: false
---

# Vue Global Rules

## Component structure (feature + atomic)

Use **atomic design inside a feature folder**:

```text
components/<feature>/atoms/
components/<feature>/molecules/
components/<feature>/organisms/
```

Examples of `<feature>`: `games/x01`, `stats`, `head2head`, `setup`.

**Promotion rule:** when a component uses an Atom, it becomes a molecule; when it uses a molecule, it becomes an organism — **within that feature**.

**Shared across features:** lift to a shared place (e.g. `components/ui/atoms/…` or `components/form/atoms/…`). Do not duplicate shared controls per feature.

**Existing tree:** do not big-bang relocate the whole repo. **New** components follow this layout; move/touch files toward it when you edit them.

## Defining properties

When we use the `script setup` method, we adhere to the following style:

```ts
defineProps<{
  data: MijnSuperGaveStappenCollectie;
}>();
```

**⚠️ Important:** For default values, see the "Defining default values in props" section below. **NEVER use `withDefaults`**.

## Derived values from props must stay reactive

When a value is derived from a prop (counts, filtered lists, padded collections, mapped options, etc.), define it with `computed` (or another reactive primitive). Do **not** snapshot prop-derived values into plain `const`s during setup.

Plain setup assignments run once. If the same component instance later receives updated props (same keyed node, CMS preview, client navigation reuse), the template and any child/composable that still holds the snapshot will drift from the live prop.

✅ Correct — derived display list and count stay in sync with `data`

```vue
<script setup lang="ts">
const { data } = defineProps<{
  data: CollectionFragment;
}>();

const displayItems = computed(() => {
  // derive from data.items
});

const itemCount = computed(() => displayItems.value.length);

useSomeScroller({ itemCount });
</script>
```

❌ Incorrect — `itemCount` is frozen at first setup while `displayItems` keeps updating

```vue
<script setup lang="ts">
const { data } = defineProps<{
  data: CollectionFragment;
}>();

const itemCount = data.items.length; // snapshot — will not track prop updates

const displayItems = computed(() => {
  // derive from data.items
});
</script>
```

When passing derived counts into composables, type them as `MaybeRefOrGetter<number>` (or `ComputedRef`) and read with `toValue` so callers can pass either a reactive source or a plain number.

## Lifecycle events

Vue lifecycle events should always be placed at the bottom.

Example:

```vue
<script setup lang="ts">
// ... Imports
// ... Constants

onBeforeMount(() => {
  timer.value = setInterval(() => {
    console.log("The final countdown");
  }, 1000);
});

onBeforeUnmount(() => {
  clearInterval(timer.value);
});
</script>
```

## Vue Shorthands

Always use Vue shorthands.

Examples:

```vue
<template>
  <SuperHero :name="heroName" />

  <SuperHero @click="getAngry" />

  <slot name="content"></slot>
  <template #content>Content</template>
</template>
```

## Typing Vue emits

For clarity, we always type any emits we add to components so that we'll get a clear error if an incorrect value is passed.
In Vue, this can be done as follows:

```vue
<script setup lang="ts">
const emit = defineEmits<{
  "value-updated": [count: number];
}>();

emit("value-updated", 42);
</script>
```

Wrong:

```vue
<script setup lang="ts">
defineEmits(["value-updated"]);

emit("value-updated", "this will throw an error");
</script>
```

## Inline event in templates

When an `event` such as `@click` on a component contains more than one method or action, it must always be moved to a separate method in the script tag. See the correct example below:

✅ Correct

```vue
<template>
  <SbButton @click.prevent="handleButtonClick">
    Handle this button on click
  </SbButton>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  clicked: [];
}>();

const handleButtonClick = () => {
  emit("clicked");
  submitForm();
};
</script>
```

❌ Wrong

```vue
<template>
  <SbButton
    @click.prevent="
      () => {
        emit('clicked');
        submitForm();
      }
    "
  >
    Handle this button on click
  </SbButton>
</template>
```

## Defining default values in props

**⚠️ CRITICAL: NEVER use `withDefaults` - it is strictly forbidden in this codebase.**

We provide default values for props using one of these patterns:

### Pattern 1: Reactive Props Destructuring (for simple defaults)

✅ Correct

```vue
<script setup lang="ts">
const { title = "Most Awesome Title", text } = defineProps<{
  title: string;
  text?: string;
}>();
</script>
```

### Pattern 2: Optional props with computed (for complex defaults or when you need the prop in multiple places)

✅ Correct

```vue
<script setup lang="ts">
const props = defineProps<{
  type?: "success" | "error" | "warning" | "info";
}>();

const alertType = computed(() => props.type ?? "info");
</script>
```

### Pattern 3: Optional props with nullish coalescing in template

✅ Correct

```vue
<template>
  <div :class="`alert-${type ?? 'info'}`">
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  type?: "success" | "error" | "warning" | "info";
}>();
</script>
```

❌ **NEVER use `withDefaults` - it is forbidden**

```vue
<script setup lang="ts">
// ❌ DO NOT USE THIS PATTERN
const props = withDefaults(
  defineProps<{
    title: string;
    text?: string;
  }>(),
  {
    title: "Most Awesome Title",
  }
);
</script>
```

## Adding i18n translations

For translations from `i18n`, always use the global `$t` syntax.

✅ Correct

```vue
<template>
  {{ $t("site.awesome.translation.key") }}
</template>
```

❌ Wrong

```vue
<template>
  {{ t("site.awesome.translation.key") }}
</template>

<script setup>
// Vendor
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>
```

## Comments in Vue templates

Add comments in Vue templates only when necessary, and place them only on parent elements—not on child elements such as inner divs or headings.

Example:

```vue
<template>
  <!-- Content Container -->
  <div class="quote-content">
    <div v-if="name" class="quote-header">
      <h1>{{ name }}</h1>
    </div>
  </div>
</template>
```

## Class naming (scoped styles)

**Never use BEM.** We use scoped styling, so BEM is unnecessary. Use simple, semantic class names: one descriptive class on the root, and short semantic names for child sections. **Never prefix child classes with the parent name** (e.g. `.doctor-card-image` inside `.doctor-card`) — `.image` is enough.

✅ Correct

```vue
<template>
  <div class="doctor-card">
    <div class="image">
      <AtomsImage
        :url="doctor.asset.url"
        :name="doctor.asset.name"
        :alt="doctor.asset.description"
      />
    </div>
    <div class="content">
      <h1>Hello World</h1>
    </div>
    <div class="footer">
      <h1>Hello World</h1>
    </div>
  </div>
</template>
```

❌ Wrong (BEM — do not use)

```vue
<template>
  <div class="doctor-card">
    <div class="doctor-card__image">...</div>
    <div class="doctor-card__content">...</div>
    <div class="doctor-card__footer">...</div>
  </div>
</template>
```

❌ Wrong (parent-prefixed child classes — do not use)

```vue
<template>
  <div class="doctor-card">
    <div class="doctor-card-image">...</div>
    <div class="doctor-card-content">...</div>
  </div>
</template>
```

## Template attribute order

When an element has multiple directives or attributes, **put `v-if` first**. Other directives (e.g. `v-for`, `v-show`) and attributes follow.

✅ Correct

```vue
<template>
  <div v-if="isVisible" class="panel" :class="dynamicClass">
    ...
  </div>
</template>
```

❌ Wrong

```vue
<template>
  <div class="panel" v-if="isVisible" :class="dynamicClass">
    ...
  </div>
</template>
```

## Add newline between components

Always insert a blank line between each root element in a component's template. Additionally, add a blank line whenever you use multi-line components.

```vue
<template>
  <AtomHeading>This is the heading of the component</AtomHeading>

  <AtomText>This is the text for the Text Atom</AtomText>

  <div class="parent">
    <div class="item-1">This is the first item</div>
    <div class="item-2">This is the first item</div>
  </div>
</template>
```
