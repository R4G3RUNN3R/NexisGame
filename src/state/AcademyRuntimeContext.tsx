import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { AcademyId, WesternBranch } from "../data/academyData";

export type AcademyProgressState = {
  activeAcademy: AcademyId | null;
  switchedAt: number | null;
  westernBranch: WesternBranch;
  unlockedAcademies: AcademyId[];
  rankProgress: Record<AcademyId, number>;
  passiveUnlocks: {
    blackMarketAccess: boolean;
  };
};

type AcademyContextValue = {
  academyState: AcademyProgressState;
  setActiveAcademy: (academyId: AcademyId) => void;
  setWesternBranch: (branch: Exclude<WesternBranch, null>) => void;
  unlockAcademy: (academyId: AcademyId) => void;
  setAcademyRank: (academyId: AcademyId, rank: number) => void;
  unlockPassive: (passive: keyof AcademyProgressState["passiveUnlocks"]) => void;
  hasPassive: (passive: keyof AcademyProgressState["passiveUnlocks"]) => boolean;
};

const STORAGE_KEY = "nexis_academy_state";

const defaultState: AcademyProgressState = {
  activeAcademy: null,
  switchedAt: null,
  westernBranch: null,
  unlockedAcademies: [],
  rankProgress: {
    southern: 0,
    eastern: 0,
    northern: 0,
    western: 0,
    nexis_professions: 0,
  },
  passiveUnlocks: {
    blackMarketAccess: false,
  },
};

function readState(): AcademyProgressState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Partial<AcademyProgressState>;
    return {
      ...defaultState,
      ...parsed,
      unlockedAcademies: parsed.unlockedAcademies ?? defaultState.unlockedAcademies,
      rankProgress: {
        ...defaultState.rankProgress,
        ...(parsed.rankProgress ?? {}),
      },
      passiveUnlocks: {
        ...defaultState.passiveUnlocks,
        ...(parsed.passiveUnlocks ?? {}),
      },
    };
  } catch {
    return defaultState;
  }
}

const AcademyContext = createContext<AcademyContextValue | null>(null);

export function AcademyRuntimeProvider({ children }: { children: React.ReactNode }) {
  const [academyState, setAcademyState] = useState<AcademyProgressState>(readState);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(academyState));
  }, [academyState]);

  const value = useMemo<AcademyContextValue>(() => ({
    academyState,
    setActiveAcademy(academyId) {
      setAcademyState((prev) => ({
        ...prev,
        activeAcademy: academyId,
        switchedAt: Date.now(),
        unlockedAcademies: prev.unlockedAcademies.includes(academyId)
          ? prev.unlockedAcademies
          : [...prev.unlockedAcademies, academyId],
      }));
    },
    setWesternBranch(branch) {
      setAcademyState((prev) => ({
        ...prev,
        westernBranch: branch,
      }));
    },
    unlockAcademy(academyId) {
      setAcademyState((prev) => ({
        ...prev,
        unlockedAcademies: prev.unlockedAcademies.includes(academyId)
          ? prev.unlockedAcademies
          : [...prev.unlockedAcademies, academyId],
      }));
    },
    setAcademyRank(academyId, rank) {
      setAcademyState((prev) => {
        const nextRank = Math.max(prev.rankProgress[academyId] ?? 0, rank);
        const shouldUnlockBlackMarket =
          academyId === "western" &&
          prev.westernBranch === "shadow" &&
          nextRank >= 5;

        return {
          ...prev,
          rankProgress: {
            ...prev.rankProgress,
            [academyId]: nextRank,
          },
          passiveUnlocks: {
            ...prev.passiveUnlocks,
            blackMarketAccess:
              prev.passiveUnlocks.blackMarketAccess || shouldUnlockBlackMarket,
          },
        };
      });
    },
    unlockPassive(passive) {
      setAcademyState((prev) => ({
        ...prev,
        passiveUnlocks: {
          ...prev.passiveUnlocks,
          [passive]: true,
        },
      }));
    },
    hasPassive(passive) {
      return academyState.passiveUnlocks[passive];
    },
  }), [academyState]);

  return <AcademyContext.Provider value={value}>{children}</AcademyContext.Provider>;
}

export function useAcademyRuntime() {
  const ctx = useContext(AcademyContext);
  if (!ctx) throw new Error("useAcademyRuntime must be used within an AcademyRuntimeProvider");
  return ctx;
}
