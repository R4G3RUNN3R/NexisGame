import { getItemByIdV2 } from "../data/itemDataV2";

export const STANDARD_NPC_RESALE_RATE = 0.35;
export const TRAVEL_GOOD_NPC_RESALE_RATE = 0.45;
export const ILLICIT_NPC_RESALE_RATE = 0.2;

export function getNpcResaleRate(itemId: string) {
  const item = getItemByIdV2(itemId);
  if (!item) {
    return STANDARD_NPC_RESALE_RATE;
  }

  if (item.isIllicit) {
    return ILLICIT_NPC_RESALE_RATE;
  }

  if (item.isTravelGood) {
    return TRAVEL_GOOD_NPC_RESALE_RATE;
  }

  return STANDARD_NPC_RESALE_RATE;
}

export function getNpcResaleValueCopper(itemId: string, quantity: number) {
  const item = getItemByIdV2(itemId);
  if (!item) {
    return 0;
  }

  const safeQuantity = Math.max(0, Math.floor(quantity));
  return Math.floor(item.baseValue * getNpcResaleRate(itemId) * safeQuantity);
}
