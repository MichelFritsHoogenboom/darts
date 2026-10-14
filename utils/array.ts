/**
 * Removes an item from an array by its ID
 * @param array - The array to remove from
 * @param id - The ID of the item to remove
 * @returns true if the item was found and removed, false otherwise
 */
export function removeObjectById<T extends { id: string }>(
  array: T[],
  id: string,
): boolean {
  const index = array.findIndex((item) => item.id === id);
  if (index > -1) {
    array.splice(index, 1);
    return true;
  }
  return false;
}

export function sortByCreatedAt<T extends { createdAt: Date }>(
  items: T[],
): T[] {
  return [...items].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
  );
}

/**
 * Indices where `keyOf` differs from the previous item, so the first item is
 * never included. Useful for marking group boundaries in a flat ordered list.
 */
export const changeIndices = <T>(
  items: readonly T[],
  keyOf: (item: T) => unknown,
): number[] => {
  const indices: number[] = [];

  for (let index = 1; index < items.length; index++) {
    if (keyOf(items[index]) !== keyOf(items[index - 1])) {
      indices.push(index);
    }
  }

  return indices;
};

export function removeValueById<T>(array: T[], value: T): boolean {
  const index = array.indexOf(value);
  if (index > -1) {
    array.splice(index, 1);
    return true;
  }
  return false;
}
