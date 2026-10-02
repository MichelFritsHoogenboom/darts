# 🎯 Frontend Cursor Rules

> **Centralized coding standards and best practices for our frontend development workflow**

This repository contains the frontend coding rules and conventions that are applied **globally** across all projects in our Cursor account. These rules ensure consistency, maintainability, and code quality across our entire frontend codebase.

## 📋 What's Inside

This repository defines comprehensive rules for:

- **🎨 Vue.js Components** - Component structure, lifecycle management, and best practices
- **♿ Vue Accessibility** - Semantic templates, keyboard navigation, and ARIA
- **🧩 Composables** - Naming conventions, file structure, and reactive state management
- **📦 TypeScript** - Type definitions, interfaces, utility types, and type safety
- **🎯 SCSS/CSS** - Utility framework usage, variable management, and styling conventions
- **♿ Accessible Motion** - `prefers-reduced-motion` for animations, transitions, and scroll
- **📝 Code Organization** - Import ordering, code structure, and file organization
- **🔧 Best Practices** - Error handling, lifecycle management, and code patterns

## 🚀 How It Works

These rules are automatically applied to **all projects** in your Cursor account. When you're working in any frontend project, Cursor will:

- ✅ Enforce consistent code structure and organization
- ✅ Suggest proper naming conventions and patterns
- ✅ Guide you to use our utility framework and SCSS extends
- ✅ Ensure TypeScript best practices are followed
- ✅ Maintain Vue.js component standards

## 📚 Rule Categories

### Vue Components

- Atomic design principles
- Component structure and organization
- Props, emits, and lifecycle management
- Template best practices

### Vue Accessibility

- Semantic HTML before ARIA
- Keyboard navigation and focus management
- Labels, `aria-*`, and form associations

### Composables

- `use` prefix for reactive composables
- `get` prefix for simple getters
- Lifecycle management and cleanup
- Singleton patterns for shared state

### TypeScript

- Interface vs Type usage
- Type definitions and organization
- Utility types and type guards
- Explicit return types

### Styling

- SCSS utility framework extends
- Variable usage from `variables.scss`
- Flex/grid alignment: `start` / `end` (via extends), not `left` / `right`

- Responsive breakpoints
- Margin/padding utilities

### Accessible Motion

- Decision ladder (CSS-only → VueUse → multi-layer)
- Local `prefers-reduced-motion` overrides (no global resets)
- Smooth scroll and autoplay fallbacks
- Vue `<Transition>` / modal / third-party toast handling

### Code Structure

- Import organization (Vendor → Types → Constants → Composables → Components → Utils)
- Code ordering in components
- File organization patterns

## 🎨 Benefits

- **Consistency** - All developers follow the same patterns
- **Quality** - Enforced best practices reduce bugs and technical debt
- **Efficiency** - Less time spent on code review discussions
- **Maintainability** - Easier to understand and modify code across projects
- **Onboarding** - New team members get instant guidance

## 📖 Usage

These rules are automatically active in Cursor. No configuration needed! Just start coding and Cursor will guide you based on these standards.

---

**Note:** These rules are managed centrally and applied globally. For project-specific rules or exceptions, consult with the team lead.
