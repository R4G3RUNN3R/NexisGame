// ─────────────────────────────────────────────────────────────────────────────
// Nexis — Jobs Context
// Category XP model with controlled drop rolling and future-ready reward hooks.
// ─────────────────────────────────────────────────────────────────────────────

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { getCategory, getSubJob, type ItemDrop } from "../data/jobsData";
import { usePlayer } from "./PlayerContext";

export type CategoryProgress = {
  level: number;
  xpCurrent: number;
  xpToNextLevel: number;
  totalAttempts: number;
  totalSuccesses: number;
};

export type SubJobStats = {
  totalAttempts: number;
  totalSuccesses: number;
  chain: number;
};

export type JobOutcomeResult = {
  outcome: "success" | "fail" | "criticalFail";
  goldEarned: number;
  xpEarned: number;
  itemsDropped: { itemId: string; itemName: string; qty: number }[];
  consequence: "none" | "hospital" | "jail";
  consequenceMinutes: number;
  flavorText: string;
  categoryNewLevel: number;
  categoryLeveledUp: boolean;
  chainCount: number;
};

type JobsStorageState = {
  categoryProgress: Record<string, CategoryProgress>;
  subJobStats: Record<string, SubJobStats>;
};

type JobsContextValue = {
  attemptJob: (categoryId: string, subJobId: string) => JobOutcomeResult | null;
  getCategoryProgress: (categoryId: string) => CategoryProgress;
  getSubJobStats: (categoryId: string, subJobId: string) => SubJobStats;
  getCooldownRemaining: (_categoryId: string, _subJobId: string) => number;
  isOnCooldown: (_categoryId: string, _subJobId: string) => boolean;
  now: number;
};

const STORAGE_KEY = "nexis_jobs";
const MAX_CHAIN_MULTIPLIER = 1.5;
const CHAIN_MULTIPLIER_PER_LINK = 0.02;
const MIN_FAIL_CHANCE = 0.05;
const MIN_CRIT_CHANCE = 0.01;
const TRAINING_WHEELS_LEVEL = 10;
const TRAINING_WHEELS_CRIT_FACTOR = 0.2;
const FAIL_DECAY_DIVISOR = 120;
const CRIT_DECAY_DIVISOR = 150;
const BONUS_DROP_CHANCE_PER_10_LEVELS = 0.01;

function subJobKey(categoryId: string, subJobId: string): string {
  return `${categoryId}::${subJobId}`;
}

function defaultCategoryProgress(): CategoryProgress {
  return {
    level: 1,
    xpCurrent: 0,
    xpToNextLevel: 50,
    totalAttempts: 0,
    totalSuccesses: 0,
  };
}

function defaultSubJobStats(): SubJobStats {
  return { totalAttempts: 0, totalSuccesses: 0, chain: 0 };
}

function readStorage(): JobsStorageState {
  if (typeof window === "undefined") return { categoryProgress: {}, subJobStats: {} };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { categoryProgress: {}, subJobStats: {} };
    const parsed = JSON.parse(raw) as Partial<JobsStorageState>;
    return {
      categoryProgress: parsed.categoryProgress ?? {},
      subJobStats: parsed.subJobStats ?? {},
    };
  } catch {
    return { categoryProgress: {}, subJobStats: {} };
  }
}

function writeStorage(state: JobsStorageState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function computeChances(
  baseFailChance: number,
  baseCritFailChance: number,
  level: number,
): { failChance: number; critChance: number; successChance: number } {
  const failChance = Math.max(
    MIN_FAIL_CHANCE,
    baseFailChance * (1 - level / FAIL_DECAY_DIVISOR),
  );
  const rawCrit = baseCritFailChance * (1 - level / CRIT_DECAY_DIVISOR);
  const critChance =
    level < TRAINING_WHEELS_LEVEL
      ? baseCritFailChance * TRAINING_WHEELS_CRIT_FACTOR
      : Math.max(MIN_CRIT_CHANCE, rawCrit);
  const successChance = Math.max(0, 1 - failChance - critChance);
  return { failChance, critChance, successChance };
}

function applyXpToCategory(
  prog: CategoryProgress,
  xpGained: number,
): { updated: CategoryProgress; leveledUp: boolean } {
  let { level, xpCurrent, xpToNextLevel } = prog;
  let leveledUp = false;

  xpCurrent += xpGained;

  while (xpCurrent >= xpToNextLevel && level < 100) {
    xpCurrent -= xpToNextLevel;
    level++;
    xpToNextLevel = level * 50;
    leveledUp = true;
  }

  if (level >= 100) {
    level = 100;
    xpCurrent = xpToNextLevel;
  }

  return { updated: { ...prog, level, xpCurrent, xpToNextLevel }, leveledUp };
}

function resolveDropChance(dropChance: number, level: number, chain: number): number {
  const levelBonus = Math.floor(level / 10) * BONUS_DROP_CHANCE_PER_10_LEVELS;
  const chainBonus = Math.min(0.03, chain * 0.002);
  return Math.min(0.95, dropChance + levelBonus + chainBonus);
}

function rollDrops(
  itemDrops: ItemDrop[],
  level: number,
  chain: number,
): { itemId: string; itemName: string; qty: number }[] {
  const drops: { itemId: string; itemName: string; qty: number }[] = [];

  for (const drop of itemDrops) {
    const finalChance = resolveDropChance(drop.dropChance, level, chain);
    if (Math.random() <= finalChance) {
      const qty =
        drop.minQty === drop.maxQty
          ? drop.minQty
          : drop.minQty + Math.floor(Math.random() * (drop.maxQty - drop.minQty + 1));
      drops.push({ itemId: drop.itemId, itemName: drop.itemName, qty });
    }
  }

  return drops;
}

const JobsContext = createContext<JobsContextValue | null>(null);

export function JobsProvider({ children }: PropsWithChildren) {
  const [storage, setStorage] = useState<JobsStorageState>(readStorage);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    writeStorage(storage);
  }, [storage]);

  const { player, isHospitalized, isJailed, hospitalizeFor, jailFor, spendStamina, addItem, addGold } = usePlayer();

  const getCategoryProgress = useCallback(
    (categoryId: string): CategoryProgress =>
      storage.categoryProgress[categoryId] ?? defaultCategoryProgress(),
    [storage.categoryProgress],
  );

  const getSubJobStats = useCallback(
    (categoryId: string, subJobId: string): SubJobStats =>
      storage.subJobStats[subJobKey(categoryId, subJobId)] ?? defaultSubJobStats(),
    [storage.subJobStats],
  );

  const getCooldownRemaining = useCallback(() => 0, []);
  const isOnCooldown = useCallback(() => false, []);

  const attemptJob = useCallback(
    (categoryId: string, subJobId: string): JobOutcomeResult | null => {
      const category = getCategory(categoryId);
      const subJob = getSubJob(categoryId, subJobId);
      if (!category || !subJob) return null;

      if (player.stats.stamina < subJob.staminaCost) return null;
      if (isHospitalized || isJailed) return null;

      spendStamina(subJob.staminaCost);

      const catProg = getCategoryProgress(categoryId);
      const sjStats = getSubJobStats(categoryId, subJobId);
      const { failChance, critChance, successChance } = computeChances(
        subJob.baseFailChance,
        subJob.baseCritFailChance,
        catProg.level,
      );

      const roll = Math.random();
      let outcome: "success" | "fail" | "criticalFail";
      if (roll < successChance) outcome = "success";
      else if (roll < successChance + failChance) outcome = "fail";
      else outcome = "criticalFail";

      let goldEarned = 0;
      let xpEarned = 0;
      let itemsDropped: { itemId: string; itemName: string; qty: number }[] = [];
      let consequence: "none" | "hospital" | "jail" = "none";
      let consequenceMinutes = 0;
      let flavorText = "";
      let newChain = sjStats.chain;
      let categoryLeveledUp = false;
      let categoryNewLevel = catProg.level;

      if (outcome === "success") {
        const chainMultiplier = Math.min(
          MAX_CHAIN_MULTIPLIER,
          1 + sjStats.chain * CHAIN_MULTIPLIER_PER_LINK,
        );
        const baseGold =
          subJob.baseGoldMin +
          Math.floor(Math.random() * (subJob.baseGoldMax - subJob.baseGoldMin + 1));
        goldEarned = Math.floor(baseGold * chainMultiplier);
        xpEarned = subJob.xpPerSuccess;
        itemsDropped = rollDrops(subJob.itemDrops, catProg.level, sjStats.chain);
        newChain = sjStats.chain + 1;
        flavorText = "Success!";

        addGold(goldEarned);
        for (const drop of itemsDropped) {
          addItem(drop.itemId, drop.qty);
        }

        const { updated, leveledUp } = applyXpToCategory(catProg, xpEarned);
        categoryLeveledUp = leveledUp;
        categoryNewLevel = updated.level;

        setStorage((prev) => ({
          categoryProgress: {
            ...prev.categoryProgress,
            [categoryId]: {
              ...updated,
              totalAttempts: updated.totalAttempts + 1,
              totalSuccesses: updated.totalSuccesses + 1,
            },
          },
          subJobStats: {
            ...prev.subJobStats,
            [subJobKey(categoryId, subJobId)]: {
              totalAttempts: sjStats.totalAttempts + 1,
              totalSuccesses: sjStats.totalSuccesses + 1,
              chain: newChain,
            },
          },
        }));
      } else if (outcome === "fail") {
        xpEarned = Math.floor(subJob.xpPerSuccess * 0.1);
        newChain = 0;
        flavorText = "You failed to complete the task. Better luck next time.";

        const { updated } = applyXpToCategory(catProg, xpEarned);
        categoryNewLevel = updated.level;

        setStorage((prev) => ({
          categoryProgress: {
            ...prev.categoryProgress,
            [categoryId]: {
              ...updated,
              totalAttempts: updated.totalAttempts + 1,
            },
          },
          subJobStats: {
            ...prev.subJobStats,
            [subJobKey(categoryId, subJobId)]: {
              ...sjStats,
              totalAttempts: sjStats.totalAttempts + 1,
              chain: 0,
            },
          },
        }));
      } else {
        flavorText = subJob.critFlavorText;
        newChain = 0;

        if (subJob.critConsequence === "hospital" && subJob.critHospitalMinutes) {
          consequence = "hospital";
          consequenceMinutes = subJob.critHospitalMinutes;
          hospitalizeFor(subJob.critHospitalMinutes, subJob.critFlavorText);
        } else if (subJob.critConsequence === "jail" && subJob.critJailMinutes) {
          consequence = "jail";
          consequenceMinutes = subJob.critJailMinutes;
          jailFor(subJob.critJailMinutes, subJob.critFlavorText);
        }

        setStorage((prev) => ({
          categoryProgress: {
            ...prev.categoryProgress,
            [categoryId]: {
              ...catProg,
              totalAttempts: catProg.totalAttempts + 1,
            },
          },
          subJobStats: {
            ...prev.subJobStats,
            [subJobKey(categoryId, subJobId)]: {
              ...sjStats,
              totalAttempts: sjStats.totalAttempts + 1,
              chain: 0,
            },
          },
        }));
      }

      return {
        outcome,
        goldEarned,
        xpEarned,
        itemsDropped,
        consequence,
        consequenceMinutes,
        flavorText,
        categoryNewLevel,
        categoryLeveledUp,
        chainCount: newChain,
      };
    },
    [
      player,
      isHospitalized,
      isJailed,
      getCategoryProgress,
      getSubJobStats,
      hospitalizeFor,
      jailFor,
      spendStamina,
      addItem,
      addGold,
    ],
  );

  const value = useMemo<JobsContextValue>(
    () => ({
      attemptJob,
      getCategoryProgress,
      getSubJobStats,
      getCooldownRemaining,
      isOnCooldown,
      now,
    }),
    [attemptJob, getCategoryProgress, getSubJobStats, getCooldownRemaining, isOnCooldown, now],
  );

  return <JobsContext.Provider value={value}>{children}</JobsContext.Provider>;
}

export function useJobs(): JobsContextValue {
  const ctx = useContext(JobsContext);
  if (!ctx) throw new Error("useJobs must be used within a JobsProvider");
  return ctx;
}

export function formatCooldown(_ms: number): string {
  return "Ready";
}

export function computeSuccessRate(
  baseFailChance: number,
  baseCritFailChance: number,
  level: number,
): number {
  const fc = Math.max(MIN_FAIL_CHANCE, baseFailChance * (1 - level / FAIL_DECAY_DIVISOR));
  const cc =
    level < TRAINING_WHEELS_LEVEL
      ? baseCritFailChance * TRAINING_WHEELS_CRIT_FACTOR
      : Math.max(MIN_CRIT_CHANCE, baseCritFailChance * (1 - level / CRIT_DECAY_DIVISOR));
  return Math.round(Math.max(0, 1 - fc - cc) * 100);
}
