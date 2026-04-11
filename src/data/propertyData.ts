// ─────────────────────────────────────────────────────────────────────────────
// Nexis — Property Data
// Housing progression with material requirements for upgrades.
// ─────────────────────────────────────────────────────────────────────────────

export type UpgradeRequirement = {
  itemId: string;
  qty: number;
};

export type PropertyUpgrade = {
  id: string;
  name: string;
  description: string;
  cost: number;
  comfortBonus: number;
  effects: string[];
  requirements?: UpgradeRequirement[];
};

export type PropertyTier = {
  id: string;
  name: string;
  price: number;
  baseComfort: number;
  maxComfort: number;
  upkeepPerDay: number;
  summary: string;
  flavour: string;
  icon: string;
  upgradeSlots: number;
  upgrades: PropertyUpgrade[];
};

export const propertyTiers: PropertyTier[] = [
  {
    id: "shack",
    name: "Shack",
    price: 0,
    baseComfort: 100,
    maxComfort: 100,
    upkeepPerDay: 0,
    summary: "Rough shelter. Keeps the rain off, barely.",
    flavour:
      "A single crooked room with a straw pallet, a cracked window, and a bucket for when it leaks. It is free. That is all it has going for it.",
    icon: "🪵",
    upgradeSlots: 0,
    upgrades: [],
  },
  {
    id: "cottage",
    name: "Cottage",
    price: 4_000,
    baseComfort: 250,
    maxComfort: 400,
    upkeepPerDay: 25,
    summary: "A humble home for a person trying to look respectable.",
    flavour:
      "Whitewashed walls, a proper bed, and a hearth that actually draws. Small, but yours.",
    icon: "🏡",
    upgradeSlots: 2,
    upgrades: [
      {
        id: "cottage-hearth",
        name: "Stone Hearth",
        description: "A proper stone fireplace that keeps the cottage warm through winter.",
        cost: 800,
        comfortBonus: 60,
        effects: ["+20 max comfort", "Passive warmth"],
        requirements: [
          { itemId: "stone_block", qty: 8 },
          { itemId: "clay", qty: 5 },
        ],
      },
      {
        id: "cottage-garden",
        name: "Garden Plot",
        description: "A small vegetable and herb garden.",
        cost: 600,
        comfortBonus: 90,
        effects: ["+30 max comfort", "Produces herbs later"],
        requirements: [
          { itemId: "rough_wood", qty: 6 },
          { itemId: "wild_herb", qty: 5 },
        ],
      },
    ],
  },
  {
    id: "townhouse",
    name: "Townhouse",
    price: 18_000,
    baseComfort: 500,
    maxComfort: 800,
    upkeepPerDay: 80,
    summary: "A sturdier urban residence with room to breathe.",
    flavour:
      "Three floors, a study, and a larder that stays stocked. Respectable address within the city walls.",
    icon: "🏘️",
    upgradeSlots: 3,
    upgrades: [
      {
        id: "townhouse-study",
        name: "Furnished Study",
        description: "Bookshelves, desk, and decent light for study.",
        cost: 2_500,
        comfortBonus: 80,
        effects: ["+30 max comfort", "+5% Education speed later"],
        requirements: [
          { itemId: "hardwood", qty: 8 },
          { itemId: "vial_of_ink", qty: 3 },
        ],
      },
      {
        id: "townhouse-cellar",
        name: "Storage Cellar",
        description: "Dry underground storage for goods and supplies.",
        cost: 3_200,
        comfortBonus: 80,
        effects: ["+20 max comfort", "+storage later"],
        requirements: [
          { itemId: "stone_block", qty: 12 },
          { itemId: "iron_ore", qty: 6 },
        ],
      },
      {
        id: "townhouse-guest",
        name: "Guest Room",
        description: "A furnished spare room for trusted contacts.",
        cost: 2_000,
        comfortBonus: 140,
        effects: ["+30 max comfort", "Future social hosting"],
        requirements: [
          { itemId: "treated_leather", qty: 4 },
          { itemId: "hardwood", qty: 6 },
        ],
      },
    ],
  },
  {
    id: "merchant-house",
    name: "Merchant House",
    price: 65_000,
    baseComfort: 800,
    maxComfort: 1_400,
    upkeepPerDay: 200,
    summary: "A proper city residence with status and storage.",
    flavour:
      "Wide windows, a vaulted storeroom, and enough rooms to impress a guild master.",
    icon: "🏗️",
    upgradeSlots: 4,
    upgrades: [
      {
        id: "mhouse-vault",
        name: "Vault Room",
        description: "Reinforced room with iron-banded door.",
        cost: 8_000,
        comfortBonus: 80,
        effects: ["+20 max comfort", "Future secure storage"],
        requirements: [
          { itemId: "refined_iron", qty: 8 },
          { itemId: "structural_reinforcement_kit", qty: 1 },
        ],
      },
      {
        id: "mhouse-workshop",
        name: "Craftsman Workshop",
        description: "A real workbench and tooling set for skilled profession work.",
        cost: 12_000,
        comfortBonus: 120,
        effects: ["+30 max comfort", "+10% Profession XP later"],
        requirements: [
          { itemId: "hardwood", qty: 10 },
          { itemId: "iron_ore", qty: 12 },
          { itemId: "alchemical_powder", qty: 2 },
        ],
      },
      {
        id: "mhouse-garden",
        name: "Walled Garden",
        description: "A private courtyard garden for herbs and comfort.",
        cost: 6_000,
        comfortBonus: 200,
        effects: ["+50 max comfort", "Produces rare herbs later"],
        requirements: [
          { itemId: "stone_block", qty: 10 },
          { itemId: "medicinal_herb", qty: 8 },
        ],
      },
      {
        id: "mhouse-staff",
        name: "Live-in Staff",
        description: "A cook and steward who maintain the property.",
        cost: 10_000,
        comfortBonus: 200,
        effects: ["+50 max comfort", "+comfort regeneration later"],
        requirements: [
          { itemId: "rare_gemstone", qty: 1 },
          { itemId: "refined_iron", qty: 4 },
        ],
      },
    ],
  },
  {
    id: "manor",
    name: "Manor",
    price: 250_000,
    baseComfort: 1_400,
    maxComfort: 2_400,
    upkeepPerDay: 600,
    summary: "Country prestige, guest space, and real comfort.",
    flavour:
      "Rolling grounds, a stable block, servants' quarters, and a hall large enough to host the guild.",
    icon: "🏛️",
    upgradeSlots: 5,
    upgrades: [
      {
        id: "manor-stable",
        name: "Stables",
        description: "Stabled horses for future travel bonuses.",
        cost: 20_000,
        comfortBonus: 120,
        effects: ["+30 max comfort", "Travel time reduced later"],
        requirements: [
          { itemId: "hardwood", qty: 14 },
          { itemId: "treated_leather", qty: 10 },
        ],
      },
      {
        id: "manor-training",
        name: "Training Ground",
        description: "Outdoor yard for combat drills.",
        cost: 35_000,
        comfortBonus: 120,
        effects: ["+30 max comfort", "+battle training later"],
        requirements: [
          { itemId: "stone_block", qty: 18 },
          { itemId: "iron_ore", qty: 12 },
          { itemId: "refined_iron", qty: 6 },
        ],
      },
      {
        id: "manor-library",
        name: "Private Library",
        description: "A substantial personal library.",
        cost: 28_000,
        comfortBonus: 200,
        effects: ["+40 max comfort", "+education later"],
        requirements: [
          { itemId: "hardwood", qty: 12 },
          { itemId: "vial_of_ink", qty: 6 },
          { itemId: "ancient_fragment", qty: 2 },
        ],
      },
      {
        id: "manor-infirmary",
        name: "Manor Infirmary",
        description: "A private medical room with trained attendant.",
        cost: 40_000,
        comfortBonus: 280,
        effects: ["+50 max comfort", "Hospital time reduced later"],
        requirements: [
          { itemId: "medicinal_herb", qty: 12 },
          { itemId: "healing_root", qty: 6 },
          { itemId: "mana_crystal", qty: 1 },
        ],
      },
      {
        id: "manor-vault",
        name: "Reinforced Vault",
        description: "Bank-grade vault room inside the manor.",
        cost: 30_000,
        comfortBonus: 280,
        effects: ["+50 max comfort", "Large gold storage later"],
        requirements: [
          { itemId: "refined_iron", qty: 12 },
          { itemId: "foundation_keystone", qty: 1 },
        ],
      },
    ],
  },
  {
    id: "keep",
    name: "Keep",
    price: 900_000,
    baseComfort: 2_200,
    maxComfort: 3_600,
    upkeepPerDay: 1_800,
    summary: "Defensible, imposing, suitable for serious influence.",
    flavour:
      "Stone walls, gatehouse, great hall, and a tower seen from the city.",
    icon: "🏰",
    upgradeSlots: 6,
    upgrades: [
      {
        id: "keep-dungeon",
        name: "Dungeon Cells",
        description: "Holding cells beneath the keep.",
        cost: 80_000,
        comfortBonus: 0,
        effects: ["Future captive holding", "Intimidation passive later"],
        requirements: [
          { itemId: "stone_block", qty: 24 },
          { itemId: "refined_iron", qty: 14 },
        ],
      },
      {
        id: "keep-armory",
        name: "Armory",
        description: "Weapon and armour storage with maintenance benches.",
        cost: 70_000,
        comfortBonus: 250,
        effects: ["+50 max comfort", "Weapon bonuses later"],
        requirements: [
          { itemId: "refined_iron", qty: 16 },
          { itemId: "structural_reinforcement_kit", qty: 1 },
        ],
      },
      {
        id: "keep-gatehouse",
        name: "Reinforced Gatehouse",
        description: "Fortified entry with killing lanes and firing slits.",
        cost: 60_000,
        comfortBonus: 150,
        effects: ["+30 max comfort", "Raid defense later"],
        requirements: [
          { itemId: "stone_block", qty: 20 },
          { itemId: "hardwood", qty: 12 },
        ],
      },
      {
        id: "keep-chapel",
        name: "Private Chapel",
        description: "A vaulted chapel for reflection and spiritual focus.",
        cost: 55_000,
        comfortBonus: 350,
        effects: ["+70 max comfort", "+spirit systems later"],
        requirements: [
          { itemId: "runed_stone", qty: 2 },
          { itemId: "mana_crystal", qty: 2 },
        ],
      },
      {
        id: "keep-bathhouse",
        name: "Bathhouse",
        description: "Hot spring–fed baths inside the keep walls.",
        cost: 65_000,
        comfortBonus: 400,
        effects: ["+80 max comfort", "+comfort regen later"],
        requirements: [
          { itemId: "stone_block", qty: 16 },
          { itemId: "clay", qty: 10 },
          { itemId: "mana_crystal", qty: 1 },
        ],
      },
      {
        id: "keep-observatory",
        name: "Observatory",
        description: "A tower-top observatory for study and intelligence work.",
        cost: 90_000,
        comfortBonus: 250,
        effects: ["+20 max comfort", "+intelligence gains later"],
        requirements: [
          { itemId: "runed_stone", qty: 3 },
          { itemId: "ancient_fragment", qty: 3 },
        ],
      },
    ],
  },
  {
    id: "castle",
    name: "Castle",
    price: 3_500_000,
    baseComfort: 3_200,
    maxComfort: 5_000,
    upkeepPerDay: 6_000,
    summary: "Seat of power, prestige, and influence.",
    flavour:
      "Towers, outer walls, drawbridge, great hall, throne room. This is the pinnacle.",
    icon: "👑",
    upgradeSlots: 8,
    upgrades: [
      {
        id: "castle-throne",
        name: "Throne Room",
        description: "A lavish throne room for receiving dignitaries and guild masters.",
        cost: 250_000,
        comfortBonus: 400,
        effects: ["+100 max comfort", "Guild aura later"],
        requirements: [
          { itemId: "rare_gemstone", qty: 4 },
          { itemId: "foundation_keystone", qty: 1 },
        ],
      },
      {
        id: "castle-drawbridge",
        name: "Drawbridge & Moat",
        description: "The ultimate defensive addition.",
        cost: 300_000,
        comfortBonus: 150,
        effects: ["+50 max comfort", "Major siege defense later"],
        requirements: [
          { itemId: "structural_reinforcement_kit", qty: 2 },
          { itemId: "stone_block", qty: 32 },
        ],
      },
      {
        id: "castle-treasury",
        name: "Royal Treasury",
        description: "A vast underground vault beneath the castle.",
        cost: 400_000,
        comfortBonus: 150,
        effects: ["+50 max comfort", "Mass gold storage later"],
        requirements: [
          { itemId: "refined_iron", qty: 24 },
          { itemId: "arcane_anchor", qty: 1 },
        ],
      },
      {
        id: "castle-barracks",
        name: "Castle Barracks",
        description: "Permanent garrison of NPC guards.",
        cost: 350_000,
        comfortBonus: 200,
        effects: ["+50 max comfort", "Guards defend property later"],
        requirements: [
          { itemId: "hardwood", qty: 20 },
          { itemId: "refined_iron", qty: 18 },
        ],
      },
      {
        id: "castle-garden",
        name: "Royal Gardens",
        description: "Sweeping sculpted gardens visible from the city.",
        cost: 180_000,
        comfortBonus: 500,
        effects: ["+150 max comfort", "Rare crafting ingredients later"],
        requirements: [
          { itemId: "medicinal_herb", qty: 20 },
          { itemId: "healing_root", qty: 12 },
        ],
      },
      {
        id: "castle-alchemylab",
        name: "Alchemy Laboratory",
        description: "Fully-equipped laboratory for advanced potion and reagent work.",
        cost: 280_000,
        comfortBonus: 0,
        effects: ["Unlocks advanced alchemy later", "+Profession XP later"],
        requirements: [
          { itemId: "alchemical_powder", qty: 6 },
          { itemId: "mana_crystal", qty: 3 },
        ],
      },
      {
        id: "castle-archive",
        name: "Grand Archive",
        description: "The most complete library in Nexis outside the academies.",
        cost: 220_000,
        comfortBonus: 0,
        effects: ["+Education speed later", "Restricted tomes later"],
        requirements: [
          { itemId: "ancient_fragment", qty: 6 },
          { itemId: "runed_stone", qty: 4 },
        ],
      },
      {
        id: "castle-portal",
        name: "Waystone Chamber",
        description: "An enchanted chamber with a permanent waystone.",
        cost: 500_000,
        comfortBonus: 0,
        effects: ["Instant travel later", "No travel time cost later"],
        requirements: [
          { itemId: "arcane_anchor", qty: 1 },
          { itemId: "energy_conduit", qty: 2 },
          { itemId: "mana_crystal", qty: 6 },
        ],
      },
    ],
  },
];

export function formatGold(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M gold`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k gold`;
  return `${value} gold`;
}

export function getPropertyById(id: string): PropertyTier | undefined {
  return propertyTiers.find((p) => p.id === id);
}

export function formatPropertyPrice(value: number): string {
  return formatGold(value);
}
