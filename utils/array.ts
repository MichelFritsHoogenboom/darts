/**
 * Removes an item from an array by its ID
 * @param array - The array to remove from
 * @param id - The ID of the item to remove
 * @returns true if the item was found and removed, false otherwise
 */
export function removeObjectById<T extends { id: string }>(
  array: T[],
  id: string
): boolean {
  const index = array.findIndex((item) => item.id === id);
  if (index > -1) {
    array.splice(index, 1);
    return true;
  }
  return false;
}

export function removeValueById<T>(array: T[], value: T): boolean {
  const index = array.indexOf(value);
  if (index > -1) {
    array.splice(index, 1);
    return true;
  }
  return false;
}

/**
 * Sorts an array of objects according to the provided sortOrder array.
 * @param items - Array of items to sort (must have an `id` property)
 * @param sortOrder - Array of item IDs in the desired order
 * @param useUpdatedAtFallback - If true, items not found in sortOrder will be sorted by updatedAt (requires items to have `updatedAt` property)
 * @returns Sorted array of items
 */
export function sortByOrder<T extends { id: string }>(
  items: T[],
  sortOrder: string[],
  useUpdatedAtFallback: boolean = false
): T[] {
  const sorted = items.sort((a: T, b: T) => {
    const indexA = sortOrder.indexOf(a.id);
    const indexB = sortOrder.indexOf(b.id);

    // If both items are in sortOrder, sort by their position
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }

    // If not found in sortOrder and fallback is enabled, sort by updatedAt
    if (useUpdatedAtFallback) {
      const aWithDate = a as T & { updatedAt?: Date };
      const bWithDate = b as T & { updatedAt?: Date };

      if (indexA === -1 && indexB === -1) {
        if (aWithDate.updatedAt && bWithDate.updatedAt) {
          return aWithDate.updatedAt.getTime() - bWithDate.updatedAt.getTime();
        }
        return 0;
      }
      if (indexA === -1) return 1; // a not found, place at end
      if (indexB === -1) return -1; // b not found, place at end
    } else {
      // If not found in sortOrder and no fallback, place at end
      if (indexA === -1 && indexB === -1) {
        return 0; // Maintain original order for items not in sortOrder
      }
      if (indexA === -1) return 1; // a not found, place at end
      if (indexB === -1) return -1; // b not found, place at end
    }

    return indexA - indexB;
  });

  return sorted;
}
