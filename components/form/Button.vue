<script setup lang="ts">
import { computed } from "vue";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "light"
  | "lightOutline";
type ButtonSize = "sm" | "md" | "lg" | "xl";

const props = defineProps<{
  type?: "button" | "submit" | "reset";
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  fullWidth?: boolean;
}>();

defineEmits(["click"]);

const buttonClasses = computed(() => {
  const baseClasses =
    "font-bold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800";

  const variantClasses: Record<ButtonVariant, string> = {
    primary:
      "bg-dartboard-red hover:bg-red-600 text-white focus:ring-dartboard-red",
    secondary: "bg-gray-600 hover:bg-gray-500 text-white focus:ring-gray-500",
    outline:
      "border-2 border-dartboard-red text-dartboard-red hover:bg-dartboard-red hover:text-white focus:ring-dartboard-red",
    ghost:
      "text-dartboard-red hover:bg-dartboard-red hover:bg-opacity-10 focus:ring-dartboard-red",
    light: "bg-gray-100 hover:bg-gray-200 text-gray-900 focus:ring-gray-500",
    lightOutline:
      "border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
  };

  const sizeClasses: Record<ButtonSize, string> = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
    xl: "px-8 py-4 text-xl",
  };

  const disabledClasses = props.disabled
    ? "opacity-50 cursor-not-allowed"
    : "cursor-pointer";

  const widthClasses = props.fullWidth ? "w-full" : "";

  return [
    baseClasses,
    props.variant ? variantClasses[props.variant] : variantClasses.primary,
    props.size ? sizeClasses[props.size] : sizeClasses.md,
    disabledClasses,
    widthClasses,
  ]
    .filter(Boolean)
    .join(" ");
});
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="buttonClasses"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>
