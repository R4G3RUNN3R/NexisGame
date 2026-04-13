// ─────────────────────────────────────────────────────────────────────────────
// Nexis — Housing Page
// Nexis property system: own one property at a time, buy upgrades per tier.
// Shows current property panel at top, full tier list below.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { AppShell } from "../components/layout/AppShell";
import { usePlayer } from "../state/PlayerContext";
import {
  propertyTiers,
  getPropertyById,
  formatGold,
  type PropertyTier,
  type PropertyUpgrade,
} from "../data/propertyData";
import "../styles/housing.css";

// ─── Current Property Panel ───────────────────────────────────────────────────

function CurrentPropertyPanel({ tier }: { tier: PropertyTier }) {
  const { player } = usePlayer();
  const installed = player.property.installedUpgrades;

  const comfortFromUpgrades = tier.upgrades
    .filter((u) => installed.includes(u.id))
    .reduce((sum, u) => sum + u.comfortBonus, 0);

  const currentMaxComfort = tier.baseComfort + comfortFromUpgrades;
  const installedCount = tier.upgrades.filter((u) => installed.includes(u.id)).length;
  const availableSlots = tier.upgradeSlots - installedCount;

  return (
    <div className="housing-current">
      <div className="housing-current__icon">{tier.icon}</div>
      <div className="housing-current__body">
        <div className="housing-current__label">Current Residence</div>
        <div className="housing-current__name">{tier.name}</div>
        <div className="housing-current__flavour">{tier.flavour}</div>

        <div className="housing-current__stats">
          <div className="housing-stat">
            <span className="housing-stat__key">Max Comfort</span>
            <span className="housing-stat__val">{currentMaxComfort}</span>
          </div>
          <div className="housing-stat">
            <span className="housing-stat__key">Upgrade Slots</span>
            <span className="housing-stat__val">
              {installedCount} / {tier.upgradeSlots} used
            </span>
          </div>
          <div className="housing-stat">
            <span className="housing-stat__key">Upkeep</span>
            <span className="housing-stat__val">
              {tier.upkeepPerDay === 0 ? "Free" : `${formatGold(tier.upkeepPerDay)} / day`}
            </span>
          </div>
          {availableSlots > 0 && (
            <div className="housing-stat housing-stat--open">
              <span className="housing-stat__key">Open Slots</span>
              <span className="housing-stat__val">{availableSlots} available</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Upgrade Card ─────────────────────────────────────────────────────────────

function UpgradeCard({
  upgrade,
  isInstalled,
  canAfford,
  onInstall,
}: {
  upgrade: PropertyUpgrade;
  isInstalled: boolean;
  canAfford: boolean;
  onInstall: (upgrade: PropertyUpgrade) => void;
}) {
  return (
    <div className={`housing-upgrade${isInstalled ? " housing-upgrade--installed" : ""}`}>
      <div className="housing-upgrade__top">
        <div className="housing-upgrade__name">{upgrade.name}</div>
        <div className="housing-upgrade__cost">
          {isInstalled ? (
            <span className="housing-upgrade__installed-tag">✓ Installed</span>
          ) : (
            formatGold(upgrade.cost)
          )}
        </div>
      </div>
      <div className="housing-upgrade__desc">{upgrade.description}</div>
      <ul className="housing-upgrade__effects">
        {upgrade.effects.map((e) => (
          <li key={e}>{e}</li>
        ))}
      </ul>
      {!isInstalled && (
        <button
          type="button"
          className="housing-upgrade__btn"
          disabled={!canAfford}
          onClick={() => onInstall(upgrade)}
        >
          {canAfford ? "Install" : "Insufficient Gold"}
        </button>
      )}
    </div>
  );
}

// ─── Property Tier Row ────────────────────────────────────────────────────────

function PropertyRow({
  tier,
  isOwned,
  isSelected,
  onClick,
}: {
  tier: PropertyTier;
  isOwned: boolean;
  isSelected: boolean;
  onClick: () => void;
}) {
  const { player } = usePlayer();
  const canAfford = player.gold >= tier.price;
  const isLocked = !isOwned && !canAfford;

  return (
    <button
      type="button"
      className={`housing-tier-row${isOwned ? " housing-tier-row--owned" : ""}${isSelected ? " housing-tier-row--selected" : ""}${isLocked ? " housing-tier-row--locked" : ""}`}
      onClick={onClick}
    >
      <span className="housing-tier-row__icon">{tier.icon}</span>
      <div className="housing-tier-row__info">
        <div className="housing-tier-row__name">{tier.name}</div>
        <div className="housing-tier-row__summary">{tier.summary}</div>
      </div>
      <div className="housing-tier-row__meta">
        <div className="housing-tier-row__comfort">
          {tier.baseComfort}–{tier.maxComfort} comfort
        </div>
        <div className={`housing-tier-row__price${isOwned ? " housing-tier-row__price--owned" : ""}`}>
          {isOwned ? "Owned" : tier.price === 0 ? "Free" : formatGold(tier.price)}
        </div>
      </div>
    </button>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

function PropertyDetailPanel({
  tier,
  isOwned,
  onPurchase,
  onInstallUpgrade,
}: {
  tier: PropertyTier;
  isOwned: boolean;
  onPurchase: (tier: PropertyTier) => void;
  onInstallUpgrade: (upgrade: PropertyUpgrade) => void;
}) {
  const { player } = usePlayer();
  const installed = player.property.installedUpgrades;
  const canAffordProperty = player.gold >= tier.price;

  const installedCount = tier.upgrades.filter((u) => installed.includes(u.id)).length;
  const comfortFromUpgrades = tier.upgrades
    .filter((u) => installed.includes(u.id))
    .reduce((sum, u) => sum + u.comfortBonus, 0);

  return (
    <div className="housing-detail">
      {/* Header */}
      <div className="housing-detail__header">
        <span className="housing-detail__icon">{tier.icon}</span>
        <div className="housing-detail__header-info">
          <div className="housing-detail__title">{tier.name}</div>
          <div className="housing-detail__flavour">{tier.flavour}</div>
        </div>
      </div>

      {/* Stats row */}
      <div className="housing-detail__stats">
        <div className="housing-detail__stat">
          <span>Base Comfort</span>
          <strong>{tier.baseComfort}</strong>
        </div>
        <div className="housing-detail__stat">
          <span>Max Comfort (full)</span>
          <strong>
            {isOwned
              ? tier.baseComfort + comfortFromUpgrades
              : tier.maxComfort}
          </strong>
        </div>
        <div className="housing-detail__stat">
          <span>Upgrade Slots</span>
          <strong>
            {isOwned ? `${installedCount} / ${tier.upgradeSlots}` : tier.upgradeSlots}
          </strong>
        </div>
        <div className="housing-detail__stat">
          <span>Upkeep / Day</span>
          <strong>
            {tier.upkeepPerDay === 0 ? "Free" : formatGold(tier.upkeepPerDay)}
          </strong>
        </div>
      </div>

      {/* Purchase button (if not owned) */}
      {!isOwned && (
        <div className="housing-detail__purchase-row">
          <div className="housing-detail__purchase-note">
            {tier.price === 0
              ? "This is your default residence."
              : canAffordProperty
              ? `You have ${formatGold(player.gold)} — you can afford this.`
              : `You need ${formatGold(tier.price - player.gold)} more gold.`}
          </div>
          {tier.price > 0 && (
            <button
              type="button"
              className="housing-detail__purchase-btn"
              disabled={!canAffordProperty}
              onClick={() => onPurchase(tier)}
            >
              {canAffordProperty
                ? `Move In — ${formatGold(tier.price)}`
                : "Cannot Afford"}
            </button>
          )}
        </div>
      )}

      {/* Upgrades */}
      {tier.upgradeSlots > 0 && (
        <div className="housing-detail__upgrades">
          <div className="housing-detail__upgrades-header">
            <div className="housing-detail__upgrades-title">
              Upgrades
              {isOwned && (
                <span className="housing-detail__upgrades-slots">
                  {tier.upgradeSlots - installedCount} slot{tier.upgradeSlots - installedCount !== 1 ? "s" : ""} remaining
                </span>
              )}
            </div>
            {!isOwned && (
              <div className="housing-detail__upgrades-note">
                Purchase this property to install upgrades.
              </div>
            )}
          </div>

          <div className="housing-detail__upgrade-grid">
            {tier.upgrades.map((u) => (
              <UpgradeCard
                key={u.id}
                upgrade={u}
                isInstalled={installed.includes(u.id)}
                canAfford={isOwned && player.gold >= u.cost && !installed.includes(u.id)}
                onInstall={onInstallUpgrade}
              />
            ))}
          </div>
        </div>
      )}

      {tier.upgradeSlots === 0 && isOwned && (
        <div className="housing-detail__no-upgrades">
          The Shack cannot be upgraded. Purchase a higher-tier property to unlock upgrade slots.
        </div>
      )}
    </div>
  );
}

// ─── Housing Page ─────────────────────────────────────────────────────────────

export default function HousingPage() {
  const { player, purchaseProperty, installUpgrade } = usePlayer();
  const [selectedTierId, setSelectedTierId] = useState(player.property.current);
  const [toast, setToast] = useState<string | null>(null);

  const currentTier = getPropertyById(player.property.current) ?? propertyTiers[0];
  const selectedTier =
    propertyTiers.find((t) => t.id === selectedTierId) ?? currentTier;
  const isSelectedOwned = selectedTierId === player.property.current;

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function handlePurchase(tier: PropertyTier) {
    const ok = purchaseProperty(tier.id, tier.price);
    if (ok) {
      setSelectedTierId(tier.id);
      showToast(`You have moved into your new ${tier.name}.`);
    } else {
      showToast("Insufficient gold.");
    }
  }

  function handleInstallUpgrade(upgrade: PropertyUpgrade) {
    const ok = installUpgrade(upgrade.id, upgrade.cost);
    if (ok) {
      showToast(`${upgrade.name} installed.`);
    } else {
      showToast("Could not install upgrade.");
    }
  }

  return (
    <AppShell title="Housing">
      <div className="housing-page">
        {/* Toast */}
        {toast && <div className="housing-toast">{toast}</div>}

        {/* Gold bar */}
        <div className="housing-gold-bar">
          <span className="housing-gold-bar__label">Your gold</span>
          <span className="housing-gold-bar__value">{formatGold(player.gold)}</span>
        </div>

        {/* Current property panel */}
        <CurrentPropertyPanel tier={currentTier} />

        {/* Two-column layout: tier list + detail panel */}
        <div className="housing-layout">
          {/* Left: tier list */}
          <div className="housing-tiers">
            <div className="housing-tiers__heading">All Properties</div>
            {propertyTiers.map((tier) => (
              <PropertyRow
                key={tier.id}
                tier={tier}
                isOwned={tier.id === player.property.current}
                isSelected={tier.id === selectedTierId}
                onClick={() => setSelectedTierId(tier.id)}
              />
            ))}
          </div>

          {/* Right: detail panel */}
          <div className="housing-detail-wrap">
            <PropertyDetailPanel
              tier={selectedTier}
              isOwned={isSelectedOwned}
              onPurchase={handlePurchase}
              onInstallUpgrade={handleInstallUpgrade}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
