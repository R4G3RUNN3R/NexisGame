import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type DailyCapsState = {
  vendorItemsBoughtToday: number;
  blackMarketItemsBoughtToday: number;
  lastResetDate: string;
};

type MarketRuntimeContextValue = {
  caps: DailyCapsState;
  canBuyFromVendors: (qty?: number) => boolean;
  canBuyFromBlackMarket: (qty?: number) => boolean;
  recordVendorPurchase: (qty?: number) => boolean;
  recordBlackMarketPurchase: (qty?: number) => boolean;
  getVendorRemaining: () => number;
  getBlackMarketRemaining: () => number;
};

const STORAGE_KEY = "nexis_market_runtime";
const VENDOR_DAILY_CAP = 100;
const BLACK_MARKET_DAILY_CAP = 10;

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function getDefaultState(): DailyCapsState {
  return {
    vendorItemsBoughtToday: 0,
    blackMarketItemsBoughtToday: 0,
    lastResetDate: todayKey(),
  };
}

function normalizeState(state: DailyCapsState): DailyCapsState {
  const today = todayKey();
  if (state.lastResetDate !== today) {
    return {
      vendorItemsBoughtToday: 0,
      blackMarketItemsBoughtToday: 0,
      lastResetDate: today,
    };
  }
  return state;
}

function readState(): DailyCapsState {
  if (typeof window === "undefined") return getDefaultState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();
    const parsed = JSON.parse(raw) as Partial<DailyCapsState>;
    return normalizeState({
      vendorItemsBoughtToday: parsed.vendorItemsBoughtToday ?? 0,
      blackMarketItemsBoughtToday: parsed.blackMarketItemsBoughtToday ?? 0,
      lastResetDate: parsed.lastResetDate ?? todayKey(),
    });
  } catch {
    return getDefaultState();
  }
}

const MarketRuntimeContext = createContext<MarketRuntimeContextValue | null>(null);

export function MarketRuntimeProvider({ children }: { children: React.ReactNode }) {
  const [caps, setCaps] = useState<DailyCapsState>(readState);

  useEffect(() => {
    const normalized = normalizeState(caps);
    if (normalized !== caps) {
      setCaps(normalized);
      return;
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(caps));
    }
  }, [caps]);

  const value = useMemo<MarketRuntimeContextValue>(() => ({
    caps: normalizeState(caps),
    canBuyFromVendors(qty = 1) {
      return normalizeState(caps).vendorItemsBoughtToday + qty <= VENDOR_DAILY_CAP;
    },
    canBuyFromBlackMarket(qty = 1) {
      return normalizeState(caps).blackMarketItemsBoughtToday + qty <= BLACK_MARKET_DAILY_CAP;
    },
    recordVendorPurchase(qty = 1) {
      const normalized = normalizeState(caps);
      if (normalized.vendorItemsBoughtToday + qty > VENDOR_DAILY_CAP) return false;
      setCaps({
        ...normalized,
        vendorItemsBoughtToday: normalized.vendorItemsBoughtToday + qty,
      });
      return true;
    },
    recordBlackMarketPurchase(qty = 1) {
      const normalized = normalizeState(caps);
      if (normalized.blackMarketItemsBoughtToday + qty > BLACK_MARKET_DAILY_CAP) return false;
      setCaps({
        ...normalized,
        blackMarketItemsBoughtToday: normalized.blackMarketItemsBoughtToday + qty,
      });
      return true;
    },
    getVendorRemaining() {
      return Math.max(0, VENDOR_DAILY_CAP - normalizeState(caps).vendorItemsBoughtToday);
    },
    getBlackMarketRemaining() {
      return Math.max(0, BLACK_MARKET_DAILY_CAP - normalizeState(caps).blackMarketItemsBoughtToday);
    },
  }), [caps]);

  return <MarketRuntimeContext.Provider value={value}>{children}</MarketRuntimeContext.Provider>;
}

export function useMarketRuntime() {
  const ctx = useContext(MarketRuntimeContext);
  if (!ctx) throw new Error("useMarketRuntime must be used within a MarketRuntimeProvider");
  return ctx;
}
