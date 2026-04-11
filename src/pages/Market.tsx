import { useMemo, useState } from "react";
import { AppShell } from "../components/layout/AppShell";
import { ContentPanel } from "../components/layout/ContentPanel";
import { useEducationRuntime } from "../state/EducationRuntimeContext";
import { useMarketRuntime } from "../state/MarketRuntimeContext";
import { usePlayer } from "../state/PlayerContext";
import { ITEM_CATALOGUE, getCategoryColour } from "../data/itemData";

type MarketTab = "vendors" | "market" | "auction_house" | "my_listings";

type VendorListing = {
  id: string;
  vendor: string;
  itemId: string;
  price: number;
  stockLabel: string;
};

const vendorListings: VendorListing[] = [
  { id: "vendor-herb", vendor: "Apothecary Stall", itemId: "wild_herb", price: 16, stockLabel: "Common stock" },
  { id: "vendor-rations", vendor: "Quartermaster", itemId: "rations", price: 10, stockLabel: "Common stock" },
  { id: "vendor-rope", vendor: "Outfitter", itemId: "rope", price: 14, stockLabel: "Common stock" },
  { id: "vendor-lockpick", vendor: "Backstreet Tools", itemId: "lockpick", price: 24, stockLabel: "Limited stock" },
  { id: "vendor-ore", vendor: "Foundry Yard", itemId: "iron_ore", price: 26, stockLabel: "Bulk stock" },
  { id: "vendor-wood", vendor: "Timber Exchange", itemId: "hardwood", price: 30, stockLabel: "Bulk stock" },
];

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

export default function MarketPage() {
  const { player, addGold, removeItem, spendGold, addItem } = usePlayer();
  const { hasUnlockedSystem } = useEducationRuntime();
  const marketRuntime = useMarketRuntime();
  const [tab, setTab] = useState<MarketTab>("vendors");
  const [message, setMessage] = useState<string | null>(null);

  const inventory = player.inventory ?? {};
  const hasCommerce = hasUnlockedSystem("commerce");

  const entries = Object.entries(inventory)
    .filter(([, qty]) => qty > 0)
    .map(([itemId, qty]) => {
      const info = ITEM_CATALOGUE[itemId];
      if (!info) return null;
      return { itemId, qty, ...info };
    })
    .filter(Boolean) as Array<{ itemId: string; qty: number; name: string; category: string; description: string; sellPrice: number; sellable: boolean }>;

  const sellableEntries = entries.filter((e) => e.sellable);
  const totalSellValue = sellableEntries.reduce((sum, entry) => sum + entry.qty * entry.sellPrice, 0);
  const vendorRemaining = marketRuntime.getVendorRemaining();

  function showMessage(next: string) {
    setMessage(next);
    window.setTimeout(() => setMessage(null), 2600);
  }

  function handleVendorBuy(listing: VendorListing) {
    if (!hasCommerce) {
      showMessage("Commerce locked. Requires Practical Arithmetic from General Studies.");
      return;
    }
    if (!marketRuntime.canBuyFromVendors(1)) {
      showMessage("Vendor limit reached. You can only buy 100 items per day across all vendors.");
      return;
    }
    const info = ITEM_CATALOGUE[listing.itemId];
    if (!info) return;
    const paid = spendGold(listing.price);
    if (!paid) {
      showMessage("Not enough gold.");
      return;
    }
    const recorded = marketRuntime.recordVendorPurchase(1);
    if (!recorded) {
      addGold(listing.price);
      showMessage("Vendor limit reached.");
      return;
    }
    addItem(listing.itemId, 1);
    showMessage(`${info.name} purchased from ${listing.vendor}.`);
  }

  return (
    <AppShell title="Market" hint="Legal economy hub: vendors, market, auction house, and player listings.">
      <div className="nexis-grid">
        <div className="nexis-column nexis-column--wide">
          <ContentPanel title="Economy Hub">
            <div className="travel-actions" style={{ marginBottom: "1rem" }}>
              <TabButton active={tab === "vendors"} onClick={() => setTab("vendors")}>Vendors</TabButton>
              <TabButton active={tab === "market"} onClick={() => setTab("market")}>Market</TabButton>
              <TabButton active={tab === "auction_house"} onClick={() => setTab("auction_house")}>Auction House</TabButton>
              <TabButton active={tab === "my_listings"} onClick={() => setTab("my_listings")}>My Listings</TabButton>
            </div>

            {message && (
              <div style={{ marginBottom: "0.75rem", padding: "0.75rem 1rem", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px" }}>
                {message}
              </div>
            )}

            {tab === "vendors" && (
              <div className="inv-grid">
                {vendorListings.map((listing) => {
                  const info = ITEM_CATALOGUE[listing.itemId];
                  if (!info) return null;
                  return (
                    <div key={listing.id} className="inv-item">
                      <div className="inv-item__header">
                        <span className="inv-item__name">{info.name}</span>
                        <span style={{ color: getCategoryColour(info.category) }}>{info.category}</span>
                      </div>
                      <div className="inv-item__desc">{info.description}</div>
                      <div>Vendor: {listing.vendor}</div>
                      <div>Price: {listing.price} gold</div>
                      <div>Stock: {listing.stockLabel}</div>
                      <button
                        type="button"
                        className="housing-upgrade__btn"
                        style={{ marginTop: "0.75rem" }}
                        disabled={!hasCommerce || vendorRemaining <= 0 || player.gold < listing.price}
                        onClick={() => handleVendorBuy(listing)}
                      >
                        {!hasCommerce ? "Commerce Locked" : vendorRemaining <= 0 ? "Daily Vendor Limit Reached" : player.gold < listing.price ? "Insufficient Gold" : "Buy 1"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {tab === "market" && (
              <div className="inv-grid">
                {sellableEntries.map((item) => {
                  const total = item.qty * item.sellPrice;
                  return (
                    <div key={item.itemId} className="inv-item">
                      <div className="inv-item__header">
                        <span className="inv-item__name">{item.name}</span>
                        <span style={{ color: getCategoryColour(item.category) }}>{item.category}</span>
                      </div>
                      <div className="inv-item__desc">{item.description}</div>
                      <div>Qty: {item.qty}</div>
                      <div>Legal sale value: {item.sellPrice} each</div>
                      <div style={{ marginTop: "0.5rem" }}>
                        <button
                          type="button"
                          onClick={() => {
                            if (removeItem(item.itemId, 1)) addGold(item.sellPrice);
                          }}
                        >
                          Sell 1
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (removeItem(item.itemId, item.qty)) addGold(total);
                          }}
                        >
                          Sell All
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {tab === "auction_house" && (
              <div className="info-list">
                <div className="info-row">
                  <span className="info-row__label">Status</span>
                  <span className="info-row__value">Design locked, player listing loop pending</span>
                </div>
                <div className="info-row">
                  <span className="info-row__label">Purpose</span>
                  <span className="info-row__value">Legal player-to-player auction and rare-item exchange</span>
                </div>
                <div className="info-row">
                  <span className="info-row__label">Future scope</span>
                  <span className="info-row__value">Timed listings, bids, fixed-price lots, auction tax</span>
                </div>
              </div>
            )}

            {tab === "my_listings" && (
              <div className="info-list">
                <div className="info-row">
                  <span className="info-row__label">Current listings</span>
                  <span className="info-row__value">None yet</span>
                </div>
                <div className="info-row">
                  <span className="info-row__label">Planned behavior</span>
                  <span className="info-row__value">Items will leave inventory while listed and return if unsold</span>
                </div>
              </div>
            )}
          </ContentPanel>
        </div>

        <div className="nexis-column">
          <ContentPanel title="Legal Economy Summary">
            <div className="info-list">
              <div className="info-row">
                <span className="info-row__label">Gold</span>
                <span className="info-row__value">{player.gold.toLocaleString()}</span>
              </div>
              <div className="info-row">
                <span className="info-row__label">Commerce</span>
                <span className="info-row__value">{hasCommerce ? "Unlocked" : "Locked"}</span>
              </div>
              <div className="info-row">
                <span className="info-row__label">Vendor purchases left today</span>
                <span className="info-row__value">{vendorRemaining}</span>
              </div>
              <div className="info-row">
                <span className="info-row__label">Total legal sell value</span>
                <span className="info-row__value">{totalSellValue.toLocaleString()}</span>
              </div>
            </div>
          </ContentPanel>

          <ContentPanel title="Access Notes">
            <div className="info-list">
              <div className="info-row">
                <span className="info-row__label">Vendor rule</span>
                <span className="info-row__value">100 total items per day across all legal vendors</span>
              </div>
              <div className="info-row">
                <span className="info-row__label">Unlock requirement</span>
                <span className="info-row__value">Practical Arithmetic → Commerce</span>
              </div>
              <div className="info-row">
                <span className="info-row__label">Auction House</span>
                <span className="info-row__value">Legal player market, distinct from the Black Market</span>
              </div>
            </div>
          </ContentPanel>
        </div>
      </div>
    </AppShell>
  );
}
