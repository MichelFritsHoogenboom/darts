<script setup lang="ts">
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { onClickOutside } from "@vueuse/core";
import { exportDatabaseAsJson, importDatabaseFromJson } from "~/utils/dbExport";

const menuOpen = ref(false);
const exportModalVisible = ref(false);
const importModalVisible = ref(false);
const busy = ref(false);
const menuRoot = ref<HTMLElement | null>(null);

const exportOptions = [{ label: "Export", value: "export" }];
const importOptions = [{ label: "Import", value: "import" }];

onClickOutside(menuRoot, () => {
  menuOpen.value = false;
});

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};

const openExportModal = () => {
  menuOpen.value = false;
  exportModalVisible.value = true;
};

const openImportModal = () => {
  menuOpen.value = false;
  importModalVisible.value = true;
};

const closeExportModal = () => {
  if (busy.value) return;
  exportModalVisible.value = false;
};

const closeImportModal = () => {
  if (busy.value) return;
  importModalVisible.value = false;
};

const handleExportSelect = async (value: string | number | boolean) => {
  if (value !== "export" || busy.value) return;

  busy.value = true;
  try {
    await exportDatabaseAsJson();
    exportModalVisible.value = false;
  } catch (err) {
    console.error("Failed to export database:", err);
  } finally {
    busy.value = false;
  }
};

const handleImportSelect = async (value: string | number | boolean) => {
  if (value !== "import" || busy.value) return;

  busy.value = true;
  try {
    const imported = await importDatabaseFromJson();
    importModalVisible.value = false;
    if (imported) {
      window.location.reload();
    }
  } catch (err) {
    console.error("Failed to import database:", err);
  } finally {
    busy.value = false;
  }
};
</script>

<template>
  <div ref="menuRoot" class="header-menu">
    <button
      type="button"
      class="toggle"
      :aria-expanded="menuOpen"
      aria-haspopup="menu"
      aria-label="Menu"
      @click="toggleMenu"
    >
      <FontAwesomeIcon :icon="faBars" class="icon" />
    </button>

    <div v-if="menuOpen" class="dropdown" role="menu">
      <button
        type="button"
        class="item"
        role="menuitem"
        @click="openExportModal"
      >
        Export data
      </button>
      <button
        type="button"
        class="item"
        role="menuitem"
        @click="openImportModal"
      >
        Import data
      </button>
    </div>

    <GamesX01DecisionModal
      :visible="exportModalVisible"
      title="Export"
      description="Download a JSON backup of your local database."
      :options="exportOptions"
      undo-label="Close"
      undo-title="Close"
      @select="handleExportSelect"
      @undo="closeExportModal"
    />

    <GamesX01DecisionModal
      :visible="importModalVisible"
      title="Import data"
      description="This replaces your local database with the selected file. Export a backup first if you want to keep your current data."
      :options="importOptions"
      undo-label="Cancel"
      undo-title="Cancel"
      @select="handleImportSelect"
      @undo="closeImportModal"
    />
  </div>
</template>

<style scoped lang="scss">
.header-menu {
  @apply relative flex justify-end items-center;
}

.toggle {
  @apply inline-flex items-center justify-center rounded px-2 py-1 text-white;
  @apply hover:bg-white/10 transition-colors;

  .icon {
    @apply h-5 w-5;
  }
}

.dropdown {
  @apply absolute right-0 top-full mt-1 z-40 min-w-[12rem] rounded-lg py-1;
  @apply border-2 border-gray-500 bg-gray-700;
  @apply shadow-xl shadow-black/40;
}

.item {
  @apply block w-full px-4 py-2 text-left text-sm text-white;
  @apply hover:bg-gray-600 transition-colors;
}
</style>
