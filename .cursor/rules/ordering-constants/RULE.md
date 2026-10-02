---
description: Declaration order in Vue SFCs — props, emits, constants, refs, composables, computed, methods
globs:
  - "**/*.vue"
alwaysApply: false
---

# Code Ordering in Single File Components

To keep the code readable, we use an order where each type of const is separated by a blank line. We have the following types that are written in this order:

## Order of Declarations

1. **Props**
   - Optional props are always placed at the bottom

2. **Emits**

3. **Constants**

4. **Composables**

5. **Refs**

6. **Computed**

7. **Methods**

## Example

```vue
<script setup lang="ts">
// ... Imports

const props = defineProps<{
  matchId: string;
  openDetails?: boolean;
}>();

const emits = defineEmits<{
  (e: "change", value: string): void;
}>();

const startingScore = 501;

const { players, loadPlayers } = usePlayers();

const currentScore = ref<number>();
const currentPlayerId = ref<string>("");

const playerCount = computed(() => players.value.length);
const canSubmit = computed(() => currentScore.value != null);

const focusScoreInput = () => {
  // ...
};
</script>
```
