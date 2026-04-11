// ─────────────────────────────────────────────────────────────────────────────
// Nexis — AuthContext
// Handles login, register, logout, and active session tracking.
// All auth logic in ONE file — swap localStorage calls for API calls later.
// ─────────────────────────────────────────────────────────────────────────────

import React, { createContext, useCallback, useContext, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type NexisAccount = {
  email: string;
  password: string;          // plaintext for now — hash when backend is added
  firstName: string;
  lastName: string;
  createdAt: number;         // Date.now() at registration
};

type AuthState = {
  activeEmail: string | null;  // currently logged-in account email
};

type AuthContextValue = {
  /** Currently logged-in account, or null */
  activeAccount: NexisAccount | null;
  isLoggedIn: boolean;

  /**
   * Register a new account.
   * Returns { ok: true } or { ok: false, error: string }.
   * BACKEND SWAP: replace with POST /api/register
   */
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => { ok: boolean; error?: string };

  /**
   * Log in with email + password.
   * Returns { ok: true } or { ok: false, error: string }.
   * BACKEND SWAP: replace with POST /api/login
   */
  login: (email: string, password: string) => { ok: boolean; error?: string };

  /**
   * Log out current session.
   * BACKEND SWAP: replace with POST /api/logout
   */
  logout: () => void;
};

// ─── Storage keys ─────────────────────────────────────────────────────────────

const ACCOUNTS_KEY = "nexis_accounts";     // Record<email, NexisAccount>
const SESSION_KEY  = "nexis_auth_session"; // { activeEmail }
const PLAYER_KEY   = "nexis_player";       // per-account player data prefix

/** Get the localStorage key for a specific account's player data */
export function playerStorageKey(email: string): string {
  return `${PLAYER_KEY}__${email}`;
}

// ─── Storage helpers — BACKEND SWAP: replace these with fetch() ──────────────

function readAccounts(): Record<string, NexisAccount> {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function writeAccounts(accounts: Record<string, NexisAccount>): void {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function readSession(): AuthState {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : { activeEmail: null };
  } catch { return { activeEmail: null }; }
}

function writeSession(state: AuthState): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(state));
}

// ─── Provider ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthState>(readSession);
  const [accounts, setAccounts] = useState<Record<string, NexisAccount>>(readAccounts);

  const activeAccount = session.activeEmail ? accounts[session.activeEmail] ?? null : null;

  // ── Register ──────────────────────────────────────────────────────────────
  const register = useCallback((data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): { ok: boolean; error?: string } => {
    const email = data.email.trim().toLowerCase();

    // Check if account already exists
    const existing = readAccounts();
    if (existing[email]) {
      return { ok: false, error: "An account with this email already exists." };
    }

    const account: NexisAccount = {
      email,
      password: data.password,  // BACKEND SWAP: don't store plaintext
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      createdAt: Date.now(),
    };

    const updatedAccounts = { ...existing, [email]: account };
    writeAccounts(updatedAccounts);
    setAccounts(updatedAccounts);

    // Auto-login after registration
    const newSession: AuthState = { activeEmail: email };
    writeSession(newSession);
    setSession(newSession);

    return { ok: true };
  }, []);

  // ── Login ────────────────────────────────────────────────────────────────
  const login = useCallback((email: string, password: string): { ok: boolean; error?: string } => {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = readAccounts();
    const account = existing[normalizedEmail];

    if (!account) {
      return { ok: false, error: "No account found with that email." };
    }

    if (account.password !== password) {
      return { ok: false, error: "Incorrect password." };
    }

    const newSession: AuthState = { activeEmail: normalizedEmail };
    writeSession(newSession);
    setSession(newSession);

    return { ok: true };
  }, []);

  // ── Logout ───────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    const newSession: AuthState = { activeEmail: null };
    writeSession(newSession);
    setSession(newSession);
    // Don't delete player data — just clear the active session
  }, []);

  const value: AuthContextValue = {
    activeAccount,
    isLoggedIn: activeAccount !== null,
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
