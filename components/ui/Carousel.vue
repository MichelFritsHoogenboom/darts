<script setup lang="ts">
import { useIntervalFn } from "@vueuse/core";

const activeIndex = defineModel<number>({ default: 0 });

const { titles, autoplayMs = 10_000 } = defineProps<{
  titles: string[];
  autoplayMs?: number;
}>();

const direction = ref<"next" | "prev">("next");

const slideCount = computed(() => titles.length);

const activeTitle = computed(
  () => titles[activeIndex.value] ?? titles[0] ?? "",
);

const transitionName = computed(() => `cube-${direction.value}`);

const goTo = (index: number, preferredDirection?: "next" | "prev") => {
  if (slideCount.value === 0) return;
  const nextIndex = (index + slideCount.value) % slideCount.value;
  if (nextIndex === activeIndex.value) return;

  if (preferredDirection) {
    direction.value = preferredDirection;
  } else {
    const forward =
      (nextIndex - activeIndex.value + slideCount.value) % slideCount.value;
    direction.value = forward <= slideCount.value / 2 ? "next" : "prev";
  }

  activeIndex.value = nextIndex;
};

const next = () => goTo(activeIndex.value + 1, "next");

const { pause, resume } = useIntervalFn(() => {
  if (slideCount.value > 1) next();
}, autoplayMs);

const pauseAutoplay = () => pause();
const resumeAutoplay = () => {
  if (slideCount.value > 1) resume();
};
</script>

<template>
  <div
    class="carousel"
    @mouseenter="pauseAutoplay"
    @mouseleave="resumeAutoplay"
  >
    <div class="title">
      <Transition name="title-fade">
        <UiDisplayHeader :key="activeTitle" tag-size="h2" display-size="h3">
          {{ activeTitle }}
        </UiDisplayHeader>
      </Transition>
    </div>

    <div class="stage">
      <Transition :name="transitionName" mode="out-in">
        <div :key="activeIndex" class="face">
          <slot :index="activeIndex" :title="activeTitle" />
        </div>
      </Transition>
    </div>

    <div v-if="slideCount > 1" class="dots" role="tablist">
      <button
        v-for="(title, index) in titles"
        :key="title"
        type="button"
        class="dot"
        :class="{ active: index === activeIndex }"
        role="tab"
        :aria-selected="index === activeIndex"
        :aria-label="title"
        @click="goTo(index)"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
$cube-motion: 0.7s cubic-bezier(0.4, 0, 0.2, 1);
$title-motion: 0.9s cubic-bezier(0.4, 0, 0.2, 1);

.carousel {
  @apply flex w-full flex-col gap-3;
}

.title {
  @apply relative min-w-0;
}

.stage {
  @apply relative w-full min-w-0 overflow-hidden;
  perspective: 1100px;
}

.face {
  @apply w-full;
  backface-visibility: hidden;
  transform-origin: center center;
}

.dots {
  @apply flex items-center justify-center gap-2;
}

.dot {
  @apply h-1.5 w-1.5 rounded-full bg-gray-600;
  @apply transition-[width,background-color] duration-300 ease-out;

  &.active {
    @apply w-4 bg-gray-300;
  }
}

.title-fade-enter-active,
.title-fade-leave-active {
  transition: opacity $title-motion;
}

.title-fade-leave-active {
  @apply absolute left-0 top-0 w-full;
}

.title-fade-enter-from,
.title-fade-leave-to {
  opacity: 0;
}

.cube-next-enter-active,
.cube-next-leave-active,
.cube-prev-enter-active,
.cube-prev-leave-active {
  transition: transform $cube-motion;
}

.cube-next-enter-from {
  transform: rotateY(90deg);
}

.cube-next-leave-to {
  transform: rotateY(-90deg);
}

.cube-prev-enter-from {
  transform: rotateY(-90deg);
}

.cube-prev-leave-to {
  transform: rotateY(90deg);
}
</style>
