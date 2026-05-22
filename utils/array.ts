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

export function removeValueById<T>(array: T[], value: T): boolean {
  const index = array.indexOf(value);
  if (index > -1) {
    array.splice(index, 1);
    return true;
  }
  return false;
}
