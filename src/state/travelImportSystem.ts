import { getItemByIdV2 } from "../data/itemDataV2";
import { canCarryTravelGoods, type TravelCapacityModifiers } from "./travelCapacitySystem";
import { addInventoryItem, type InventoryState } from "./inventorySystem";

export type TravelImportResult = {
  ok: boolean;
  reason?: string;
  nextInventory?: InventoryState;
};

export function countTravelGoodsInInventory(inventory: InventoryState) {
  return inventory.entries.reduce((total, entry) => {
    const item = getItemByIdV2(entry.itemId);
    if (!item?.isTravelGood) {
      return total;
    }
    return total + entry.quantity;
  }, 0);
}

export function canImportTravelGoods(
  inventory: InventoryState,
  itemId: string,
  quantity: number,
  modifiers?: TravelCapacityModifiers,
): TravelImportResult {
  const safeQuantity = Math.max(0, Math.floor(quantity));
  if (safeQuantity <= 0) {
    return { ok: false, reason: "Invalid quantity." };
  }

  const item = getItemByIdV2(itemId);
  if (!item) {
    return { ok: false, reason: "Item not found." };
  }

  if (!item.isTravelGood) {
    return { ok: false, reason: "Item is not handled by the travel import system." };
  }

  const currentTravelGoods = countTravelGoodsInInventory(inventory);
  if (!canCarryTravelGoods(currentTravelGoods, safeQuantity, modifiers)) {
    return { ok: false, reason: "Travel-goods carrying capacity exceeded." };
  }

  return { ok: true };
}

export function importTravelGoods(
  inventory: InventoryState,
  itemId: string,
  quantity: number,
  modifiers?: TravelCapacityModifiers,
): TravelImportResult {
  const check = canImportTravelGoods(inventory, itemId, quantity, modifiers);
  if (!check.ok) {
    return check;
  }

  return {
    ok: true,
    nextInventory: addInventoryItem(inventory, itemId, quantity),
  };
}
