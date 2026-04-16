export const DAILY_SHOP_ITEM_LIMIT = 100;
export const SHOP_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000;

export type ShopPurchaseWindow = {
  purchasedCount: number;
  windowStartedAt: number;
};

export function createShopPurchaseWindow(now = Date.now()): ShopPurchaseWindow {
  return {
    purchasedCount: 0,
    windowStartedAt: now,
  };
}

export function normalizeShopPurchaseWindow(
  current: ShopPurchaseWindow | null | undefined,
  now = Date.now(),
): ShopPurchaseWindow {
  if (!current) {
    return createShopPurchaseWindow(now);
  }

  if (now - current.windowStartedAt >= SHOP_LIMIT_WINDOW_MS) {
    return createShopPurchaseWindow(now);
  }

  return current;
}

export function getRemainingDailyShopPurchases(
  current: ShopPurchaseWindow | null | undefined,
  now = Date.now(),
) {
  const normalized = normalizeShopPurchaseWindow(current, now);
  return Math.max(0, DAILY_SHOP_ITEM_LIMIT - normalized.purchasedCount);
}

export function canPurchaseShopQuantity(
  current: ShopPurchaseWindow | null | undefined,
  quantity: number,
  now = Date.now(),
) {
  return getRemainingDailyShopPurchases(current, now) >= Math.max(0, quantity);
}

export function applyShopPurchaseQuantity(
  current: ShopPurchaseWindow | null | undefined,
  quantity: number,
  now = Date.now(),
): ShopPurchaseWindow {
  const normalized = normalizeShopPurchaseWindow(current, now);
  return {
    ...normalized,
    purchasedCount: Math.min(DAILY_SHOP_ITEM_LIMIT, normalized.purchasedCount + Math.max(0, quantity)),
  };
}
