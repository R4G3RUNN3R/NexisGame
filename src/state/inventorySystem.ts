export type InventoryEntry = {
  itemId: string;
  quantity: number;
};

export type InventoryState = {
  entries: InventoryEntry[];
};

export function createEmptyInventory(): InventoryState {
  return { entries: [] };
}

export function getInventoryQuantity(inventory: InventoryState, itemId: string): number {
  return inventory.entries.find((entry) => entry.itemId === itemId)?.quantity ?? 0;
}

export function addInventoryItem(
  inventory: InventoryState,
  itemId: string,
  quantity: number,
): InventoryState {
  const safeQuantity = Math.max(0, Math.floor(quantity));
  if (safeQuantity === 0) return inventory;

  const existing = inventory.entries.find((entry) => entry.itemId === itemId);
  if (!existing) {
    return {
      entries: [...inventory.entries, { itemId, quantity: safeQuantity }],
    };
  }

  return {
    entries: inventory.entries.map((entry) =>
      entry.itemId === itemId
        ? { ...entry, quantity: entry.quantity + safeQuantity }
        : entry,
    ),
  };
}

export function removeInventoryItem(
  inventory: InventoryState,
  itemId: string,
  quantity: number,
): InventoryState {
  const safeQuantity = Math.max(0, Math.floor(quantity));
  if (safeQuantity === 0) return inventory;

  return {
    entries: inventory.entries
      .map((entry) =>
        entry.itemId === itemId
          ? { ...entry, quantity: Math.max(0, entry.quantity - safeQuantity) }
          : entry,
      )
      .filter((entry) => entry.quantity > 0),
  };
}

export function canRemoveInventoryItem(
  inventory: InventoryState,
  itemId: string,
  quantity: number,
): boolean {
  return getInventoryQuantity(inventory, itemId) >= Math.max(0, Math.floor(quantity));
}
