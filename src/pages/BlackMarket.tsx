import { useMemo, useState } from "react";
import { AppShell } from "../components/layout/AppShell";
import { ContentPanel } from "../components/layout/ContentPanel";
import { useAcademyRuntime } from "../state/AcademyRuntimeContext";
import { useMarketRuntime } from "../state/MarketRuntimeContext";
import { usePlayer } from "../state/PlayerContext";
import {
  blackMarketAuctionListings,
  blackMarketContracts,
  blackMarketGoodsListings,
} from "../data/blackMarketData";

type BlackMarketTab = "goods" | "auctions" | "contracts";

const CATEGORY_LABELS: Record<string, string> = {
  contraband: "Contraband",
  fenced_goods: "Fenced Goods",
  rare_material: "Rare Materials",
  restricted_tool: "Restricted Tools",
};

function TabButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      className="travel-action-button"
      style={{ opacity: active ? 1 : 0.72 }}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

const STOCK_STORAGE_KEY = "nexis_black_market_stock";

function getInitialStock(): Record<string, number> {
  if (typeof window === "undefined") {
    return Object.fromEntries(blackMarketGoodsListings.map((listing) => [listing.id, listing.stock]));
  }
  try {
    const raw = window.localStorage.getItem(STOCK_STORAGE_KEY);
    if (!raw) {
      return Object.fromEntries(blackMarketGoodsListings.map((listing) => [listing.id, listing.stock]));
    }
    const parsed = JSON.parse(raw) as Record<string, number>;
    return Object.fromEntries(blackMarketGoodsListings.map((listing) => [listing.id, parsed[listing.id] ?? listing.stock]));
  } catch {
    return Object.fromEntries(blackMarketGoodsListings.map((listing) => [listing.id, listing.stock]));
  }
}

export default function BlackMarketPage() {
  const { hasPassive, academyState } = useAcademyRuntime();
  const { player, spendGold, addItem } = usePlayer();
  const marketRuntime = useMarketRuntime();
  const unlocked = hasPassive("blackMarketAccess");
  const [tab, setTab] = useState<BlackMarketTab>("goods");
  const [stockState, setStockState] = useState<Record<string, number>>(getInitialStock);
  const [toast, setToast] = useState<string | null>(null);

  function persistStock(next: Record<string, number>) {
    setStockState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STOCK_STORAGE_KEY, JSON.stringify(next));
    }
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2500);
  }

  const groupedListings = useMemo(() => {
    return blackMarketGoodsListings.reduce<Record<string, typeof blackMarketGoodsListings>>((acc, listing) => {
      const key = listing.category;
      if (!acc[key]) acc[key] = [];
      acc[key].push(listing);
      return acc;
    }, {});
  }, []);

  function handleBuy(listingId: string) {
    const listing = blackMarketGoodsListings.find((entry) => entry.id === listingId);
    if (!listing || !listing.itemId) return;

    const stock = stockState[listingId] ?? 0;
    if (stock <= 0) {
      showToast("Sold out.");
      return;
    }
    if (!marketRuntime.canBuyFromBlackMarket(1)) {
      showToast("Black Market daily limit reached. You may only buy 10 total illicit goods per day.");
      return;
    }

    const paid = spendGold(listing.price);
    if (!paid) {
      showToast("Not enough gold.");
      return;
    }

    const recorded = marketRuntime.recordBlackMarketPurchase(1);
    if (!recorded) {
      showToast("Black Market daily limit reached.");
      return;
    }

    addItem(listing.itemId, 1);
    const nextStock = {
      ...stockState,
      [listingId]: Math.max(0, stock - 1),
    };
    persistStock(nextStock);
    showToast(`${listing.name} acquired.`);
  }

  return (
    <AppShell title="Black Market" hint="Illicit goods, artifact auctions, and underworld contracts.">
      <div className="nexis-grid">
        <div className="nexis-column nexis-column--wide">
          {toast && (
            <div style={{ marginBottom: "0.75rem", padding: "0.75rem 1rem", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px" }}>
              {toast}
            </div>
          )}

          <ContentPanel title="Access Status">
            {unlocked ? (
              <div style={{ padding: "1rem" }}>
                <div style={{ fontSize: "1.15rem", marginBottom: "0.5rem" }}>Access Granted</div>
                <div style={{ color: "var(--color-text-muted, #aaa)", marginBottom: "1rem" }}>
                  Your standing within the Western Shadow path is sufficient. Illegal brokers, fenced networks, and contract handlers now recognise your name.
                </div>
                <div className="info-list">
                  <div className="info-row"><span className="info-row__label">Status</span><span className="info-row__value">Unlocked</span></div>
                  <div className="info-row"><span className="info-row__label">Western Branch</span><span className="info-row__value">{academyState.westernBranch ?? "Unchosen"}</span></div>
                  <div className="info-row"><span className="info-row__label">Western Rank</span><span className="info-row__value">{academyState.rankProgress.western ?? 0}</span></div>
                  <div className="info-row"><span className="info-row__label">Available Gold</span><span className="info-row__value">{player.gold.toLocaleString()}</span></div>
                  <div className="info-row"><span className="info-row__label">Daily illicit purchases left</span><span className="info-row__value">{marketRuntime.getBlackMarketRemaining()}</span></div>
                </div>
              </div>
            ) : (
              <div style={{ padding: "1rem" }}>
                <div style={{ fontSize: "1.15rem", marginBottom: "0.5rem" }}>Access Denied</div>
                <div style={{ color: "var(--color-text-muted, #aaa)", marginBottom: "1rem" }}>
                  The Black Market is not public. Entry is tied to the Shadow path of the Western Academy and opens later in that progression.
                </div>
                <div className="info-list">
                  <div className="info-row"><span className="info-row__label">Required path</span><span className="info-row__value">Western Academy → Shadow</span></div>
                  <div className="info-row"><span className="info-row__label">Required milestone</span><span className="info-row__value">Rank 5</span></div>
                  <div className="info-row"><span className="info-row__label">Current branch</span><span className="info-row__value">{academyState.westernBranch ?? "Unchosen"}</span></div>
                  <div className="info-row"><span className="info-row__label">Current western rank</span><span className="info-row__value">{academyState.rankProgress.western ?? 0}</span></div>
                </div>
              </div>
            )}
          </ContentPanel>

          {unlocked && (
            <ContentPanel title="Underworld Exchange">
              <div className="travel-actions" style={{ marginBottom: "1rem" }}>
                <TabButton active={tab === "goods"} onClick={() => setTab("goods")}>Goods</TabButton>
                <TabButton active={tab === "auctions"} onClick={() => setTab("auctions")}>Auctions</TabButton>
                <TabButton active={tab === "contracts"} onClick={() => setTab("contracts")}>Contracts</TabButton>
              </div>

              {tab === "goods" && (
                <div className="inv-grid">
                  {Object.entries(groupedListings).map(([category, listings]) => (
                    <div key={category} style={{ gridColumn: "1 / -1" }}>
                      <div style={{ fontWeight: 700, margin: "0.5rem 0 0.75rem" }}>{CATEGORY_LABELS[category] ?? category}</div>
                      <div className="inv-grid">
                        {listings.map((listing) => {
                          const stock = stockState[listing.id] ?? 0;
                          const canAfford = player.gold >= listing.price;
                          const capRemaining = marketRuntime.getBlackMarketRemaining();
                          return (
                            <div key={listing.id} className="inv-item">
                              <div className="inv-item__header">
                                <span className="inv-item__name">{listing.name}</span>
                                <span>{CATEGORY_LABELS[listing.category]}</span>
                              </div>
                              <div className="inv-item__desc">{listing.description}</div>
                              <div className="info-list" style={{ marginTop: "0.75rem" }}>
                                <div className="info-row"><span className="info-row__label">Price</span><span className="info-row__value">{listing.price.toLocaleString()} gold</span></div>
                                <div className="info-row"><span className="info-row__label">Stock</span><span className="info-row__value">{stock}</span></div>
                              </div>
                              <button
                                type="button"
                                className="housing-upgrade__btn"
                                style={{ marginTop: "0.9rem" }}
                                disabled={stock <= 0 || !canAfford || capRemaining <= 0}
                                onClick={() => handleBuy(listing.id)}
                              >
                                {stock <= 0 ? "Sold Out" : capRemaining <= 0 ? "Daily Limit Reached" : canAfford ? "Buy" : "Insufficient Gold"}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === "auctions" && (
                <div className="inv-grid">
                  {blackMarketAuctionListings.map((lot) => (
                    <div key={lot.id} className="inv-item">
                      <div className="inv-item__header">
                        <span className="inv-item__name">{lot.name}</span>
                        <span>{lot.category}</span>
                      </div>
                      <div className="inv-item__desc">{lot.description}</div>
                      <div>Current bid: {lot.currentBid.toLocaleString()} gold</div>
                      <div>Bidders: {lot.bidderCount}</div>
                      <div>Ends in: {lot.endsInLabel}</div>
                      <button type="button" className="housing-upgrade__btn" style={{ marginTop: "0.9rem" }} disabled>
                        Auctions are staged next
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {tab === "contracts" && (
                <div className="inv-grid">
                  {blackMarketContracts.map((contract) => (
                    <div key={contract.id} className="inv-item">
                      <div className="inv-item__header">
                        <span className="inv-item__name">{contract.title}</span>
                        <span>{contract.difficulty}</span>
                      </div>
                      <div className="inv-item__desc">{contract.description}</div>
                      <div>Type: {contract.type}</div>
                      <div>Reward: {contract.rewardSummary}</div>
                      <button type="button" className="housing-upgrade__btn" style={{ marginTop: "0.9rem" }} disabled>
                        Contracts system next
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </ContentPanel>
          )}
        </div>

        <div className="nexis-column">
          <ContentPanel title="Underworld Summary">
            <div className="info-list">
              <div className="info-row"><span className="info-row__label">Goods cap</span><span className="info-row__value">10 items per day</span></div>
              <div className="info-row"><span className="info-row__label">Auctions</span><span className="info-row__value">Artifacts and broker lots appear here</span></div>
              <div className="info-row"><span className="info-row__label">Contracts</span><span className="info-row__value">Hard illicit jobs with serious rewards</span></div>
            </div>
          </ContentPanel>

          <ContentPanel title="Design Notes">
            <div className="info-list">
              <div className="info-row"><span className="info-row__label">Identity</span><span className="info-row__value">Premium illicit economy, not a second vendor row</span></div>
              <div className="info-row"><span className="info-row__label">Goods</span><span className="info-row__value">Useful, rare, expensive, capped daily</span></div>
              <div className="info-row"><span className="info-row__label">Contracts</span><span className="info-row__value">Smuggling, assassination, sabotage, retrieval</span></div>
            </div>
          </ContentPanel>
        </div>
      </div>
    </AppShell>
  );
}
