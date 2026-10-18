// @ts-check
import eslintConfigPrettier from "eslint-config-prettier";
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt(
  // Prettier owns formatting; this drops the preset rules that would fight it.
  eslintConfigPrettier,
  {
    name: "darts/overrides",
    rules: {
      // Optional props are often intentionally `undefined`, and `withDefaults` is banned.
      "vue/require-default-prop": "off",
      // .cursor/rules/typescript — `interface` for object shapes. Unions,
      // intersections and computed types stay `type`; the rule only flags
      // plain object shapes, so it does not fight that. Not in the preset, so
      // it needs setting here rather than overriding.
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
      "vue/attribute-hyphenation": "error",
      "vue/block-order": "error",
      // A vue2-essential rule that @nuxt/eslint-config switches on for
      // pages/layouts; Vue 3 templates may have multiple roots (fragments).
      // Turn it back on if app.pageTransition is ever enabled, since a
      // transition needs a single root to animate.
      "vue/no-multiple-template-root": "off",
      // Would mean turning the static-only DatabaseService into a module,
      // which rewrites every call site. That is an architecture decision.
      "@typescript-eslint/no-extraneous-class": "off",
    },
  },
  {
    name: "darts/cursor-rules",
    rules: {
      // .cursor/rules/control-flow — no inline/braceless if.
      curly: ["error", "all"],
      // .cursor/rules/structured-imports — type imports stay a separate statement.
      // (the plugin spells the top-level option "prefer-top-level")
      "import/consistent-type-specifier-style": ["error", "prefer-top-level"],
      // .cursor/rules/typescript — `T[]`, never `Array<T>`.
      "@typescript-eslint/array-type": [
        "error",
        { default: "array", readonly: "array" },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "no-restricted-syntax": [
        "error",
        {
          selector: "CallExpression[callee.name='withDefaults']",
          message:
            "No withDefaults — use Vue 3.5 destructure defaults: const { foo = 1 } = defineProps<Props>().",
        },
        {
          selector:
            "ExportNamedDeclaration > FunctionDeclaration[generator=false]",
          message:
            "Use an arrow export: export const name = (...) => {} (AGENTS.md, TypeScript / exports).",
        },
        {
          selector:
            "ExportDefaultDeclaration > FunctionDeclaration[generator=false]",
          message:
            "Use an arrow export: export default (...) => {} (AGENTS.md, TypeScript / exports).",
        },
        {
          selector:
            "CallExpression[callee.name='defineEmits'] > ArrayExpression",
          message:
            "Use a typed defineEmits<{ ... }>() instead of the array form (.cursor/rules/vue-global-rules).",
        },
      ],
    },
  },
);
