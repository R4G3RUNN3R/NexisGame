// ─────────────────────────────────────────────────────────────────────────────
// Nexis — Inventory Page
// Shows all items the player has accumulated from job drops.
// Items are stored in player.inventory (Record<itemId, qty>).
// ─────────────────────────────────────────────────────────────────────────────

import { AppShell } from "../components/layout/AppShell";
import { ContentPanel } from "../components/layout/ContentPanel";
import { usePlayer } from "../state/PlayerContext";
import "../styles/inventory.css";

// ─── Item catalogue — maps itemId → display info ──────────────────────────────
// This covers all item drops defined in jobsData.ts. Extend as new jobs are added.
const ITEM_CATALOGUE: Record<string, { name: string; category: string; description: string }> = {
  // Beginner Adventurer
  wild_herb:       { name: "Wild Herb",       category: "Herb",      description: "Common flora. Used in basic potion recipes." },
  medicinal_herb:  { name: "Medicinal Herb",  category: "Herb",      description: "Useful for healing compounds. Sought by alchemists." },
  healing_root:    { name: "Healing Root",    category: "Herb",      description: "Rare root with potent restorative properties." },
  rough_wood:      { name: "Rough Wood",      category: "Material",  description: "Unfinished timber. Useful for basic constructs." },
  hardwood:        { name: "Hardwood",        category: "Material",  description: "Dense, quality wood. Valued by carpenters." },
  iron_ore:        { name: "Iron Ore",        category: "Ore",       description: "Raw iron. Requires smelting before use." },
  coal:            { name: "Coal",            category: "Ore",       description: "Fuel source used in forges and furnaces." },
  scrap_metal:     { name: "Scrap Metal",     category: "Material",  description: "Salvaged metalwork. Can be repurposed." },
  leather_strip:   { name: "Leather Strip",   category: "Material",  description: "Cured hide. Used in armour and binding." },
  rope:            { name: "Rope",            category: "Material",  description: "Reliable cordage. Useful in a dozen trades." },
  ancient_fragment:{ name: "Ancient Fragment",category: "Relic",     description: "Piece of a ruined inscription. Scholars pay well." },
  torn_map:        { name: "Tattered Map",    category: "Relic",     description: "Part of an old map. The rest is somewhere out there." },
  // Thievery
  stolen_coin:     { name: "Stolen Coin",     category: "Valuables", description: "Liberated from an inattentive pocket." },
  rare_gemstone:   { name: "Rare Gemstone",   category: "Valuables", description: "Uncut gem. Fence it or keep it. Your call." },
  forged_document: { name: "Forged Document", category: "Relic",     description: "Convincingly fake. Useful for certain arrangements." },
  lockpick:        { name: "Lockpick",        category: "Tool",      description: "A good tool deserves a good cause." },
  // Courier
  rations:         { name: "Rations",         category: "Consumable","description": "Standard travel food. Better than nothing." },
  worn_boots:      { name: "Worn Boots",      category: "Equipment", description: "Seen better days. Still keeps the feet dry." },
  // Labor
  stone_block:     { name: "Stone Block",     category: "Material",  description: "Cut stone. Essential for construction." },
  clay:            { name: "Clay",            category: "Material",  description: "Raw clay. Used in ceramics and construction." },
  // Deception
  vial_of_ink:     { name: "Vial of Ink",     category: "Consumable","description": "High-quality ink. Useful for scribes and forgers alike." },
  wax_seal:        { name: "Wax Seal",        category: "Tool",      description: "Official-looking seal. Almost official." },
};

// ─── Category colour badges ───────────────────────────────────────────────────
const CATEGORY_COLOUR: Record<string, string> = {
  Herb:       "#4caf50",
  Ore:        "#9e9e9e",
  Material:   "#8d6e63",
  Relic:      "#ab47bc",
  Valuables:  "#ffd740",
  Consumable: "#26c6da",
  Tool:       "#ff9800",
  Equipment:  "#78909c",
};

function getCategoryColour(category: string): string {
  return CATEGORY_COLOUR[category] ?? "#546e7a";
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function InventoryPage() {
  const { player } = usePlayer();
  const inventory = player.inventory ?? {};

  const entries = Object.entries(inventory)
    .filter(([, qty]) => qty > 0)
    .map(([itemId, qty]) => {
      const info = ITEM_CATALOGUE[itemId] ?? {
        name: itemId.replace(/_/g, " "),
        category: "Unknown",
        description: "An item of uncertain origin.",
      };
      return { itemId, qty, ...info };
    })
    .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));

  const isEmpty = entries.length === 0;

  return (
    <AppShell title="Inventory" hint="Materials gained from jobs accumulate here. They feed into Professions and crafting systems.">
      <div className="nexis-grid">
        <div className="nexis-column nexis-column--wide">
          <ContentPanel title={`Items (${entries.length} types)`}>
            {isEmpty ? (
              <div className="inv-empty">
                <div className="inv-empty__icon">📦</div>
                <div className="inv-empty__title">Your inventory is empty.</div>
                <div className="inv-empty__sub">
                  Complete jobs to gather materials. Beginner Adventurer tasks drop herbs, wood, ore, and more.
                </div>
              </div>
            ) : (
              <div className="inv-grid">
                {entries.map(({ itemId, qty, name, category, description }) => (
                  <div key={itemId} className="inv-item">
                    <div className="inv-item__header">
                      <span className="inv-item__name">{name}</span>
                      <span
                        className="inv-item__category"
                        style={{ color: getCategoryColour(category) }}
                      >
                        {category}
                      </span>
                    </div>
                    <div className="inv-item__desc">{description}</div>
                    <div className="inv-item__qty">
                      <span className="inv-item__qty-label">In possession:</span>
                      <span className="inv-item__qty-value">× {qty}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ContentPanel>
        </div>

        <div className="nexis-column">
          <ContentPanel title="Summary">
            <div className="info-list">
              <div className="info-row">
                <span className="info-row__label">Item types</span>
                <span className="info-row__value">{entries.length}</span>
              </div>
              <div className="info-row">
                <span className="info-row__label">Total items</span>
                <span className="info-row__value">
                  {entries.reduce((sum, e) => sum + e.qty, 0)}
                </span>
              </div>
            </div>

            <div className="inv-categories">
              <div className="inv-categories__title">By category</div>
              {Object.entries(
                entries.reduce<Record<string, number>>((acc, e) => {
                  acc[e.category] = (acc[e.category] ?? 0) + e.qty;
                  return acc;
                }, {})
              ).map(([cat, total]) => (
                <div key={cat} className="inv-cat-row">
                  <span
                    className="inv-cat-row__label"
                    style={{ color: getCategoryColour(cat) }}
                  >
                    {cat}
                  </span>
                  <span className="inv-cat-row__count">{total}</span>
                </div>
              ))}
              {isEmpty && (
                <div className="inv-cat-row inv-cat-row--empty">Nothing yet.</div>
              )}
            </div>
          </ContentPanel>
        </div>
      </div>
    </AppShell>
  );
}
