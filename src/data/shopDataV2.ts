export type ShopType = "general_store" | "arms_dealer" | "black_market";
export type ShopRegion = "nexis" | "abroad";

export type ShopInventoryItemV2 = {
  itemId: string;
  stock: number;
  maxStock: number;
  restockRate: number;
  priceMultiplier: number;
};

export type ShopV2 = {
  id: string;
  name: string;
  type: ShopType;
  region: ShopRegion;
  location: string;
  description: string;
  inventory: ShopInventoryItemV2[];
};

export const shopsV2: ShopV2[] = [
  {
    id: "nexis_general_store",
    name: "Nexis General Store",
    type: "general_store",
    region: "nexis",
    location: "Nexis",
    description: "Reliable supplies for everyday needs.",
    inventory: [
      { itemId: "bread_loaf", stock: 60, maxStock: 60, restockRate: 12, priceMultiplier: 1 },
      { itemId: "water_flask", stock: 80, maxStock: 80, restockRate: 16, priceMultiplier: 1 },
      { itemId: "beer_mug", stock: 100, maxStock: 100, restockRate: 20, priceMultiplier: 1 },
      { itemId: "field_bandage", stock: 50, maxStock: 50, restockRate: 10, priceMultiplier: 1 },
      { itemId: "healing_herb", stock: 80, maxStock: 80, restockRate: 16, priceMultiplier: 1 },
      { itemId: "minor_potion", stock: 40, maxStock: 40, restockRate: 8, priceMultiplier: 1.05 },
      { itemId: "stamina_draught", stock: 35, maxStock: 35, restockRate: 7, priceMultiplier: 1.15 }
    ]
  },
  {
    id: "nexis_arms_dealer",
    name: "Nexis Arms Dealer",
    type: "arms_dealer",
    region: "nexis",
    location: "Nexis",
    description: "Basic weapons, armor, and practical defense tools.",
    inventory: [
      { itemId: "iron_sword", stock: 12, maxStock: 12, restockRate: 2, priceMultiplier: 1.1 },
      { itemId: "leather_armor", stock: 10, maxStock: 10, restockRate: 2, priceMultiplier: 1.1 },
      { itemId: "iron_ingot", stock: 40, maxStock: 40, restockRate: 8, priceMultiplier: 1.05 }
    ]
  },
  {
    id: "nexis_black_market",
    name: "Nexis Black Market",
    type: "black_market",
    region: "nexis",
    location: "Nexis",
    description: "Hidden traders dealing in restricted goods and suspicious imports.",
    inventory: [
      { itemId: "ember_dust", stock: 4, maxStock: 4, restockRate: 1, priceMultiplier: 1.35 },
      { itemId: "shadow_bloom_extract", stock: 3, maxStock: 3, restockRate: 1, priceMultiplier: 1.4 }
    ]
  },
  {
    id: "port_general_store",
    name: "Port General Store",
    type: "general_store",
    region: "abroad",
    location: "Port Meridian",
    description: "Imported staples and regional curios from abroad.",
    inventory: [
      { itemId: "amber_spice", stock: 14, maxStock: 14, restockRate: 3, priceMultiplier: 1 },
      { itemId: "silk_bloom_tea", stock: 10, maxStock: 10, restockRate: 2, priceMultiplier: 1.05 },
      { itemId: "smoked_skyfish", stock: 8, maxStock: 8, restockRate: 2, priceMultiplier: 1.1 }
    ]
  },
  {
    id: "port_arms_dealer",
    name: "Port Arms Dealer",
    type: "arms_dealer",
    region: "abroad",
    location: "Port Meridian",
    description: "Foreign arms stock with practical resale value back home.",
    inventory: [
      { itemId: "iron_sword", stock: 6, maxStock: 6, restockRate: 1, priceMultiplier: 0.95 },
      { itemId: "leather_armor", stock: 5, maxStock: 5, restockRate: 1, priceMultiplier: 0.95 }
    ]
  },
  {
    id: "port_black_market",
    name: "Port Black Market",
    type: "black_market",
    region: "abroad",
    location: "Port Meridian",
    description: "Contraband stock intended for smuggling, not bulk convenience buying.",
    inventory: [
      { itemId: "ember_dust", stock: 5, maxStock: 5, restockRate: 1, priceMultiplier: 1 },
      { itemId: "shadow_bloom_extract", stock: 4, maxStock: 4, restockRate: 1, priceMultiplier: 1.05 },
      { itemId: "forged_waypass", stock: 2, maxStock: 2, restockRate: 1, priceMultiplier: 1.15 },
      { itemId: "smuggled_sigil_case", stock: 2, maxStock: 2, restockRate: 1, priceMultiplier: 1.2 }
    ]
  }
];

export function getShopByIdV2(id: string) {
  return shopsV2.find((shop) => shop.id === id);
}

export function getShopsByRegion(region: ShopRegion) {
  return shopsV2.filter((shop) => shop.region === region);
}
