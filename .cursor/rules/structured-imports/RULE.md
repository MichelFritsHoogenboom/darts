---
description: Grouped imports — Vendor, Types, Constants, Composables, Components, Utils (Vue + composables + tests)
globs:
  - "**/*.vue"
  - "**/composables/**/*.ts"
  - "**/*.spec.ts"
  - "**/__tests__/**/*.ts"
alwaysApply: false
---

# Structured Imports in Single File Components

Imports in Single File Components, composables, and tests should be grouped into the following categories: Vendor, Types, Constants, Composables, Components, and Utils.

These categories are separated by a single line comment.

## Import Categories

### 1. Vendor

Vendor imports (external packages like Vue, Vue Router, etc.)

### 2. Types

Type imports - always separated from regular imports, even if this means you need to import from the same package twice.

### 3. Constants

Constant values - vendor constants first, then local constants.

### 4. Composables

Composables - vendor composables first, then local composables.

### 5. Components

Component imports - vendor components first, then local components.

### 6. Utils

Utility functions - vendor utils first, then local utils.

## Import Order Rules

1. **Categories must be in order**: Vendor → Types → Constants → Composables → Components → Utils
2. **Within each category**: Vendor imports first, then local imports
3. **Each category is separated** by a blank line and a comment
4. **Type imports are always separate**: Never combine type imports with regular imports, even from the same package

## Examples

### Single File Component

```vue
<script setup lang="ts">
// Vendor
import { ref, onMounted } from "vue";
// Types
import type { Ref, ComputedRef } from "vue";
import type { PaymentRedirectStatus } from "@common/@types/payment";
// Constants
import { CONST_FROM_VENDOR } from "vendor-package";
import { ALLOWED_CANCEL_STATES } from "@account/@constants/order";
// Composables
import { useRoute } from "vue-router";
import { useFormatPrice } from "sylius-store/composables/formatPrice";
// Components
import { ElButton } from "element-plus";
import { SbButton } from "superbrave-component-library";
// Utils
import { formatDate } from "@utils/date";
</script>
```

### Composable

```typescript
// Vendor
import { ref, computed, onUnmounted } from "vue";
// Types
import type { Ref } from "vue";
import type { Breadcrumb } from "@layer/base/@types/breadcrumbs";
// Constants
import { EMAIL_PATTERN } from "@common/@constants/validation";
// Composables
import { useI18n } from "vue-i18n";
import { useFormatPrice } from "@layer/base/composables/price";
// Utils
import { debounce } from "@utils/debounce";

export const useFormField = (options: UseFormFieldOptions = {}) => {
  // ... composable implementation
};
```

## Critical Rules

### Type Imports Must Be Separate

**Always ensure that type imports are not added to the import statements used in, for example, the Vendor list. Always keep types separate, even if this means you need to import from the same package twice.**

**✅ Example of correct code:**

```vue
<script setup lang="ts">
// Vendor
import { ref } from "vue";
// Types
import type { Ref } from "vue";
</script>
```

**❌ Example of bad code:**

```vue
<script setup lang="ts">
// Vendor
import { ref, type Ref } from "vue";
</script>
```

### Import Order Within Categories

Within each category, vendor imports must come before local imports:

**✅ Correct:**

```typescript
// Composables
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useFormatPrice } from "@layer/base/composables/price";
import { useCountdown } from "@/composables/useCountdown";
```

**❌ Incorrect:**

```typescript
// Composables
import { useFormatPrice } from "@layer/base/composables/price";
import { useRoute } from "vue-router";
```

### Empty Categories

If a category is not needed, simply omit it. Do not include empty category comments.

**✅ Correct:**

```vue
<script setup lang="ts">
// Vendor
import { ref } from "vue";
// Types
import type { Ref } from "vue";
// Composables
import { useRoute } from "vue-router";
</script>
```

**❌ Incorrect:**

```vue
<script setup lang="ts">
// Vendor
import { ref } from "vue";
// Types
import type { Ref } from "vue";
// Constants
// Composables
import { useRoute } from "vue-router";
</script>
```
