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
export interface Player {
  id: string;
  name: string;
  nickname?: string;
}

// ✅ Use type for unions
export type MatchStatus = "pending" | "in-progress" | "finished" | (string & {});

// ✅ Use type for aliases
export type ScoreValue = number | null;

// ✅ Use type for utility types
export type PlayerStatKey = keyof PlayerStats;
```

### Naming Conventions

- **Interfaces and Types**: Use PascalCase
- **Properties**: Use camelCase
- **Enums**: Use PascalCase with `Enum` suffix (e.g., `MatchStatusEnum`)
- **Enum Values**: Use UPPER_CASE for constants, lowercase strings for string enums
- **Type Parameters**: Use single uppercase letters (e.g., `T`, `K`, `V`)

**Examples:**

```typescript
// ✅ Interface naming
export interface Match {
  id: string;
  playerIds: string[];
}

// ✅ Type naming
export type LegSummaryMeta = {
  winnerId: Player["id"] | null;
  finishedAt: string;
};

// ✅ Enum naming
export enum MatchStatusEnum {
  PENDING = "pending",
  IN_PROGRESS = "in-progress",
  FINISHED = "finished",
}
```

### Optional Properties

- Use `?` for optional properties
- Place optional properties at the end of the interface/type definition

**Example:**

```typescript
export interface Player {
  id: string;
  name: string;
  nickname?: string;
  silhouetteIndex?: number;
}
```

### Type Organization

- Store types in `interfaces/` (see root `AGENTS.md`) — not `@types` folders
- One type/interface per file, or related types together
- Re-export via `index.ts` only when useful; not required for every folder
- Group related types in the same file when they're closely related

**Example:**

```typescript
// interfaces/player.ts
export interface Player {
  // ...
}

export interface PlayerLeg {
  // ...
}

// interfaces/index.ts (optional)
export * from "./player";
export * from "./match";
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
export const getPlayerIdsFromStats = (stats: PlayerStats[]): string[] => {
  // ...
};

// ✅ Using utility types for parameters (arrow function)
export const buildMatchSummary = (
  match: Match,
  options: Parameters<typeof formatMatchSummary>[1] = {}
): string => {
  // ...
};
```

### Default Parameters

- Use default parameter values when appropriate
- Type default parameters explicitly

**Example:**

```typescript
export const useScoreInput = (options: UseScoreInputOptions = {}) => {
  const { maxScore = 180, allowBust = true } = options;
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
export enum MatchStatusEnum {
  PENDING = "pending",
  IN_PROGRESS = "in-progress",
  FINISHED = "finished",
}
```

## Constants

- Use `const` for constants
- Use `Record<string, T>` for constant objects with string keys
- Export constants from `constants/` (see root `AGENTS.md`) — not `@constants` folders
- Type constants explicitly when the type cannot be inferred

**Example:**

```typescript
export const STARTING_SCORES: Record<string, number> = {
  x01: 501,
  cricket: 0,
};

export const CHECKOUT_MAX = 170;
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
import type { Player } from "~/interfaces/player";
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
export type PlayerStatKey = keyof PlayerStats;

export const buildMatchSummary = (
  match: Match,
  options: Parameters<typeof formatMatchSummary>[1] = {}
): string => {
  // ...
};

export const STARTING_SCORES: Record<string, number> = {
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
import type { LegacyScoreRow } from "~/database/legacy";
```

## Classes

- Use class properties with explicit type annotations
- Initialize properties with default values when appropriate
- Use access modifiers (`public`, `private`, `protected`) when needed

**Example:**

```typescript
export class MatchExportPayload {
  exportedAt: number = Date.now();
  matchId: string = "";
  includeStats: boolean = true;
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

export const isCheckoutScore = (score: Score): score is CheckoutScore =>
  score.isCheckout === true;
```

## Union Types

- Use union types with `|` for values that can be one of several types
- Use parentheses for complex union types
- Use `(string & {})` to allow any string while maintaining type safety for known values

**Example:**

```typescript
export type MatchStatus = "pending" | "in-progress" | "finished" | (string & {});

export type LegSummaryMeta = {
  winnerId: Player["id"] | null;
  finishedAt: string;
};
```

## Index Signatures

- Use index signatures for objects with dynamic keys
- Prefer `Record<string, T>` over index signatures when possible
- Use `[key: string]` for string keys, `[key: number]` for numeric keys

**Example:**

```typescript
export interface ScoreCounts {
  [score: string]: number;
}

// Prefer Record when possible
export const STARTING_SCORES: Record<string, number> = {
  // ...
};
```

## Extending Types

- Use `extends` for interface inheritance
- Use intersection types (`&`) for combining types
- Use `extends` keyword in generic constraints

**Example:**

```typescript
export interface CheckoutScore extends Score {
  checkoutDarts: number;
}

export interface MatchWithStats extends Match {
  playerStats?: PlayerStats[];
}

export const useInstanceOf = <T extends Object>(): object is T => {
  // ...
};
```

## Array Types

- Always use `T[]` syntax (NOT the `Array<T>` syntax)
- Always use `readonly T[]` for immutable arrays (NOT `ReadonlyArray<T>`)
- Type array elements explicitly

**Example:**

```typescript
export interface SetSummary {
  legs: Leg[];
}

const playerIds: string[] = [];
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

// Domain types live under interfaces/
export type MatchListItem = {
  // ...
};
```
