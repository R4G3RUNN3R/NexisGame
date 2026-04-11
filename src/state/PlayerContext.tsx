// ─────────────────────────────────────────────────────────────────────────────
// Nexis — PlayerContext
// Tracks all player state: stats, condition (hospital/jail), education,
// registration, and the sidebar stat model.
// ─────────────────────────────────────────────────────────────────────────────

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { useAuth, playerStorageKey } from "./AuthContext";

type Condition =
  | { type: "normal";       until: null;   reason: null }
  | { type: "hospitalized"; until: number; reason: string }
  | { type: "jailed";       until: number; reason: string };

type CurrentEducation = {
  id: string;
  name: string;
  startedAt: number;
  durationMs: number;
} | null;

type PlayerState = {
  id: string;
  name: string;
  lastName: string;
  title: string;
  level: number;
  rank: string;
  daysPlayed: number;
  gold: number;
  isRegistered: boolean;
  inventory: Record<string, number>;  // itemId → qty
  stats: {
    energy: number;
    maxEnergy: number;
    health: number;
    maxHealth: number;
    stamina: number;
    maxStamina: number;
    comfort: number;
    maxComfort: number;
    nerve: number;         // used for risky actions
    maxNerve: number;
    chain: number;         // ← active chain count (resets on fail)
    maxChain: number;      // ← chain target (e.g. 10)
  };
  workingStats: {
    manualLabor: number;
    intelligence: number;
    endurance: number;
  };
  battleStats: {
    strength: number;
    defense: number;
    speed: number;
    dexterity: number;
  };
  property: {
    current: string;          // propertyTier id (e.g. "shack", "cottage")
    comfortProvided: number;
    installedUpgrades: string[];  // upgrade ids installed on current property
  };
  current: {
    education: CurrentEducation;
    job: string | null;
    travel: string | null;
  };
  condition: Condition;
};

type PlayerContextValue = {
  player: PlayerState;
  now: number;

  // Registration / Auth
  isRegistered: boolean;
  registerPlayer: (firstName: string, lastName: string) => void;
  resetPlayer: () => void;       // wipe to blank state (logout)

  // Hospital
  isHospitalized: boolean;
  hospitalRemainingMs: number;
  hospitalRemainingLabel: string;
  hospitalizeFor: (minutes: number, reason?: string) => void;
  recoverFromHospital: () => void;

  // Jail
  isJailed: boolean;
  jailRemainingMs: number;
  jailRemainingLabel: string;
  jailFor: (minutes: number, reason?: string) => void;
  releaseFromJail: () => void;

  // Stats
  setHealth: (value: number, reason?: string) => void;
  spendEnergy: (amount: number) => void;
  spendStamina: (amount: number) => void;
  spendNerve: (amount: number) => void;

  // Gold & property
  addGold: (amount: number) => void;
  spendGold: (amount: number) => boolean;   // returns false if insufficient
  purchaseProperty: (tierId: string, cost: number) => boolean;
  installUpgrade: (upgradeId: string, cost: number) => boolean;

  // Inventory
  addItem: (itemId: string, qty: number) => void;

  // Battle stats (from Arena training)
  addBattleStat: (stat: "strength" | "defense" | "speed" | "dexterity", amount: number) => void;

  // Education
  startEducation: (id: string, name: string, durationMs: number) => void;
  quitEducation: () => void;

  // Levelling
  addLevel: (amount?: number) => void;   // increments player level; maxStamina auto-recalculates
};

// ─── Stamina scaling ─────────────────────────────────────────────────────────
// maxStamina starts at 10 and gains +1 for every 5 levels earned.
// Level 0 = 10, Level 5 = 11, Level 10 = 12 ... Level 100 = 30.
export function maxStaminaForLevel(level: number): number {
  return 10 + Math.floor(level / 5);
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const LEGACY_STORAGE_KEY = "nexis_player";

const basePlayer: PlayerState = {
  id: "0001",
  name: "",
  lastName: "",
  title: "0",
  level: 0,
  rank: "0",
  daysPlayed: 0,
  gold: 500,
  isRegistered: false,
  inventory: {},
  stats: {
    energy: 100,
    maxEnergy: 100,
    health: 100,
    maxHealth: 100,
    stamina: 10,
    maxStamina: 10,
    comfort: 100,
    maxComfort: 100,
    nerve: 16,
    maxNerve: 84,
    chain: 0,
    maxChain: 10,
  },
  workingStats: { manualLabor: 0, intelligence: 0, endurance: 0 },
  battleStats: { strength: 0, defense: 0, speed: 0, dexterity: 0 },
  property: { current: "shack", comfortProvided: 100, installedUpgrades: [] },
  current: { education: null, job: null, travel: null },
  condition: { type: "normal", until: null, reason: null },
};

function mergePlayer(stored: Partial<PlayerState>): PlayerState {
  const level = stored.level ?? basePlayer.level;
  const mergedStats = { ...basePlayer.stats, ...(stored.stats ?? {}) };
  // Always recalculate maxStamina from level on load — never trust a stale stored value
  mergedStats.maxStamina = maxStaminaForLevel(level);
  mergedStats.stamina = Math.min(mergedStats.stamina, mergedStats.maxStamina);
  return {
    ...basePlayer,
    ...stored,
    level,
    stats: mergedStats,
    workingStats: { ...basePlayer.workingStats, ...(stored.workingStats ?? {}) },
    battleStats: { ...basePlayer.battleStats, ...(stored.battleStats ?? {}) },
    property: { ...basePlayer.property, ...(stored.property ?? {}) },
    current: { ...basePlayer.current, ...(stored.current ?? {}) },
    inventory: { ...basePlayer.inventory, ...(stored.inventory ?? {}) },
  };
}

function readStoredPlayer(storageKey: string): PlayerState {
  if (typeof window === "undefined") return basePlayer;
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return basePlayer;
    return mergePlayer(JSON.parse(raw) as Partial<PlayerState>);
  } catch {
    return basePlayer;
  }
}

function writeStoredPlayer(state: PlayerState, storageKey: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey, JSON.stringify(state));
}

// ─── Format helpers ────────────────────────────────────────────────────────────

function formatDuration(ms: number): string {
  if (ms <= 0) return "0m 0s";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

function formatClock(ms: number): string {
  if (ms <= 0) return "00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export { formatClock };

// ─── Provider ─────────────────────────────────────────────────────────────────

const PlayerContext = createContext<PlayerContextValue | null>(null);

// Tick intervals (ms)
const ENERGY_INTERVAL_MS  = 5  * 60 * 1000;   // +1 every 5 min
const HEALTH_INTERVAL_MS  = 3  * 60 * 1000;   // +1 every 3 min
const STAMINA_INTERVAL_MS = 15 * 60 * 1000;   // +1 every 15 min
const COMFORT_INTERVAL_MS = 10 * 60 * 1000;   // +1 every 10 min

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const { activeAccount, isLoggedIn } = useAuth();

  // Derive the storage key from the active account
  const storageKey = activeAccount
    ? playerStorageKey(activeAccount.email)
    : LEGACY_STORAGE_KEY;

  const [player, setPlayer] = useState<PlayerState>(() => readStoredPlayer(storageKey));
  const [now, setNow] = useState<number>(() => Date.now());

  // When the active account changes (login/logout/switch), reload player data
  useEffect(() => {
    const loaded = readStoredPlayer(storageKey);
    // If logging in via AuthContext and player has no name yet, seed from account
    if (activeAccount && !loaded.isRegistered && !loaded.name) {
      const seeded: PlayerState = {
        ...basePlayer,
        name: activeAccount.firstName,
        lastName: activeAccount.lastName,
        isRegistered: true,
      };
      setPlayer(seeded);
      writeStoredPlayer(seeded, storageKey);
    } else {
      setPlayer(loaded);
    }
  }, [storageKey, activeAccount]);

  // 1-second tick: regen + auto-clear hospital/jail
  useEffect(() => {
    let lastTick = Date.now();

    const timer = window.setInterval(() => {
      const tickNow = Date.now();
      const elapsed = tickNow - lastTick;
      lastTick = tickNow;

      setNow(tickNow);

      setPlayer((prev) => {
        let next = prev;

        // Fractional regen based on elapsed time
        const energyRegen  = elapsed / ENERGY_INTERVAL_MS;
        const healthRegen  = elapsed / HEALTH_INTERVAL_MS;
        const staminaRegen = elapsed / STAMINA_INTERVAL_MS;
        const comfortRegen = elapsed / COMFORT_INTERVAL_MS;

        const newEnergy  = Math.min(prev.stats.maxEnergy,  prev.stats.energy  + energyRegen);
        const newHealth  = Math.min(prev.stats.maxHealth,  prev.stats.health  + healthRegen);
        const newStamina = Math.min(prev.stats.maxStamina, prev.stats.stamina + staminaRegen);
        const newComfort = Math.min(prev.stats.maxComfort, prev.stats.comfort + comfortRegen);

        next = {
          ...next,
          stats: {
            ...next.stats,
            energy:  parseFloat(newEnergy.toFixed(4)),
            health:  parseFloat(newHealth.toFixed(4)),
            stamina: parseFloat(newStamina.toFixed(4)),
            comfort: parseFloat(newComfort.toFixed(4)),
          },
        };

        // Auto-clear hospitalized
        if (prev.condition.type === "hospitalized" && prev.condition.until <= tickNow) {
          next = {
            ...next,
            stats: { ...next.stats, health: next.stats.maxHealth },
            condition: { type: "normal", until: null, reason: null },
          };
        }

        // Auto-clear jailed
        if (prev.condition.type === "jailed" && prev.condition.until <= tickNow) {
          next = {
            ...next,
            condition: { type: "normal", until: null, reason: null },
          };
        }

        return next;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  // Recompute maxStamina whenever player level changes
  useEffect(() => {
    const correctMax = maxStaminaForLevel(player.level);
    if (player.stats.maxStamina !== correctMax) {
      setPlayer((prev) => ({
        ...prev,
        stats: {
          ...prev.stats,
          maxStamina: correctMax,
          // clamp current stamina if it exceeds the new max
          stamina: Math.min(prev.stats.stamina, correctMax),
        },
      }));
    }
  }, [player.level, player.stats.maxStamina]);

  // Persist on every change
  useEffect(() => {
    writeStoredPlayer(player, storageKey);
  }, [player, storageKey]);

  const isHospitalized = player.condition.type === "hospitalized";
  const isJailed = player.condition.type === "jailed";

  const hospitalRemainingMs = isHospitalized
    ? Math.max(0, (player.condition as { until: number }).until - now)
    : 0;

  const jailRemainingMs = isJailed
    ? Math.max(0, (player.condition as { until: number }).until - now)
    : 0;

  const value = useMemo<PlayerContextValue>(() => {
    // ── Registration ─────────────────────────────────────────────────────────
    function registerPlayer(firstName: string, lastName: string) {
      setPlayer((prev) => ({
        ...prev,
        name: firstName.trim(),
        lastName: lastName.trim(),
        isRegistered: true,
      }));
    }

    // ── Hospital ──────────────────────────────────────────────────────────────
    function hospitalizeFor(minutes: number, reason = "Combat defeat") {
      const until = Date.now() + minutes * 60 * 1000;
      setPlayer((prev) => ({
        ...prev,
        stats: { ...prev.stats, health: 0 },
        condition: { type: "hospitalized", until, reason },
        current: { ...prev.current, job: null, travel: null },
      }));
    }

    function recoverFromHospital() {
      setPlayer((prev) => ({
        ...prev,
        stats: { ...prev.stats, health: prev.stats.maxHealth },
        condition: { type: "normal", until: null, reason: null },
      }));
    }

    // ── Jail ──────────────────────────────────────────────────────────────────
    function jailFor(minutes: number, reason = "Arrested") {
      const until = Date.now() + minutes * 60 * 1000;
      setPlayer((prev) => ({
        ...prev,
        condition: { type: "jailed", until, reason },
        current: { ...prev.current, job: null, travel: null },
      }));
    }

    function releaseFromJail() {
      setPlayer((prev) => ({
        ...prev,
        condition: { type: "normal", until: null, reason: null },
      }));
    }

    // ── Stats ─────────────────────────────────────────────────────────────────
    function setHealth(value: number, reason = "Combat defeat") {
      setPlayer((prev) => {
        const nextHealth = Math.max(0, Math.min(prev.stats.maxHealth, value));
        if (nextHealth <= 0) {
          const until = Date.now() + 15 * 60 * 1000;
          return {
            ...prev,
            stats: { ...prev.stats, health: 0 },
            condition: { type: "hospitalized", until, reason },
            current: { ...prev.current, job: null, travel: null },
          };
        }
        return { ...prev, stats: { ...prev.stats, health: nextHealth } };
      });
    }

    function spendEnergy(amount: number) {
      setPlayer((prev) => ({
        ...prev,
        stats: { ...prev.stats, energy: Math.max(0, prev.stats.energy - amount) },
      }));
    }

    function spendStamina(amount: number) {
      setPlayer((prev) => ({
        ...prev,
        stats: { ...prev.stats, stamina: Math.max(0, prev.stats.stamina - amount) },
      }));
    }

    function spendNerve(amount: number) {
      setPlayer((prev) => ({
        ...prev,
        stats: { ...prev.stats, nerve: Math.max(0, prev.stats.nerve - amount) },
      }));
    }

    function addGold(amount: number) {
      setPlayer((prev) => ({ ...prev, gold: prev.gold + amount }));
    }

    function spendGold(amount: number): boolean {
      let success = false;
      setPlayer((prev) => {
        if (prev.gold < amount) return prev;
        success = true;
        return { ...prev, gold: prev.gold - amount };
      });
      return success;
    }

    function purchaseProperty(tierId: string, cost: number): boolean {
      let success = false;
      setPlayer((prev) => {
        if (prev.gold < cost) return prev;
        success = true;
        return {
          ...prev,
          gold: prev.gold - cost,
          property: { current: tierId, comfortProvided: 100, installedUpgrades: [] },
        };
      });
      return success;
    }

    function addItem(itemId: string, qty: number) {
      setPlayer((prev) => ({
        ...prev,
        inventory: {
          ...prev.inventory,
          [itemId]: (prev.inventory[itemId] ?? 0) + qty,
        },
      }));
    }

    function addBattleStat(
      stat: "strength" | "defense" | "speed" | "dexterity",
      amount: number,
    ) {
      setPlayer((prev) => ({
        ...prev,
        battleStats: {
          ...prev.battleStats,
          [stat]: parseFloat((prev.battleStats[stat] + amount).toFixed(2)),
        },
      }));
    }

    function installUpgrade(upgradeId: string, cost: number): boolean {
      let success = false;
      setPlayer((prev) => {
        if (prev.gold < cost) return prev;
        if (prev.property.installedUpgrades.includes(upgradeId)) return prev;
        success = true;
        return {
          ...prev,
          gold: prev.gold - cost,
          property: {
            ...prev.property,
            installedUpgrades: [...prev.property.installedUpgrades, upgradeId],
          },
        };
      });
      return success;
    }

    // ── Levelling ─────────────────────────────────────────────────────────────
    function addLevel(amount = 1) {
      setPlayer((prev) => {
        const newLevel = prev.level + amount;
        const newMaxStamina = maxStaminaForLevel(newLevel);
        return {
          ...prev,
          level: newLevel,
          stats: {
            ...prev.stats,
            maxStamina: newMaxStamina,
            // Don't reduce current stamina on level-up — only cap at new max
            stamina: Math.min(prev.stats.stamina, newMaxStamina),
          },
        };
      });
    }

    // ── Education ─────────────────────────────────────────────────────────────
    function startEducation(id: string, name: string, durationMs: number) {
      setPlayer((prev) => ({
        ...prev,
        current: {
          ...prev.current,
          education: { id, name, startedAt: Date.now(), durationMs },
        },
      }));
    }

    function quitEducation() {
      setPlayer((prev) => ({
        ...prev,
        current: { ...prev.current, education: null },
      }));
    }

    return {
      player,
      now,

      isRegistered: player.isRegistered,
      registerPlayer,

      isHospitalized,
      hospitalRemainingMs,
      hospitalRemainingLabel: formatDuration(hospitalRemainingMs),
      hospitalizeFor,
      recoverFromHospital,

      isJailed,
      jailRemainingMs,
      jailRemainingLabel: formatDuration(jailRemainingMs),
      jailFor,
      releaseFromJail,

      setHealth,
      spendEnergy,
      spendStamina,
      spendNerve,
      addGold,
      spendGold,
      purchaseProperty,
      installUpgrade,
      addItem,
      addBattleStat,

      resetPlayer() {
        setPlayer(basePlayer);
      },

      addLevel,
      startEducation,
      quitEducation,
    };
  }, [player, now, isHospitalized, isJailed, hospitalRemainingMs, jailRemainingMs]);

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) throw new Error("usePlayer must be used within a PlayerProvider");
  return context;
}
