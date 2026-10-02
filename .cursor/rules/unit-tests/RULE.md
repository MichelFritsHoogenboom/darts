---
description: Unit tests (Vitest, Vue Test Utils) — patterns for .spec.ts files and __tests__ folders
globs:
  - "**/*.spec.ts"
  - "**/__tests__/**/*.ts"
alwaysApply: false
---

# Unit Test Creation Rules

When creating unit tests for Vue components, composables, and utilities, follow these comprehensive patterns:

## Test File Structure

### File Location and Naming

1. **File Location**: Place test files in `__tests__` directories mirroring the component structure

   - Component: `components/atoms/form/Checkbox.vue`
   - Test: `components/atoms/__tests__/form/Checkbox.spec.ts`
   - Composable: `composables/breadcrumbs.ts`
   - Test: `composables/__tests__/breadcrumbs.spec.ts`

2. **Test File Naming**: Always use `.spec.ts` extension (never `.test.ts`)

### Import Structure

Follow the structured imports pattern used throughout the codebase:

```typescript
// Vendor
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import { nextTick, ref } from "vue";
// Types
import type { ComponentProps } from "@types/component";
// Constants
import { MOCK_CONSTANT } from "@constants/test";
// Composables
import { useComposable } from "../composable";
// Components
import ComponentName from "../../path/to/Component.vue";
// Utils
import { utilityFunction } from "@utils/helper";
```

**Import Categories** (in order):

1. **Vendor**: External packages (vitest, vue, vue-test-utils)
2. **Types**: Type imports (always separate from regular imports)
3. **Constants**: Constant values
4. **Composables**: Composable functions
5. **Components**: Component imports
6. **Utils**: Utility functions

## Component Test Structure

### Basic Template

```typescript
// Vendor
import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
// Types
import type { VueWrapper } from "@vue/test-utils";
// Components
import ComponentName from "../ComponentName.vue";

let wrapper: VueWrapper | null;

// Reusable selectors: functions that return wrapper.find(...)
const componentRoot = () => wrapper!.find(".component-class");
const title = () => wrapper!.find(".component-title");

const defaultProps = {
  /* required props with default values */
};

const mountComponent = (props = {}, slots = {}) => {
  return mount(ComponentName, {
    props: { ...defaultProps, ...props },
    slots,
    global: {
      mocks: {
        /* e.g. $t for i18n */
      },
      stubs: {
        /* NuxtLink, NuxtImg, child components */
      },
    },
  });
};

describe("ComponentName.vue", () => {
  beforeEach(() => {
    wrapper = null;
  });

  describe("Basic Rendering", () => {
    it("renders component correctly", () => {
      // Arrange & Act
      wrapper = mountComponent();

      // Assert
      expect(componentRoot().exists()).toBe(true);
    });
  });

  // Each test mounts explicitly; use different props when needed:
  // it('applies class when active', () => {
  //   wrapper = mountComponent({ active: true });
  //   expect(componentRoot().classes()).toContain('active');
  // });
});
```

### Reusable Selectors

Declare **`let wrapper`** at the top of the spec file (or top of the describe scope). Define selectors as functions that return `wrapper.find(...)` so the same selector is reused and stays in one place:

```typescript
let wrapper: VueWrapper | null;

const doctorImageWrapper = () => wrapper!.find(".doctor-image-wrapper");
const doctorTitle = () => wrapper!.find(".doctor-title");

// In tests: mount explicitly, then use doctorImageWrapper(), doctorTitle(), etc.
```

Use **beforeEach** to reset: **`wrapper = null`**. Keep mounts inside each test: **`wrapper = mountComponent()`** or **`wrapper = mountComponent({ ... })`** at the start of the test so every test explicitly mounts with the props (or defaults) it needs.

### Advanced Template with Cleanup

```typescript
// Vendor
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
// Components
import ComponentName from "../ComponentName.vue";

describe("ComponentName.vue", () => {
  let wrapper: VueWrapper<any>;

  beforeEach(() => {
    // Reset mocks if needed
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  // ... tests
});
```

### Global Function Mocks

```typescript
// Mock useHead
const mockUseHead = vi.fn();
vi.stubGlobal("useHead", mockUseHead);
// Mock useSlots
vi.mock("vue", async () => {
  const actual = await vi.importActual("vue");
  return {
    ...actual,
    useSlots: () => ({ default: undefined }),
  };
});
```

### Utility Function Mocks

```typescript
// Mock utility functions
vi.mock("@layer/base/utils/youtube", () => ({
  extractYouTubeVideoId: vi.fn(),
  getYouTubeThumbnailUrl: vi.fn(),
  getYouTubeEmbedUrl: vi.fn(),
  createYouTubeMediaItem: vi.fn(),
  isYouTubeMediaItem: vi.fn(),
}));

// Create typed mock references
const mockExtractYouTubeVideoId = vi.mocked(extractYouTubeVideoId);
const mockGetYouTubeThumbnailUrl = vi.mocked(getYouTubeThumbnailUrl);

// Setup mock implementations in beforeEach
beforeEach(() => {
  mockExtractYouTubeVideoId.mockImplementation((url: string) => {
    const match = url.match(/[?&]v=([^&]+)/);
    return match ? match[1] : null;
  });
});
```

### Component Mocks

```typescript
// Mock child components
vi.mock("@layer/base/components/atoms/Heading.vue", () => ({
  default: {
    name: "AtomsHeading",
    template: '<div data-testid="atoms-heading"><slot /></div>',
    props: ["type", "class"],
  },
}));
```

### i18n Mock

```typescript
global: {
    mocks: {
        $t: (key: string) => {
            // Return specific translations for known keys
            if (key === 'site.component.translation-key')
                return 'Translated Text';
            return key; // Default: return key as-is
        },
    },
}
```

## Test Categories

Organize tests into these categories using nested `describe` blocks:

1. **Basic Rendering**: Test that component renders correctly
2. **Props**: Test all props and their effects
3. **Type Variants**: Test different type/theme variants (if applicable)
4. **Event Handling**: Test event emissions
5. **State Classes**: Test CSS classes based on state
6. **Error and Success States**: Test error/success states and messages
7. **Accessibility**: Test accessibility attributes (aria-label, name, etc.)
8. **Edge Cases**: Test undefined, null, empty strings, etc.
9. **Slots**: Test slot content rendering
10. **v-model Integration**: Test v-model binding (if applicable)
11. **Validation**: Test form validation (if applicable)
12. **Focus and Active States**: Test focus/active state management (if applicable)

### Example Test Categories

```typescript
describe("ComponentName.vue", () => {
  // ... setup code ...

  describe("Basic Rendering", () => {
    it("renders component correctly", () => {
      // Arrange
      wrapper = mountComponent();
      // Act
      const element = wrapper.find(".component-class");
      // Assert
      expect(element.exists()).toBe(true);
    });

    it("renders slot content when provided", () => {
      // Arrange
      wrapper = mountComponent(
        {},
        {
          default: "Slot Content",
        }
      );
      // Act
      const content = wrapper.find(".content");
      // Assert
      expect(content.exists()).toBe(true);
      expect(content.text()).toContain("Slot Content");
    });
  });

  describe("Props", () => {
    it("applies prop value correctly", () => {
      // Arrange
      wrapper = mountComponent({ propName: "value" });
      // Act
      const element = wrapper.find(".element");
      // Assert
      expect(element.attributes("data-prop")).toBe("value");
    });

    it("updates when prop changes", async () => {
      // Arrange
      wrapper = mountComponent({ propName: "initial" });
      // Assert - Initial state
      expect(wrapper.find(".element").text()).toBe("initial");
      // Act
      await wrapper.setProps({ propName: "updated" });
      // Assert
      expect(wrapper.find(".element").text()).toBe("updated");
    });
  });

  describe("Event Handling", () => {
    it("emits event with correct value", async () => {
      // Arrange
      wrapper = mountComponent();
      const button = wrapper.find("button");
      // Act
      await button.trigger("click");
      // Assert
      expect(wrapper.emitted("click")).toBeTruthy();
      expect(wrapper.emitted("click")[0]).toEqual([expectedValue]);
    });
  });

  describe("State Classes", () => {
    it("applies class when state is active", () => {
      // Arrange
      wrapper = mountComponent({ active: true });
      // Act
      const element = wrapper.find(".component");
      // Assert
      expect(element.classes()).toContain("active");
    });
  });

  describe("Error and Success States", () => {
    it("displays error message when error prop is true", () => {
      // Arrange
      wrapper = mountComponent({
        error: true,
        errorMessage: "Error message",
      });
      // Act
      const errorMessage = wrapper.find(".error-message");
      // Assert
      expect(errorMessage.exists()).toBe(true);
      expect(errorMessage.text()).toContain("Error message");
    });
  });

  describe("Accessibility", () => {
    it("has proper accessibility attributes", () => {
      // Arrange
      wrapper = mountComponent({
        ariaLabel: "Accessible label",
        name: "input-name",
      });
      // Act
      const input = wrapper.find("input");
      // Assert
      expect(input.attributes("aria-label")).toBe("Accessible label");
      expect(input.attributes("name")).toBe("input-name");
    });
  });

  describe("Edge Cases", () => {
    it("handles undefined prop gracefully", () => {
      // Arrange
      wrapper = mountComponent({ prop: undefined });
      // Act
      const element = wrapper.find(".element");
      // Assert
      expect(element.exists()).toBe(true);
    });

    it("handles empty string value", () => {
      // Arrange
      wrapper = mountComponent({ value: "" });
      // Act
      const input = wrapper.find("input");
      // Assert
      expect(input.attributes("value")).toBe("");
    });
  });
});
```

## AAA Pattern (Arrange-Act-Assert)

**ALWAYS** structure each test using the AAA pattern with comments:

```typescript
it("should do something", () => {
  // Arrange
  wrapper = mountComponent({ prop: "value" });
  // Act
  const element = wrapper.find(".selector");
  // Assert
  expect(element.exists()).toBe(true);
});
```

### Async Tests with Multiple Steps

```typescript
it("updates state when prop changes", async () => {
  // Arrange
  wrapper = mountComponent({ checked: false });
  const input = wrapper.find("input");
  // Assert - Initial state
  expect(input.attributes("checked")).toBeUndefined();
  // Act
  await wrapper.setProps({ checked: true });
  // Assert - Final state
  expect(input.attributes("checked")).toBeDefined();
});
```

## Composable Test Structure

```typescript
// Composables
import { useFormatBreadcrumbs } from "../breadcrumbs";

describe("Breadcrumbs Composable", () => {
  it("should flatten the hierarchy", () => {
    // Arrange
    const page = {
      _slug: "/page-1",
      title: "Page 1",
      parent: [
        {
          _slug: "/",
          title: "Home",
          parent: undefined,
        },
      ],
    };
    // Act
    const breadcrumbs = useFormatBreadcrumbs(page);
    // Assert
    expect(breadcrumbs.length).toBe(2);
    expect(breadcrumbs[0].title).toBe("Home");
    expect(breadcrumbs[1].title).toBe("Page 1");
  });
});
```

## Mock Data Patterns

Write all fixture and mock data in English (names, labels, descriptions, etc.).

### GraphQL Type Mock Data

```typescript
// Types
import type { DoctorShowcaseSectionFragment } from "@/graphql/generated/graphql";

const mockDoctor: DoctorShowcaseSectionFragment["doctors"][0] = {
  __typename: "Doctor",
  _id: "doctor-1",
  _slug: "/doctors/test-doctor",
  _changed_on: "2024-01-01T00:00:00Z",
  full_name: "Dr. John Doe",
  job_title: "Cardiologist",
  Doctor_slug: "/doctors/test-doctor",
  asset: {
    __typename: "Asset",
    url: "https://example.com/doctor-image.jpg",
    name: "Doctor Image",
    description: "Portrait of Dr. John Doe",
  },
};
```

## Assertions

Use these assertion methods:

- `.exists()` - Check element presence
- `.attributes()` - Check HTML attributes
- `.classes()` - Check CSS classes
- `.text()` - Check text content
- `.emitted()` - Check events
- `.find()` - Find single element
- `.findAll()` - Find multiple elements
- `.findComponent()` - Find component instance
- `.get()` - Get element (throws if not found)
- `.getComponent()` - Get component (throws if not found)

### Common Assertion Patterns

```typescript
// Element existence
expect(element.exists()).toBe(true);
expect(element.exists()).toBe(false);

// Attributes
expect(element.attributes("name")).toBe("value");
expect(element.attributes("disabled")).toBeDefined();
expect(element.attributes("checked")).toBeUndefined();

// Classes
expect(element.classes()).toContain("class-name");
expect(element.classes()).not.toContain("class-name");

// Text content
expect(element.text()).toBe("Expected text");
expect(element.text()).toContain("Partial text");

// Events
expect(wrapper.emitted("event-name")).toBeTruthy();
expect(wrapper.emitted("event-name")[0]).toEqual([expectedValue]);
expect(wrapper.emitted("event-name")).toHaveLength(1);

// Component props
expect(component.props("propName")).toBe("value");
```

## Best Practices

1. **Descriptive Test Names**: Use clear, descriptive test names that explain what is being tested

   - ✅ `'renders checkbox input element with correct attributes'`
   - ❌ `'test checkbox'`

2. **Group Related Tests**: Use nested `describe` blocks to group related tests

3. **Use Helper Functions**: Create `mountComponent` helper for consistency

4. **Clean Up**: Reset wrapper in `beforeEach` (`wrapper = null`); mount inside each test so every test explicitly sets `wrapper = mountComponent()` (or with custom props)

5. **Test Both Positive and Negative Cases**: Test both when something should happen and when it shouldn't

6. **Async Handling**: Always use `async/await` for:

   - Event triggers: `await element.trigger('click')`
   - Prop updates: `await wrapper.setProps({ prop: 'value' })`
   - Value changes: `await input.setValue('text')`
   - Next tick: `await wrapper.vm.$nextTick()`

7. **Mock Data**: Create reusable mock data objects for complex props

8. **Type Safety**: Use proper TypeScript types for wrapper and mock data

9. **Test Coverage**: Ensure tests cover:

   - Basic rendering and structure
   - All props and their effects
   - Event emissions with correct values
   - State changes (classes, visibility, etc.)
   - Error states and messages
   - Success states
   - Accessibility attributes (aria-label, name, etc.)
   - Edge cases (undefined, null, empty strings, etc.)
   - Slot content when applicable
   - Type variants when applicable
   - v-model integration when applicable
   - Validation when applicable

10. **Avoid Test Interdependence**: Each test should be independent and not rely on other tests

11. **Use Data Test IDs**: When possible, use `data-testid` attributes for more reliable element selection

## Special Cases

### Testing Teleported Elements

```typescript
// Elements teleported to body need to be queried from document
const closeButton = document.querySelector(
  "button[aria-label]"
) as HTMLButtonElement | null;
if (closeButton) {
  closeButton.click();
}
```

### Testing v-model

```typescript
it("updates model value on input", async () => {
  // Arrange
  wrapper = mountComponent({ modelValue: "initial" });
  // Act
  const input = wrapper.find("input");
  await input.setValue("new value");
  // Assert
  expect(wrapper.emitted("update:modelValue")).toBeTruthy();
  expect(wrapper.emitted("update:modelValue")[0]).toEqual(["new value"]);
});
```

### Testing Component with Ref

```typescript
it("renders child component correctly", () => {
  // Arrange
  wrapper = mountComponent();
  // Act
  const childComponent = wrapper.findComponent({ ref: "childRef" });
  // Assert
  expect(childComponent.exists()).toBe(true);
});
```

## Workflow

When asked to create a unit test, automatically:

1. Read the component/composable file to understand its structure
2. Create comprehensive tests following the structure above
3. Ensure all props, events, and behaviors are tested
4. Include accessibility and edge case tests
5. Use proper TypeScript types
6. Follow the structured imports pattern
7. Use the AAA pattern with comments
8. Group tests into appropriate categories
9. Add stubs for related components
10. Add proper mocks for dependencies
