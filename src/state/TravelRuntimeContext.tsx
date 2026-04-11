import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type TravelStatus = "idle" | "travelling" | "arrived" | "failed";

export type TravelRuntimeState = {
  currentCityId: string;
  destinationCityId: string | null;
  startedAt: number | null;
  completesAt: number | null;
  status: TravelStatus;
  lastOutcome: string | null;
};

type TravelRuntimeContextValue = {
  travelState: TravelRuntimeState;
  startTravel: (destinationCityId: string, durationMs: number, options?: { riskChance?: number; failureMessage?: string; successMessage?: string }) => boolean;
  finalizeTravel: () => void;
  resetOutcome: () => void;
  getRemainingMs: () => number;
  isTravelling: boolean;
};

const STORAGE_KEY = "nexis_travel_runtime";

const defaultState: TravelRuntimeState = {
  currentCityId: "nexis",
  destinationCityId: null,
  startedAt: null,
  completesAt: null,
  status: "idle",
  lastOutcome: null,
};

function readState(): TravelRuntimeState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Partial<TravelRuntimeState>;
    return {
      ...defaultState,
      ...parsed,
    };
  } catch {
    return defaultState;
  }
}

const TravelRuntimeContext = createContext<TravelRuntimeContextValue | null>(null);

export function TravelRuntimeProvider({ children }: { children: React.ReactNode }) {
  const [travelState, setTravelState] = useState<TravelRuntimeState>(readState);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(travelState));
  }, [travelState]);

  const value = useMemo<TravelRuntimeContextValue>(() => ({
    travelState,
    startTravel(destinationCityId, durationMs, options) {
      if (travelState.status === "travelling") return false;
      const now = Date.now();
      setTravelState((prev) => ({
        ...prev,
        destinationCityId,
        startedAt: now,
        completesAt: now + durationMs,
        status: "travelling",
        lastOutcome: JSON.stringify({
          riskChance: options?.riskChance ?? 0,
          failureMessage: options?.failureMessage ?? "You lost your way and returned to your origin.",
          successMessage: options?.successMessage ?? "Journey completed successfully.",
        }),
      }));
      return true;
    },
    finalizeTravel() {
      setTravelState((prev) => {
        if (!prev.destinationCityId) return prev;
        const metadata = prev.lastOutcome ? JSON.parse(prev.lastOutcome) as { riskChance: number; failureMessage: string; successMessage: string } : null;
        const riskChance = metadata?.riskChance ?? 0;
        const failed = Math.random() < riskChance;

        return {
          currentCityId: failed ? prev.currentCityId : prev.destinationCityId,
          destinationCityId: failed ? prev.currentCityId : prev.destinationCityId,
          startedAt: null,
          completesAt: null,
          status: failed ? "failed" : "arrived",
          lastOutcome: failed ? (metadata?.failureMessage ?? "You lost your way and returned to your origin.") : (metadata?.successMessage ?? "Journey completed successfully."),
        };
      });
    },
    resetOutcome() {
      setTravelState((prev) => ({
        ...prev,
        status: "idle",
        lastOutcome: null,
        destinationCityId: null,
      }));
    },
    getRemainingMs() {
      if (!travelState.completesAt) return 0;
      return Math.max(0, travelState.completesAt - Date.now());
    },
    get isTravelling() {
      return travelState.status === "travelling";
    },
  }), [travelState]);

  return <TravelRuntimeContext.Provider value={value}>{children}</TravelRuntimeContext.Provider>;
}

export function useTravelRuntime() {
  const ctx = useContext(TravelRuntimeContext);
  if (!ctx) throw new Error("useTravelRuntime must be used within a TravelRuntimeProvider");
  return ctx;
}
