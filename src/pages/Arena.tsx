// ─────────────────────────────────────────────────────────────────────────────
// Nexis — Arena Page
// 4 progressive training tiers. Train battle stats, spend energy.
// Must fully complete each tier to unlock the next.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { AppShell } from "../components/layout/AppShell";
import { usePlayer } from "../state/PlayerContext";
import { useArena, type TrainResult } from "../state/ArenaContext";
import { arenaTiers, type ArenaTier, type BattleStat } from "../data/arenaData";
import "../styles/arena.css";

// ─── Stat labels ─────────────────────────────────────────────────────────────

const STAT_LABELS: Record<BattleStat, string> = {
  strength: "Strength",
  defense: "Defense",
  speed: "Speed",
  dexterity: "Dexterity",
};

const STAT_ORDER: BattleStat[] = ["strength", "defense", "speed", "dexterity"];

// ─── Outcome Toast ───────────────────────────────────────────────────────────

function OutcomeToast({
  result,
  onDismiss,
}: {
  result: TrainResult;
  onDismiss: () => void;
}) {
  return (
    <div className="arena-toast">
      <div className="arena-toast__body">
        <span className="arena-toast__stat">{STAT_LABELS[result.stat]}</span>
        <span className="arena-toast__gained">
          +{result.gained}
          {result.isSpecialty && (
            <span className="arena-toast__specialty"> ★ specialty</span>
          )}
        </span>
      </div>
      {result.tierComplete && !result.nextTierUnlocked && (
        <div className="arena-toast__complete">Tier maxed — all arenas complete for now.</div>
      )}
      {result.nextTierUnlocked && result.nextTierName && (
        <div className="arena-toast__unlock">
          ↑ {result.nextTierName} unlocked!
        </div>
      )}
      <button
        type="button"
        className="arena-toast__dismiss"
        onClick={onDismiss}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}

// ─── Tier Card ────────────────────────────────────────────────────────────────

function TierCard({
  tier,
  isActive,
  isLocked,
  isMaxed,
  onClick,
}: {
  tier: ArenaTier;
  isActive: boolean;
  isLocked: boolean;
  isMaxed: boolean;
  onClick: () => void;
}) {
  const { getTierProgress } = useArena();
  const prog = getTierProgress(tier.id);

  return (
    <button
      type="button"
      className={[
        "arena-tier-card",
        isActive ? "arena-tier-card--active" : "",
        isLocked ? "arena-tier-card--locked" : "",
        isMaxed ? "arena-tier-card--maxed" : "",
      ].filter(Boolean).join(" ")}
      onClick={onClick}
      disabled={isLocked}
    >
      <div className="arena-tier-card__header">
        <span className="arena-tier-card__subtitle">{tier.subtitle}</span>
        {isMaxed && <span className="arena-tier-card__badge arena-tier-card__badge--maxed">MAXED</span>}
        {isLocked && <span className="arena-tier-card__badge arena-tier-card__badge--locked">LOCKED</span>}
      </div>
      <div className="arena-tier-card__name">{tier.name}</div>
      <div className="arena-tier-card__desc">{tier.description}</div>
      <div className="arena-tier-card__progress-track">
        <div
          className="arena-tier-card__progress-fill"
          style={{ width: `${prog.pct}%` }}
        />
      </div>
      <div className="arena-tier-card__meta">
        {prog.sessions.toLocaleString()} / {tier.totalToMax.toLocaleString()} sessions · {tier.energyCost} energy each
      </div>
    </button>
  );
}

// ─── Training Panel ──────────────────────────────────────────────────────────

function TrainingPanel({ tier }: { tier: ArenaTier }) {
  const { player, isHospitalized, isJailed } = usePlayer();
  const { train, getTierProgress, isTierUnlocked } = useArena();

  const [lastResult, setLastResult] = useState<TrainResult | null>(null);

  const prog = getTierProgress(tier.id);
  const unlocked = isTierUnlocked(tier.id);
  const energy = Math.floor(player.stats.energy);
  const canTrain = unlocked && !prog.maxed && !isHospitalized && !isJailed && energy >= tier.energyCost;

  function handleTrain(stat: BattleStat) {
    const result = train(tier.id, stat);
    if (!result) return;
    setLastResult(result);
    // Auto-dismiss after 4s
    setTimeout(() => setLastResult(null), 4000);
  }

  return (
    <div className="arena-panel">
      {/* Header */}
      <div className="arena-panel__head">
        <div>
          <div className="arena-panel__subtitle">{tier.subtitle}</div>
          <h2 className="arena-panel__title">{tier.name}</h2>
          <p className="arena-panel__desc">{tier.flavour}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="arena-panel__progress">
        <div className="arena-panel__progress-labels">
          <span>Progress</span>
          <span>
            {prog.sessions.toLocaleString()} / {tier.totalToMax.toLocaleString()}
            {prog.maxed && " — Maxed"}
          </span>
        </div>
        <div className="arena-panel__progress-track">
          <div
            className="arena-panel__progress-fill"
            style={{ width: `${prog.pct}%` }}
          />
        </div>
      </div>

      {/* Specialty info */}
      <div className="arena-panel__specialties">
        <span className="arena-panel__spec-label">Specialty bonus</span>
        {tier.specialtyStats.map((s) => (
          <span key={s} className="arena-panel__spec-chip">
            {STAT_LABELS[s]} ×{tier.bonusMultiplier}
          </span>
        ))}
      </div>

      {/* Status blocks */}
      {isHospitalized && (
        <div className="arena-status-banner">You are hospitalized — training suspended.</div>
      )}
      {isJailed && (
        <div className="arena-status-banner">You are in custody — training suspended.</div>
      )}
      {!unlocked && (
        <div className="arena-status-banner arena-status-banner--locked">
          Complete the previous tier to unlock this arena.
        </div>
      )}
      {prog.maxed && (
        <div className="arena-status-banner arena-status-banner--maxed">
          This tier is fully trained. More arenas will be available as the game expands.
        </div>
      )}

      {/* Energy display */}
      {!prog.maxed && unlocked && (
        <div className="arena-energy-row">
          <span className="arena-energy-label">Energy</span>
          <span className={`arena-energy-val${energy < tier.energyCost ? " arena-energy-val--low" : ""}`}>
            {energy} / {player.stats.maxEnergy}
          </span>
          <span className="arena-energy-cost">({tier.energyCost} per session)</span>
        </div>
      )}

      {/* Outcome toast */}
      {lastResult && (
        <OutcomeToast result={lastResult} onDismiss={() => setLastResult(null)} />
      )}

      {/* Train buttons */}
      {!prog.maxed && unlocked && (
        <div className="arena-train-grid">
          {STAT_ORDER.map((stat) => {
            const isSpecialty = tier.specialtyStats.includes(stat);
            const gainPreview = (tier.baseGainPerSession * (isSpecialty ? tier.bonusMultiplier : 1)).toFixed(2);
            return (
              <button
                key={stat}
                type="button"
                className={[
                  "arena-train-btn",
                  isSpecialty ? "arena-train-btn--specialty" : "",
                  !canTrain ? "arena-train-btn--disabled" : "",
                ].filter(Boolean).join(" ")}
                disabled={!canTrain}
                onClick={() => handleTrain(stat)}
              >
                <span className="arena-train-btn__stat">{STAT_LABELS[stat]}</span>
                <span className="arena-train-btn__gain">+{gainPreview}</span>
                {isSpecialty && (
                  <span className="arena-train-btn__spec">★ specialty</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Current battle stats */}
      <div className="arena-current-stats">
        <div className="arena-current-stats__title">Your Battle Stats</div>
        <div className="arena-current-stats__grid">
          {STAT_ORDER.map((stat) => (
            <div key={stat} className="arena-stat-cell">
              <span className="arena-stat-cell__label">{STAT_LABELS[stat]}</span>
              <strong className="arena-stat-cell__val">
                {player.battleStats[stat].toFixed(2)}
              </strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Arena Page ───────────────────────────────────────────────────────────────

export default function ArenaPage() {
  const { isTierUnlocked, getTierProgress } = useArena();
  const [activeTierId, setActiveTierId] = useState(arenaTiers[0].id);

  const activeTier = arenaTiers.find((t) => t.id === activeTierId) ?? arenaTiers[0];

  return (
    <AppShell title="Arena">
      <div className="arena-page">
        <p className="arena-intro">
          Train your battle stats through four progressive tiers. Complete each tier fully to unlock the next.
          All four stats can be trained anywhere — but each arena specialises in certain attributes, granting a bonus multiplier.
        </p>

        <div className="arena-layout">
          {/* ── Tier list ── */}
          <div className="arena-tiers">
            {arenaTiers.map((tier) => {
              const prog = getTierProgress(tier.id);
              const locked = !isTierUnlocked(tier.id);
              return (
                <TierCard
                  key={tier.id}
                  tier={tier}
                  isActive={tier.id === activeTierId}
                  isLocked={locked}
                  isMaxed={prog.maxed}
                  onClick={() => setActiveTierId(tier.id)}
                />
              );
            })}
          </div>

          {/* ── Training panel ── */}
          <TrainingPanel tier={activeTier} />
        </div>
      </div>
    </AppShell>
  );
}
