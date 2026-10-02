---
description: Declaration order in Vue SFCs — props, emits, constants, refs, composables, computed, methods
globs:
  - "**/*.vue"
alwaysApply: false
---

# Code Ordering in Single File Components

To keep the code readable, we use an order where each type of const is separated by a blank line. We have the following types that are written in this order:

## Order of Declarations

1. **Props**
   - Optional props are always placed at the bottom

2. **Emits**

3. **Constants**

4. **Composables**

5. **Refs**

6. **Computed**

7. **Methods**

## Example

```vue
<script setup lang="ts">
// ... Imports

const props = defineProps<{
  initialCountry?: string;
  initialLanguage?: string;
}>();

const emits = defineEmits<{
  (e: "change", value: string): void;
}>();

const prefix = "molecules.section.language-country-selector";

const { locale } = useI18n();

const country = ref<string>(props.initialCountry);
const language = ref<string>(props.initialLanguage);

const countryList = computed(() => getCountryList());
const languageList = computed(() => getLanguageList(country.value));

const redirectLink = () => {
  if (country.value && language.value) {
    location.href = `/${language.value}-${country.value.toLowerCase()}/`;
  }
};
</script>
```
