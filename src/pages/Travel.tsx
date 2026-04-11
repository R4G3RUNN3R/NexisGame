import { useEffect, useMemo, useState } from "react";
import { AppShell } from "../components/layout/AppShell";
import {
  worldCities,
  worldRoutes,
  type WorldCity,
  type WorldCityId,
  worldMapTitle,
} from "../data/worldMapData";
import { askCiel } from "../lib/ciel-system";
import { useEducationRuntime } from "../state/EducationRuntimeContext";
import { useTravelRuntime } from "../state/TravelRuntimeContext";
import { usePlayer } from "../state/PlayerContext";
import mapImage from "../assets/maps/nexis-world-map.png";
import "../styles/world-map-ui.css";

const CITY_IMAGES: Record<string, string> = {
  nexis: "/images/cities/city_nexis.png",
  north: "/images/cities/city_aethermoor.png",
  east: "/images/cities/city_torvhal.png",
  west: "/images/cities/city_westmarch.png",
  south: "/images/cities/city_embervale.png",
};

const BASE_TRAVEL_CONFIG: Record<WorldCityId, { durationMs: number; riskChance: number }> = {
  nexis: { durationMs: 0, riskChance: 0 },
  north: { durationMs: 30000, riskChance: 0.25 },
  east: { durationMs: 34000, riskChance: 0.25 },
  west: { durationMs: 38000, riskChance: 0.35 },
  south: { durationMs: 42000, riskChance: 0.4 },
};

function getPinClass(region: WorldCity["region"]) {
  switch (region) {
    case "north":
      return "travel-pin travel-pin--north";
    case "east":
      return "travel-pin travel-pin--east";
    case "west":
      return "travel-pin travel-pin--west";
    case "south":
      return "travel-pin travel-pin--south";
    default:
      return "travel-pin travel-pin--center";
  }
}

function formatTravelRemaining(ms: number): string {
  if (ms <= 0) return "Ready to finalize";
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s remaining`;
}

function rollTravelDiscovery(options: { hasHistory: boolean; hasLore: boolean }) {
  const roll = Math.random();

  if (roll < 0.55) {
    const gold = 120 + Math.floor(Math.random() * 181);
    return {
      summary: `You found a loose cache worth ${gold} gold along the route.`,
      gold,
      itemId: null as string | null,
      itemQty: 0,
    };
  }

  if (roll < 0.87) {
    const materialPool = ["wild_herb", "iron_ore", "hardwood", "scrap_metal", "stone_block"] as const;
    const itemId = materialPool[Math.floor(Math.random() * materialPool.length)];
    const itemQty = 1 + Math.floor(Math.random() * 2);
    return {
      summary: `You discovered useful salvage on the roadside and recovered ${itemQty}x ${itemId.replaceAll("_", " ")}.`,
      gold: 0,
      itemId,
      itemQty,
    };
  }

  const rarePool = options.hasHistory || options.hasLore
    ? (["ancient_fragment", "rare_gemstone", "mana_crystal", "runed_stone"] as const)
    : (["ancient_fragment", "rare_gemstone"] as const);
  const itemId = rarePool[Math.floor(Math.random() * rarePool.length)];
  const itemQty = 1;
  return {
    summary: `You uncovered traces of a forgotten ruin and recovered ${itemId.replaceAll("_", " ")}.`,
    gold: 0,
    itemId,
    itemQty,
  };
}

export default function TravelPage() {
  const education = useEducationRuntime();
  const travel = useTravelRuntime();
  const { addGold, addItem } = usePlayer();
  const [selectedCityId, setSelectedCityId] = useState<WorldCityId>(travel.travelState.currentCityId as WorldCityId);
  const [remainingMs, setRemainingMs] = useState(() => travel.getRemainingMs());
  const [discoveryMessage, setDiscoveryMessage] = useState<string | null>(null);

  const selectedCity = useMemo(
    () => worldCities.find((city) => city.id === selectedCityId) ?? worldCities[0],
    [selectedCityId],
  );

  const currentCity = useMemo(
    () => worldCities.find((city) => city.id === travel.travelState.currentCityId) ?? worldCities[0],
    [travel.travelState.currentCityId],
  );

  const selectedRoutes = useMemo(
    () => worldRoutes.filter((route) => route.from === selectedCity.id || route.to === selectedCity.id),
    [selectedCity],
  );

  useEffect(() => {
    if (!travel.isTravelling) {
      setRemainingMs(0);
      return;
    }
    const id = window.setInterval(() => {
      const next = travel.getRemainingMs();
      setRemainingMs(next);
    }, 1000);
    return () => window.clearInterval(id);
  }, [travel, travel.isTravelling]);

  const hasGeography = education.hasUnlockedSystem("safe_travel");
  const hasTravelDiscovery = education.hasUnlockedSystem("travel_discovery");
  const hasHistory = education.hasUnlockedSystem("relic_missions");
  const hasLore = education.hasUnlockedSystem("lore_dialogue");

  const selectedBase = BASE_TRAVEL_CONFIG[selectedCity.id];
  const adjustedDurationMs =
    selectedBase.durationMs === 0
      ? 0
      : Math.round(selectedBase.durationMs * (hasGeography ? 0.95 : 1.5));
  const adjustedRiskChance = hasGeography
    ? Math.max(0, selectedBase.riskChance - 0.25)
    : selectedBase.riskChance;

  function handleTravelStart() {
    if (selectedCity.id === travel.travelState.currentCityId) return;
    travel.startTravel(selectedCity.id, adjustedDurationMs, {
      riskChance: adjustedRiskChance,
      failureMessage: hasGeography
        ? `Your route to ${selectedCity.name} was disrupted and you were forced back to ${currentCity.name}.`
        : `Without World Geography, you lost your way trying to reach ${selectedCity.name} and ended up back in ${currentCity.name}.`,
      successMessage: hasTravelDiscovery
        ? `You safely reached ${selectedCity.name}. Your trained eye also picked up signs of possible discoveries along the route.`
        : `You safely reached ${selectedCity.name}.`,
    });
    setDiscoveryMessage(null);
  }

  function handleFinalizeTravel() {
    const result = travel.finalizeTravel();
    if (!result) return;
    setRemainingMs(0);

    if (result.status === "arrived" && hasTravelDiscovery) {
      const discovery = rollTravelDiscovery({ hasHistory, hasLore });
      if (discovery.gold > 0) addGold(discovery.gold);
      if (discovery.itemId && discovery.itemQty > 0) addItem(discovery.itemId, discovery.itemQty);
      setDiscoveryMessage(discovery.summary);
    } else {
      setDiscoveryMessage(null);
    }
  }

  return (
    <AppShell
      title="Travel"
      hint="Standalone travel with route time, risk, and geography-dependent reliability."
    >
      <div className="travel-layout">
        <section className="travel-panel travel-panel--map">
          <div className="travel-panel__header">{worldMapTitle}</div>

          <div className="travel-map-frame">
            <img src={mapImage} alt="The locked world map of Nexis" className="travel-map-image" />

            {worldCities.map((city) => (
              <button
                key={city.id}
                type="button"
                className={getPinClass(city.region)}
                style={{ left: `${city.xPercent}%`, top: `${city.yPercent}%` }}
                onClick={() => {
                  setSelectedCityId(city.id);
                  askCiel("travel_destination", city);
                }}
                aria-label={city.name}
                title={city.name}
              >
                <span className="travel-pin__dot" />
                <span className="travel-pin__label">{city.name}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="travel-panel">
          <div className="travel-panel__header">Selected Destination</div>

          <div className="travel-card">
            {CITY_IMAGES[selectedCity.id] && (
              <div className="travel-city-art">
                <img src={CITY_IMAGES[selectedCity.id]} alt={selectedCity.name} className="travel-city-art__img" />
              </div>
            )}
            <div className="travel-card__title">{selectedCity.name}</div>
            <div className="travel-card__subtitle">{selectedCity.subtitle}</div>

            <div className="travel-card__grid">
              <div className="travel-info">
                <span className="travel-info__label">Current City</span>
                <strong className="travel-info__value">{currentCity.name}</strong>
              </div>
              <div className="travel-info">
                <span className="travel-info__label">Access Rule</span>
                <strong className="travel-info__value">{selectedCity.accessRule}</strong>
              </div>
              <div className="travel-info">
                <span className="travel-info__label">Travel Time</span>
                <strong className="travel-info__value">{selectedCity.id === travel.travelState.currentCityId ? "Already here" : formatTravelRemaining(adjustedDurationMs)}</strong>
              </div>
              <div className="travel-info">
                <span className="travel-info__label">Travel Risk</span>
                <strong className="travel-info__value">{selectedCity.id === travel.travelState.currentCityId ? "None" : `${Math.round(adjustedRiskChance * 100)}%`}</strong>
              </div>
              <div className="travel-info">
                <span className="travel-info__label">World Geography</span>
                <strong className="travel-info__value">{hasGeography ? "Learned" : "Missing"}</strong>
              </div>
              <div className="travel-info">
                <span className="travel-info__label">Travel Discovery</span>
                <strong className="travel-info__value">{hasTravelDiscovery ? "Unlocked" : "Locked"}</strong>
              </div>
            </div>

            <p className="travel-card__summary">{selectedCity.summary}</p>

            <div className="travel-subsection">
              <div className="travel-subsection__title">Connected Routes</div>
              <ul className="travel-list">
                {selectedRoutes.map((route) => (
                  <li key={route.id}>
                    <strong>{route.travelLabel}</strong>: {route.rule}
                  </li>
                ))}
              </ul>
            </div>

            <div className="travel-subsection">
              <div className="travel-subsection__title">Route Advisory</div>
              <ul className="travel-list">
                {hasGeography ? (
                  <>
                    <li>World Geography reduces travel time and sharply lowers the chance of getting lost.</li>
                    <li>Travel Discovery is unlocked, so successful journeys can yield gold, salvage, or rare finds.</li>
                  </>
                ) : (
                  <>
                    <li>Without World Geography, long-distance travel is slower and carries a much higher chance of failure.</li>
                    <li>You can still attempt the route, but you may lose time and return to your origin with nothing accomplished.</li>
                  </>
                )}
                {hasHistory && <li>Historical Awareness improves the quality of rare discoveries and ruin-related finds.</li>}
              </ul>
            </div>

            {travel.travelState.status === "travelling" && (
              <div className="travel-subsection">
                <div className="travel-subsection__title">Current Journey</div>
                <ul className="travel-list">
                  <li>Destination: {worldCities.find((city) => city.id === travel.travelState.destinationCityId)?.name ?? "Unknown"}</li>
                  <li>Status: {formatTravelRemaining(remainingMs)}</li>
                </ul>
              </div>
            )}

            {(travel.travelState.status === "arrived" || travel.travelState.status === "failed") && travel.travelState.lastOutcome && (
              <div className="travel-subsection">
                <div className="travel-subsection__title">Last Outcome</div>
                <ul className="travel-list">
                  <li>{travel.travelState.lastOutcome}</li>
                  {discoveryMessage && <li>{discoveryMessage}</li>}
                </ul>
              </div>
            )}

            <div className="travel-actions">
              <button
                type="button"
                className="travel-action-button"
                onClick={() => askCiel("travel_destination", selectedCity)}
              >
                Ask CIEL
              </button>

              {travel.travelState.status === "travelling" && remainingMs <= 0 ? (
                <button
                  type="button"
                  className="travel-action-button travel-action-button--primary"
                  onClick={handleFinalizeTravel}
                >
                  Finalize Journey
                </button>
              ) : travel.travelState.status === "travelling" ? (
                <button type="button" className="travel-action-button travel-action-button--primary" disabled>
                  Travelling…
                </button>
              ) : (
                <button
                  type="button"
                  className="travel-action-button travel-action-button--primary"
                  onClick={handleTravelStart}
                  disabled={selectedCity.id === travel.travelState.currentCityId}
                >
                  Travel
                </button>
              )}

              {(travel.travelState.status === "arrived" || travel.travelState.status === "failed") && (
                <button
                  type="button"
                  className="travel-action-button"
                  onClick={() => {
                    travel.resetOutcome();
                    setDiscoveryMessage(null);
                  }}
                >
                  Clear Outcome
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
