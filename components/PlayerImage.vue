<script setup lang="ts">
import type { Player } from "~/interfaces/player";
import {
  getPlayerFullName,
  getPlayerSilhouetteUrl,
  playerHasImage,
} from "~/utils/player";

const { player, silhouetteIndex = 0 } = defineProps<{
  player: Player;
  silhouetteIndex?: number;
}>();

const alt = computed(() => getPlayerFullName(player));
const hasImage = computed(() => playerHasImage(player));
const silhouetteUrl = computed(() => getPlayerSilhouetteUrl(silhouetteIndex));

const avatarUrl = ref<string>();

watch(
  () => player.avatar,
  (avatar) => {
    if (avatarUrl.value) {
      URL.revokeObjectURL(avatarUrl.value);
      avatarUrl.value = undefined;
    }
    if (avatar) {
      avatarUrl.value = URL.createObjectURL(avatar);
    }
  },
  { immediate: true },
);

onUnmounted(() => {
  if (avatarUrl.value) {
    URL.revokeObjectURL(avatarUrl.value);
  }
});
</script>

<template>
  <div class="player-image" role="img" :aria-label="alt">
    <img
      v-if="hasImage && avatarUrl"
      :src="avatarUrl"
      :alt="alt"
      class="photo"
    />
    <template v-else>
      <div
        class="silhouette"
        :style="{ '--mask-image': `url(${silhouetteUrl})` }"
      />
      <img :src="silhouetteUrl" alt="" class="sizer" aria-hidden="true" />
    </template>
  </div>
</template>

<style scoped lang="scss">
.player-image {
  @apply block relative;

  .photo,
  .sizer {
    @apply h-64 w-auto block;
  }

  .sizer {
    @apply invisible;
  }

  .silhouette {
    @apply absolute inset-0;
    background-color: color-mix(
      in srgb,
      theme("colors.gray.800") 50%,
      theme("colors.gray.900") 50%
    );
    mask-image: var(--mask-image);
    mask-size: contain;
    mask-repeat: no-repeat;
    mask-position: center bottom;
  }
}
</style>
