// ─────────────────────────────────────────────────────────────────────────────
// Nexis — Register / Login Page
// Two modes: "Create Account" and "Log In".
// Registration: first name, last name, email, password.
// Login: email + password.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import "../styles/register.css";

const NAME_MIN = 2;
const NAME_MAX = 20;
const NAME_PATTERN = /^[a-zA-Z\- ']+$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN = 6;

function validateName(name: string, fieldLabel: string): string | null {
  const trimmed = name.trim();
  if (trimmed.length < NAME_MIN) return `${fieldLabel} must be at least ${NAME_MIN} characters.`;
  if (trimmed.length > NAME_MAX) return `${fieldLabel} must be ${NAME_MAX} characters or fewer.`;
  if (!NAME_PATTERN.test(trimmed)) return `${fieldLabel} may only contain letters, hyphens, and apostrophes.`;
  return null;
}

function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) return "Email is required.";
  if (!EMAIL_PATTERN.test(trimmed)) return "Enter a valid email address.";
  return null;
}

function validatePassword(password: string): string | null {
  if (password.length < PASSWORD_MIN) return `Password must be at least ${PASSWORD_MIN} characters.`;
  return null;
}

// ─── Register Form ────────────────────────────────────────────────────────────

function RegisterForm({ onSwitch }: { onSwitch: () => void }) {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const touch = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const firstErr = touched.first ? validateName(firstName, "First name") : null;
  const lastErr = touched.last ? validateName(lastName, "Last name") : null;
  const emailErr = touched.email ? validateEmail(email) : null;
  const passErr = touched.password ? validatePassword(password) : null;
  const confirmErr =
    touched.confirm && password !== confirmPassword
      ? "Passwords do not match."
      : null;

  const isValid =
    validateName(firstName, "f") === null &&
    validateName(lastName, "l") === null &&
    validateEmail(email) === null &&
    validatePassword(password) === null &&
    password === confirmPassword;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ first: true, last: true, email: true, password: true, confirm: true });
    setServerError(null);
    if (!isValid) return;

    const result = register({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      password,
    });

    if (!result.ok) {
      setServerError(result.error ?? "Registration failed.");
      return;
    }

    navigate("/", { replace: true });
  }

  return (
    <>
      <h1 className="register-heading">Create Your Account</h1>
      <p className="register-subtext">
        Your identity is earned — not chosen. Enter your details and step into the world.
      </p>

      {serverError && (
        <div className="register-server-error" role="alert">{serverError}</div>
      )}

      <form className="register-form" onSubmit={handleSubmit} noValidate>
        <div className="register-row">
          <div className="register-field">
            <label className="register-label" htmlFor="first-name">First Name</label>
            <input
              id="first-name"
              type="text"
              className={`register-input${firstErr ? " register-input--error" : ""}`}
              placeholder="e.g. Gareth"
              value={firstName}
              maxLength={NAME_MAX + 4}
              onChange={(e) => { setFirstName(e.target.value); if (!touched.first) touch("first"); }}
              onBlur={() => touch("first")}
              autoComplete="given-name"
              autoFocus
            />
            {firstErr && <p className="register-error" role="alert">{firstErr}</p>}
          </div>

          <div className="register-field">
            <label className="register-label" htmlFor="last-name">Last Name</label>
            <input
              id="last-name"
              type="text"
              className={`register-input${lastErr ? " register-input--error" : ""}`}
              placeholder="e.g. Ashveil"
              value={lastName}
              maxLength={NAME_MAX + 4}
              onChange={(e) => { setLastName(e.target.value); if (!touched.last) touch("last"); }}
              onBlur={() => touch("last")}
              autoComplete="family-name"
            />
            {lastErr && <p className="register-error" role="alert">{lastErr}</p>}
          </div>
        </div>

        <div className="register-field">
          <label className="register-label" htmlFor="reg-email">Email</label>
          <input
            id="reg-email"
            type="email"
            className={`register-input${emailErr ? " register-input--error" : ""}`}
            placeholder="you@example.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (!touched.email) touch("email"); }}
            onBlur={() => touch("email")}
            autoComplete="email"
          />
          {emailErr && <p className="register-error" role="alert">{emailErr}</p>}
        </div>

        <div className="register-field">
          <label className="register-label" htmlFor="reg-password">Password</label>
          <input
            id="reg-password"
            type="password"
            className={`register-input${passErr ? " register-input--error" : ""}`}
            placeholder="Min. 6 characters"
            value={password}
            onChange={(e) => { setPassword(e.target.value); if (!touched.password) touch("password"); }}
            onBlur={() => touch("password")}
            autoComplete="new-password"
          />
          {passErr && <p className="register-error" role="alert">{passErr}</p>}
        </div>

        <div className="register-field">
          <label className="register-label" htmlFor="reg-confirm">Confirm Password</label>
          <input
            id="reg-confirm"
            type="password"
            className={`register-input${confirmErr ? " register-input--error" : ""}`}
            placeholder="Repeat password"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); if (!touched.confirm) touch("confirm"); }}
            onBlur={() => touch("confirm")}
            autoComplete="new-password"
          />
          {confirmErr && <p className="register-error" role="alert">{confirmErr}</p>}
        </div>

        <div className="register-note">
          No class selection. No portrait picking. What you become in Nexis is shaped
          by the choices you make and the skills you earn.
        </div>

        <button type="submit" className="register-submit" disabled={!isValid && Object.keys(touched).length > 0}>
          Create Account
        </button>
      </form>

      <div className="register-switch">
        Already have an account?{" "}
        <button type="button" className="register-switch__btn" onClick={onSwitch}>
          Log In
        </button>
      </div>

      <div className="register-footer">Nexis &mdash; Shard: Cay</div>
    </>
  );
}

// ─── Login Form ────────────────────────────────────────────────────────────────

function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const emailErr = touched.email ? validateEmail(email) : null;
  const passErr = touched.password && !password ? "Password is required." : null;

  const isValid = validateEmail(email) === null && password.length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ email: true, password: true });
    setServerError(null);
    if (!isValid) return;

    const result = login(email.trim(), password);

    if (!result.ok) {
      setServerError(result.error ?? "Login failed.");
      return;
    }

    navigate("/", { replace: true });
  }

  return (
    <>
      <h1 className="register-heading">Welcome Back</h1>
      <p className="register-subtext">
        Log in to continue your journey through Nexis.
      </p>

      {serverError && (
        <div className="register-server-error" role="alert">{serverError}</div>
      )}

      <form className="register-form" onSubmit={handleSubmit} noValidate>
        <div className="register-field">
          <label className="register-label" htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            className={`register-input${emailErr ? " register-input--error" : ""}`}
            placeholder="you@example.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (!touched.email) setTouched(p => ({ ...p, email: true })); }}
            onBlur={() => setTouched(p => ({ ...p, email: true }))}
            autoComplete="email"
            autoFocus
          />
          {emailErr && <p className="register-error" role="alert">{emailErr}</p>}
        </div>

        <div className="register-field">
          <label className="register-label" htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            className={`register-input${passErr ? " register-input--error" : ""}`}
            placeholder="Your password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); if (!touched.password) setTouched(p => ({ ...p, password: true })); }}
            onBlur={() => setTouched(p => ({ ...p, password: true }))}
            autoComplete="current-password"
          />
          {passErr && <p className="register-error" role="alert">{passErr}</p>}
        </div>

        <button type="submit" className="register-submit" disabled={!isValid && Object.keys(touched).length > 0}>
          Log In
        </button>
      </form>

      <div className="register-switch">
        Don't have an account?{" "}
        <button type="button" className="register-switch__btn" onClick={onSwitch}>
          Create Account
        </button>
      </div>

      <div className="register-footer">Nexis &mdash; Shard: Cay</div>
    </>
  );
}

// ─── Page Wrapper ──────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const [mode, setMode] = useState<"register" | "login">("register");

  return (
    <div className="register-page">
      <div className="register-hero">
        <img
          src="/images/register/register_hero.png"
          alt="Nexis — Online Realm of Adventure"
          className="register-hero__img"
          draggable={false}
        />
        <div className="register-hero__overlay" />
        <div className="register-hero__title">
          <span className="register-hero__nexis">NEXIS</span>
          <span className="register-hero__sub">Online Realm of Adventure</span>
        </div>
      </div>

      <div className="register-panel" role="main">
        <div className="register-panel__inner">
          {mode === "register" ? (
            <RegisterForm onSwitch={() => setMode("login")} />
          ) : (
            <LoginForm onSwitch={() => setMode("register")} />
          )}
        </div>
      </div>
    </div>
  );
}
