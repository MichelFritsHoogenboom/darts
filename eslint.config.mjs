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
      // `interface` vs `type` stays a human call (.cursor/rules/typescript).
      "@typescript-eslint/consistent-type-definitions": "off",
      "vue/attribute-hyphenation": "error",
      "vue/block-order": "error",
      // Keep the preset severity, but drop its autofix: hyphenating
      // `@update:modelValue` on an element that also has `v-model` registers a
      // second, different prop key, and Vue's emit() only ever calls the
      // camelCase one — so the autofix silently drops the listener.
      "vue/v-on-event-hyphenation": ["warn", "always", { autofix: false }],
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
