---
description: Control flow — braces on every if/else, no single-line if, prefer early returns
globs:
  - "**/*.ts"
  - "**/*.vue"
  - "**/*.js"
alwaysApply: false
---

# Control flow: no inline if statements, prefer early returns

**Never write single-line/inline if statements.** Always use a block with braces and put the body on its own line(s). **Prefer early returns** to reduce nesting and keep the main path clear.

## Rule

- Every `if` (and `else`, `else if`) must have curly braces `{ }`.
- The body of the `if` must not be on the same line as the condition.

## Examples

```typescript
// ❌ BAD - inline/single-line if
if (condition === true) return;
if (condition) doSomething();
if (condition) { doSomething(); }

// ✅ GOOD - block with braces, body on separate line(s)
if (condition === true) {
  return;
}

if (condition) {
  doSomething();
}
```

## Prefer early returns

Handle edge cases and invalid conditions first with early returns. Keep the main logic at the top level and avoid deep nesting.

```typescript
// ❌ BAD - nested logic, harder to follow
const processUser = (user: User | null) => {
  if (user !== null) {
    if (user.isActive) {
      if (user.hasPermission) {
        doWork(user);
      }
    }
  }
};

// ✅ GOOD - early returns, main path is clear
const processUser = (user: User | null) => {
  if (user === null) {
    return;
  }

  if (!user.isActive) {
    return;
  }

  if (!user.hasPermission) {
    return;
  }

  doWork(user);
};
```

Same applies to `else` and `else if`:

```typescript
// ❌ BAD
if (a) foo(); else bar();
if (a) { foo(); } else bar();

// ✅ GOOD
if (a) {
  foo();
  
  return;
}

bar();
```
