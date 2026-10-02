---
description: TypeScript — interfaces vs types, narrowing, generics, enums, utility types
globs:
  - "**/*.ts"
  - "**/*.vue"
alwaysApply: false
---

# TypeScript Rules

## Type Definitions

### Interfaces vs Types

- Use `interface` for object shapes that may be extended or implemented
- Use `type` for unions, intersections, aliases, and computed types
- Use `type` for union types (e.g., `'option1' | 'option2'`)
- Use `type` when you need to use utility types or mapped types

**Examples:**

```typescript
// ✅ Use interface for object shapes
export interface Product {
  code: string;
  name: string;
  slug: string;
}

// ✅ Use type for unions
export type ButtonType = "primary" | "secondary" | "light" | (string & {});

// ✅ Use type for aliases
export type ImageConfig = ImageSizes | ImageDimensions;

// ✅ Use type for utility types
export type productKey = keyof ProductPage["product"][0];
```

### Naming Conventions

- **Interfaces and Types**: Use PascalCase
- **Properties**: Use camelCase
- **Enums**: Use PascalCase with `Enum` suffix (e.g., `BackgroundColorEnum`)
- **Enum Values**: Use UPPER_CASE for constants, lowercase strings for string enums
- **Type Parameters**: Use single uppercase letters (e.g., `T`, `K`, `V`)

**Examples:**

```typescript
// ✅ Interface naming
export interface ProductVariant {
  code: string;
  name: string;
}

// ✅ Type naming
export type Author = {
  reviewedBy: DoctorFragment | ReviewedByFragment;
  reviewedAt: string;
};

// ✅ Enum naming
export enum BackgroundColorEnum {
  NONE = "none",
  PRIMARY = "PRIMARY",
}
```

### Optional Properties

- Use `?` for optional properties
- Place optional properties at the end of the interface/type definition

**Example:**

```typescript
export interface Product {
  code: string;
  name: string;
  slug: string;
  inStock?: boolean;
  startingPrice?: ProductPrice;
}
```

### Type Organization

- Store types in `@types` folders
- One type/interface per file, or related types together
- Re-export types via `index.ts` files using `export * from './filename'`
- Group related types in the same file when they're closely related

**Example:**

```typescript
// @types/product.ts
export interface Product {
  // ...
}

export interface ProductVariant {
  // ...
}

// @types/index.ts
export * from "./product";
export * from "./button";
```

## Functions

### Function Signatures

- **Use arrow functions** for all functions — do not use `function` declarations
- Always provide explicit return types for exported functions
- Type all function parameters
- Use generic types `<T>` when functions work with multiple types
- Use type guards with `object is T` return type for type narrowing

**Examples:**

```typescript
// ✅ Explicit return type (arrow function)
export const useInstanceOf = <T extends Object>(
  properties: string | number | (string | number)[],
  object: object
): object is T => {
  // ...
};

// ✅ Generic function (arrow function)
export const useFindHeadingsByType = (
  pageContent: any,
  type: string
): string[] => {
  // ...
};

// ✅ Using utility types for parameters (arrow function)
export const getYouTubeEmbedFromUrl = (
  url: string,
  options: Parameters<typeof getYouTubeEmbedUrl>[1] = {}
): string | null => {
  // ...
};
```

### Default Parameters

- Use default parameter values when appropriate
- Type default parameters explicitly

**Example:**

```typescript
export const useFormField = (options: UseFormFieldOptions = {}) => {
  const { debounceMs = 2000, type = "text" } = options;
  // ...
};
```

## Enums

- Use enums for a fixed set of related constants
- Use PascalCase with `Enum` suffix for enum names
- Use descriptive names for enum values
- Prefer string enums over numeric enums when the values are meaningful strings

**Example:**

```typescript
export enum BackgroundColorEnum {
  NONE = "none",
  PRIMARY = "PRIMARY",
}
```

## Constants

- Use `const` for constants
- Use `Record<string, T>` for constant objects with string keys
- Export constants from `@constants` folders
- Type constants explicitly when the type cannot be inferred

**Example:**

```typescript
export const languages: Record<string, string> = {
  da: "Dansk",
  de: "Deutsch",
  en: "English",
};

export const emailPattern = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
```

## Type Imports

- Always use `import type` for type-only imports
- Separate type imports from regular imports, even if from the same package
- Group imports by category: Vendor, Types, Constants, Composables, Components, Utils

**Example:**

```typescript
// Vendor
import { ref, computed } from "vue";

// Types
import type { Ref, ComputedRef } from "vue";
import type { Product } from "@layer/base/@types/product";
import type { DocumentNode } from "graphql";
```

## Utility Types

- Use TypeScript utility types when appropriate:
  - `Record<K, V>` for object types with specific key/value types
  - `keyof` for extracting keys from types
  - `ReturnType<T>` for extracting return types
  - `Parameters<T>` for extracting parameter types
  - `Partial<T>` for making all properties optional
  - `Pick<T, K>` for selecting specific properties
  - `Omit<T, K>` for excluding specific properties

**Examples:**

```typescript
export type productKey = keyof ProductPage["product"][0];

export const getYouTubeEmbedFromUrl = (
  url: string,
  options: Parameters<typeof getYouTubeEmbedUrl>[1] = {}
): string | null => {
  // ...
};

export const languages: Record<string, string> = {
  // ...
};
```

## Error Handling

- Use `@ts-expect-error` with TODO comments when type errors need to be temporarily ignored
- Prefer `@ts-expect-error` over `@ts-ignore` as it will error if the issue is fixed
- Always include a TODO comment explaining why the error is ignored

**Example:**

```typescript
// @ts-expect-error - TODO: fix this typescript error
import type { CartData } from "sylius-store";
```

## Classes

- Use class properties with explicit type annotations
- Initialize properties with default values when appropriate
- Use access modifiers (`public`, `private`, `protected`) when needed

**Example:**

```typescript
export class AidenWebhookObject {
  timestamp: number = Date.now();
  route: string = "";
  advisorId: string = "";
  finishedForm: boolean = false;
}
```

## Type Guards

- Use type guards for runtime type checking
- Return type should be `object is T` for type narrowing
- Use `in` operator or `instanceof` for type checking

**Example:**

```typescript
export const useInstanceOf = <T extends Object>(
  properties: string | number | (string | number)[],
  object: object
): object is T => {
  if (Array.isArray(properties)) {
    return properties.every((property) => property in object);
  }
  return properties in object;
};

export const isYouTubeMediaItem = (item: MediaItem): item is YouTubeMediaItem =>
  item.type === "youtube";
```

## Union Types

- Use union types with `|` for values that can be one of several types
- Use parentheses for complex union types
- Use `(string & {})` to allow any string while maintaining type safety for known values

**Example:**

```typescript
export type ButtonType = "primary" | "secondary" | "light" | (string & {});

export type Author = {
  reviewedBy: DoctorFragment | ReviewedByFragment;
  reviewedAt: string;
};
```

## Index Signatures

- Use index signatures for objects with dynamic keys
- Prefer `Record<string, T>` over index signatures when possible
- Use `[key: string]` for string keys, `[key: number]` for numeric keys

**Example:**

```typescript
export interface Facets {
  [key: string]: any;
  type: FacetItem[];
}

// Prefer Record when possible
export const languages: Record<string, string> = {
  // ...
};
```

## Extending Types

- Use `extends` for interface inheritance
- Use intersection types (`&`) for combining types
- Use `extends` keyword in generic constraints

**Example:**

```typescript
export interface YouTubeMediaItem extends MediaItem {
  videoId: string;
  embedUrl: string;
}

export interface ProductVariantTranslation extends ProductTranslation {
  caption?: string;
}

export const useInstanceOf = <T extends Object>(): object is T => {
  // ...
  // ...
};
```

## Array Types

- Always use `T[]` syntax (NOT the `Array<T>` syntax)
- Always use `readonly T[]` for immutable arrays (NOT `ReadonlyArray<T>`)
- Type array elements explicitly

**Example:**

```typescript
export interface Articles {
  items: Article[];
}

const headings: string[] = [];
```

## Comments

- Use `/** */` for multi-line comments
- Use `//` for single-line comments
- Add TODO comments for future improvements
- Document complex type logic with comments

**Example:**

```typescript
/**
 * Creates an 128-bit FNV-1a hash of a string.
 */
const hash = (value: string): string => {
  // ...
};

// TODO: replace this type with the type from generated GraphQL
export type NormalizedPage = {
  // ...
};
```
