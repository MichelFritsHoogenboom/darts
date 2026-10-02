---
description: Composable naming, structure, and patterns (use* in composables/)
globs:
  - "**/composables/**/*.ts"
alwaysApply: false
---

# Composables Rules

## Naming Conventions

- **Use `use` prefix** for composables that return reactive state, computed properties, or methods (e.g., `useCountdown`, `useFormField`, `useImageConfig`)
- **Use descriptive names** for formatting/transformation functions (e.g., `useFormatPlayerNames`, `useFormatMatchLabel`)
- **Use camelCase** for all function names
- **Use arrow functions** for composables and helpers — do not use `function` declarations

### File naming

- **Composable files** must be named to match the main exported function: `useXxx.ts` for composables (e.g. `usePlayers.ts`, `useScores.ts`). This keeps filenames and exports aligned and makes composables easy to find.

**Examples:**

```typescript
// ✅ Composable with reactive state (arrow function)
export const useCountdown = (targetDate: Date | string) => {
    // ...
};

// ✅ Formatting function (arrow function)
export const useFormatPlayerNames = (players: Player[], useNickname = true) => {
    // ...
};
```

## File Structure

### Code Organization

1. **Helper functions** - Define before the main exported function
2. **Main composable function** - Export at the end
3. **Return object** - Return all public API in a single object

```typescript
// Helper (arrow function)
const ensurePlayerList = (players: Player | Player[] | undefined): Player[] => {
    // ...
};

// Main composable (arrow function)
export const useFormatPlayerNames = (players: Player[], useNickname = true) => {
    // ...
    return {
        // public API
    };
};
```

## TypeScript

### Function Signatures

- **Always provide explicit return types** for exported functions
- **Type all function parameters** explicitly
- **Use interfaces** for options objects
- **Use type guards** with `object is T` return type when appropriate

```typescript
// ✅ Interface for options
interface UseFormFieldOptions {
  debounceMs?: number;
  type?: "email" | "text";
}

export const useFormField = (options: UseFormFieldOptions = {}) => {
  // ...
};

// ✅ Type guard (arrow function)
export const useInstanceOf = <T extends Object>(
  properties: string | number | (string | number)[],
  object: object
): object is T => {
  // ...
};
```

### Reactive State

- **Use `ref<T>`** for reactive primitives and objects
- **Use `computed<T>`** for derived values
- **Use `readonly()`** when exposing state that should not be mutated externally
- **Type refs explicitly** when the type cannot be inferred

```typescript
// ✅ Typed refs
const timer = ref<ReturnType<typeof setInterval>>();
const remainingTime = ref<{
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}>({
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
});

// ✅ Readonly for external exposure
return {
  showSubNavigation: readonly(subNavigationState.showSubNavigation),
};
```

## Lifecycle Management

- **Use lifecycle hooks** (`onBeforeMount`, `onMounted`, `onBeforeUnmount`, `onUnmounted`) when needed
- **Always clean up** timers, intervals, and event listeners in cleanup hooks
- **Place lifecycle hooks** at the bottom of the composable function (before the return statement)
- **Return cleanup functions** when the composable sets up event listeners or other resources

```typescript
export const useCountdown = (targetDate: Date | string) => {
  const timer = ref<ReturnType<typeof setInterval>>();

  // ... other code ...

  onBeforeMount(() => {
    calculateRemainingTime();
    timer.value = setInterval(calculateRemainingTime, 1000);
  });

  onBeforeUnmount(() => {
    if (timer.value) {
      clearInterval(timer.value);
    }
  });

  return {
    remainingTime,
    isComplete,
    countdownDisplay,
  };
};
```

## Singleton Pattern

Use singleton pattern when you need **shared state across multiple component instances**:

- Store module-level state outside the function
- Check if state exists before initializing

```typescript
// Module-level state
let subNavigationState: {
  showSubNavigation: Ref<boolean>;
  lastScrollPosition: Ref<number>;
  scrollThreshold: number;
  handleScroll: () => void;
} | null = null;

export const useSubNavigation = () => {
  if (!subNavigationState) {
    const showSubNavigation = ref(true);
    // ...
    subNavigationState = {
      showSubNavigation,
      // ...
    };
  }

  return {
    showSubNavigation: readonly(subNavigationState.showSubNavigation),
    initializeScrollListener,
    cleanupScrollListener,
  };
};
```

## Return Object

- **Return all public API** in a single object
- **Group related items** together logically
- **Use consistent naming** - prefer descriptive names over abbreviations
- **Include all reactive refs, computed properties, and methods** that should be accessible

```typescript
return {
  // Reactive state
  remainingTime,
  isComplete,
  // Computed properties
  countdownDisplay,
  // Methods
  calculateRemainingTime,
};
```

## Documentation

- **Add JSDoc comments** for complex functions or functions with non-obvious behavior
- **Document parameters** with `@param` tags
- **Document return values** with `@return` or `@returns` tags

```typescript
/**
 * Function to get a list of languages for a specific country.
 * The function maps the locales into an array of SelectOption objects which contains value and label.
 *
 * @param {string} countryKey - The key representing a country.
 * @return {SelectOption[]} The list of languages for the specified country.
 */
export const getLanguageList = (countryKey: string): SelectOption[] => {
  // ...
};
```

## Default Parameters & Error Handling

- **Use default parameter values** when appropriate
- **Type default parameters** explicitly
- **Place optional parameters at the end**
- **Handle errors gracefully** within composables
- **Use try-catch blocks** for async operations
- **Set error state** when appropriate

```typescript
export const useFormField = (options: UseFormFieldOptions = {}) => {
  const { debounceMs = 2000, type = "text" } = options;
  // ...
};

const loadMatchScores = async (matchId?: string) => {
  try {
    loading.value = true;
    const data: Score[] = await scoreService.getForMatch(matchId);
    scores.value = data;
    return data;
  } catch (error) {
    errorLoadingScores.value = true;
    return;
  } finally {
    loading.value = false;
  }
};
```

## Export Patterns

- **Export the main function** directly
- **Export helper functions** only if they need to be used elsewhere
- **Use named exports** (not default exports)
- **Do not require** `composables/index.ts` barrel files — Nuxt auto-imports from `composables/`
- Pure non-reactive helpers belong in `utils/` (see root `AGENTS.md`), not as composables

```typescript
// ✅ Correct (arrow function)
export const useCountdown = (targetDate: Date | string) => {
  // ...
};
```

## Best Practices

### Do's

- ✅ **Keep composables focused** - Each composable should have a single responsibility
- ✅ **Return reactive state** - Use refs and computed properties for reactive data
- ✅ **Clean up resources** - Always clean up timers, intervals, and event listeners
- ✅ **Type everything** - Provide explicit types for parameters and return values
- ✅ **Use composables for reusable logic** - Extract common patterns into composables
- ✅ **Handle edge cases** - Check for null/undefined values and handle them appropriately

### Don'ts

- ❌ **Don't use `function` declarations** - Use arrow functions (`const name = () => {}`) for composables and helpers
- ❌ **Don't use default exports** - Always use named exports
- ❌ **Don't mutate external state** - Prefer returning new values or using reactive refs
- ❌ **Don't forget cleanup** - Always clean up resources in lifecycle hooks
- ❌ **Don't skip type annotations** - Always type function parameters and return values
- ❌ **Don't create overly complex composables** - Split complex logic into multiple composables
- ❌ **Don't use composables for simple utilities** - Use regular functions for non-reactive utilities

## Examples

### Simple Composable

```typescript
export const useCanonical = () => {
  const { location } = useLocation();
  return {
    rel: "canonical",
    href: location,
  };
};
```

### Composable with Reactive State

```typescript
// Vendor
import { ref, computed, onBeforeMount, onBeforeUnmount } from "vue";

export const useCountdown = (targetDate: Date | string) => {
  const timer = ref<ReturnType<typeof setInterval>>();
  const remainingTime = ref<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const isComplete = computed(() => {
    return (
      remainingTime.value.days === 0 &&
      remainingTime.value.hours === 0 &&
      remainingTime.value.minutes === 0 &&
      remainingTime.value.seconds === 0
    );
  });

  const calculateRemainingTime = () => {
    // ... calculation logic ...
  };

  onBeforeMount(() => {
    calculateRemainingTime();
    timer.value = setInterval(calculateRemainingTime, 1000);
  });

  onBeforeUnmount(() => {
    if (timer.value) {
      clearInterval(timer.value);
    }
  });

  return {
    remainingTime,
    isComplete,
    countdownDisplay,
  };
};
```

### Composable with Options

```typescript
// Vendor
import { ref, computed, onUnmounted } from "vue";

interface UseFormFieldOptions {
  debounceMs?: number;
  type?: "email" | "text";
}

export const useFormField = (options: UseFormFieldOptions = {}) => {
  const { debounceMs = 2000, type = "text" } = options;
  const { t } = useI18n();
  const fieldValue = ref<string>("");
  const fieldTouched = ref(false);
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const handleInput = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => {
      fieldTouched.value = true;
    }, debounceMs);
  };

  const isValid = computed(() => {
    // ... validation logic ...
  });

  onUnmounted(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
  });

  return {
    fieldValue,
    fieldTouched,
    isValid,
    error,
    handleInput,
    handleBlur,
  };
};
```
