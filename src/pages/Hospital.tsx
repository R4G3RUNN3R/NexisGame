// ─────────────────────────────────────────────────────────────────────────────
// Nexis — Hospital Page
// Full condition system: status display, countdown timer, restrictions list,
// revive mechanic, jail section, and dev prototype controls.
// ─────────────────────────────────────────────────────────────────────────────

import { useLocation } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { ContentPanel } from "../components/layout/ContentPanel";
import { usePlayer } from "../state/PlayerContext";
import "../styles/hospital.css";
import "../styles/hosp-full.css";

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="info-row">
      <span className="info-row__label">{label}</span>
      <span className="info-row__value">{value}</span>
    </div>
  );
}

// ─── Blocked pages while hospitalized ────────────────────────────────────────
const BLOCKED_PAGES = ["Jobs", "Travel", "City", "Market", "Bank", "Academies", "Life Paths", "City Board (active events)"];
const ALLOWED_PAGES = ["Hospital", "Profile", "Housing", "Guilds / Consortiums", "Achievements"];

// ─── Blocked pages while jailed ──────────────────────────────────────────────
const JAIL_BLOCKED   = ["Jobs", "Travel", "City", "Market", "Bank", "Hospital", "Academies"];
const JAIL_ALLOWED   = ["Jail (this page)", "Profile", "Housing", "Guilds / Consortiums", "Achievements"];

export default function HospitalPage() {
  const location = useLocation() as { state?: { redirectedFrom?: string } };
  const {
    player,
    now,
    isHospitalized,
    isJailed,
    hospitalRemainingMs,
    hospitalRemainingLabel,
    jailRemainingMs,
    jailRemainingLabel,
    hospitalizeFor,
    recoverFromHospital,
    releaseFromJail,
    setHealth,
    jailFor,
    startEducation,
    quitEducation,
  } = usePlayer();

  const healthPct = player.stats.maxHealth > 0
    ? Math.round((Math.floor(player.stats.health) / player.stats.maxHealth) * 100)
    : 0;

  const hospitalTimerPct = isHospitalized && player.condition.type === "hospitalized"
    ? Math.min(100, 100 - (hospitalRemainingMs / ((player.condition.until - (player.condition.until - hospitalRemainingMs))) * 100))
    : 100;

  // Determine the display condition
  const activeCondition = isHospitalized ? "hospitalized" : isJailed ? "jailed" : "normal";

  return (
    <AppShell
      title="Hospital"
      hint="Active condition system. Recovery is tracked in real time."
    >
      <div className="nexis-grid">

        {/* ── Column 1: Current Condition ─────────────────────────────────── */}
        <div className="nexis-column">
          <ContentPanel title="Your Condition">
            <div className="hosp-status-block">
              <div
                className={`hosp-status-badge hosp-status-badge--${activeCondition}`}
              >
                {activeCondition === "hospitalized" && "Hospitalized"}
                {activeCondition === "jailed" && "Jailed"}
                {activeCondition === "normal" && "Normal"}
              </div>

              {activeCondition !== "normal" && (
                <div className="hosp-timer">
                  <div className="hosp-timer__label">Time remaining</div>
                  <div className="hosp-timer__value">
                    {activeCondition === "hospitalized" ? hospitalRemainingLabel : jailRemainingLabel}
                  </div>
                  {activeCondition === "hospitalized" && (
                    <div className="hosp-timer__bar-track">
                      <div
                        className="hosp-timer__bar-fill"
                        style={{ width: `${100 - Math.round((hospitalRemainingMs / Math.max(1, hospitalRemainingMs)) * 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="info-list" style={{ marginTop: "12px" }}>
              <InfoRow label="Reason" value={player.condition.reason ?? "None"} />
              <InfoRow
                label="Health"
                value={
                  <span>
                    {Math.floor(player.stats.health)} / {player.stats.maxHealth}
                    <span className="hosp-health-pct"> ({healthPct}%)</span>
                  </span>
                }
              />
              <InfoRow label="Current Education" value={player.current.education?.name ?? "None"} />
            </div>

            {location.state?.redirectedFrom && (
              <div className="hospital-note hospital-note--redirect">
                Access to <strong>{location.state.redirectedFrom}</strong> is blocked
                while {activeCondition}.
              </div>
            )}
          </ContentPanel>

          {/* ── Recovery Actions ─────────────────────────────────────────── */}
          {isHospitalized && (
            <ContentPanel title="Recovery">
              <div className="hospital-note">
                You will be automatically discharged when the timer expires and your health will be restored to full.
                Emergency discharge is available if you cannot wait.
              </div>
              <div className="hospital-actions" style={{ marginTop: "10px" }}>
                <button
                  type="button"
                  className="hospital-btn"
                  onClick={recoverFromHospital}
                >
                  Emergency Discharge
                </button>
              </div>
            </ContentPanel>
          )}

          {isJailed && (
            <ContentPanel title="Incarceration">
              <div className="hospital-note">
                You are held in the city detention block. Most activity is suspended.
                Your sentence expires automatically. Early release is available.
              </div>
              <div className="hospital-actions" style={{ marginTop: "10px" }}>
                <button
                  type="button"
                  className="hospital-btn hospital-btn--danger"
                  onClick={releaseFromJail}
                >
                  Early Release (Dev Override)
                </button>
              </div>
            </ContentPanel>
          )}

          {activeCondition === "normal" && (
            <ContentPanel title="Status">
              <div className="hosp-clear">
                <div className="hosp-clear__icon">✓</div>
                <div className="hosp-clear__text">You are in good condition. No restrictions active.</div>
              </div>
            </ContentPanel>
          )}
        </div>

        {/* ── Column 2: Restrictions ──────────────────────────────────────── */}
        <div className="nexis-column">
          {activeCondition === "hospitalized" && (
            <>
              <ContentPanel title="While Hospitalized — Blocked">
                <ul className="hospital-list hospital-list--blocked">
                  {BLOCKED_PAGES.map((p) => (
                    <li key={p}>
                      <span className="hosp-list-icon">✗</span> {p}
                    </li>
                  ))}
                </ul>
              </ContentPanel>

              <ContentPanel title="While Hospitalized — Still Accessible">
                <ul className="hospital-list hospital-list--allowed">
                  {ALLOWED_PAGES.map((p) => (
                    <li key={p}>
                      <span className="hosp-list-icon hosp-list-icon--allow">✓</span> {p}
                    </li>
                  ))}
                  <li>
                    <span className="hosp-list-icon hosp-list-icon--allow">✓</span>
                    Education in progress <em>(continues uninterrupted)</em>
                  </li>
                </ul>
              </ContentPanel>
            </>
          )}

          {activeCondition === "jailed" && (
            <>
              <ContentPanel title="While Jailed — Blocked">
                <ul className="hospital-list hospital-list--blocked">
                  {JAIL_BLOCKED.map((p) => (
                    <li key={p}>
                      <span className="hosp-list-icon">✗</span> {p}
                    </li>
                  ))}
                </ul>
              </ContentPanel>

              <ContentPanel title="While Jailed — Still Accessible">
                <ul className="hospital-list hospital-list--allowed">
                  {JAIL_ALLOWED.map((p) => (
                    <li key={p}>
                      <span className="hosp-list-icon hosp-list-icon--allow">✓</span> {p}
                    </li>
                  ))}
                  <li>
                    <span className="hosp-list-icon hosp-list-icon--allow">✓</span>
                    Education in progress <em>(continues uninterrupted)</em>
                  </li>
                </ul>
              </ContentPanel>
            </>
          )}

          {activeCondition === "normal" && (
            <ContentPanel title="Restrictions">
              <div className="hospital-note">
                No active conditions. All pages accessible.
              </div>
              <ul className="hospital-list hospital-list--allowed">
                <li>
                  <span className="hosp-list-icon hosp-list-icon--allow">✓</span>
                  Full access to all systems
                </li>
              </ul>
            </ContentPanel>
          )}

          {/* ── Education continuity ─────────────────────────────────────── */}
          <ContentPanel title="Education">
            <div className="info-list">
              <InfoRow
                label="Active Course"
                value={player.current.education ? player.current.education.name : "None"}
              />
              <InfoRow
                label="Hospital Effect"
                value={player.current.education ? "No interruption" : "N/A"}
              />
            </div>

            <div className="hospital-actions" style={{ marginTop: "10px" }}>
              {!player.current.education ? (
                <button
                  type="button"
                  className="hospital-btn"
                  onClick={() => startEducation("gs-basic-literacy", "Basic Literacy", 24 * 60 * 60 * 1000)}
                >
                  Start Demo Course
                </button>
              ) : (
                <button
                  type="button"
                  className="hospital-btn hospital-btn--danger"
                  onClick={quitEducation}
                >
                  Quit Course (Resets Progress)
                </button>
              )}
            </div>
          </ContentPanel>
        </div>

        {/* ── Column 3: Dev Controls ──────────────────────────────────────── */}
        <div className="nexis-column">
          <ContentPanel title="Dev — Prototype Controls">
            <div className="hospital-note">
              These controls exist for testing before combat and missions are wired in.
            </div>
            <div className="hospital-actions" style={{ marginTop: "10px" }}>
              <button
                type="button"
                className="hospital-btn hospital-btn--danger"
                onClick={() => setHealth(0, "Combat defeat")}
              >
                Simulate Defeat → Hospital
              </button>
              <button
                type="button"
                className="hospital-btn"
                onClick={() => hospitalizeFor(15, "Test admission")}
              >
                Admit 15 Minutes
              </button>
              <button
                type="button"
                className="hospital-btn"
                onClick={() => hospitalizeFor(60, "Extended test")}
              >
                Admit 60 Minutes
              </button>
              <button
                type="button"
                className="hospital-btn hospital-btn--danger"
                onClick={() => jailFor(10, "Caught stealing")}
              >
                Jail for 10 Minutes
              </button>
              {(isHospitalized || isJailed) && (
                <button
                  type="button"
                  className="hospital-btn"
                  onClick={isHospitalized ? recoverFromHospital : releaseFromJail}
                >
                  Clear Condition
                </button>
              )}
            </div>
          </ContentPanel>
        </div>

      </div>
    </AppShell>
  );
}
