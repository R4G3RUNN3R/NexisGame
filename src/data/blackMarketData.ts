export type BlackMarketListing = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "contraband" | "fenced_goods" | "rare_material" | "restricted_tool";
  stock: number;
  itemId?: string;
};

export const blackMarketListings: BlackMarketListing[] = [
  {
    id: "bm-forged-papers",
    name: "Forged Papers",
    description: "High-quality forged identity and travel papers. Useful for future covert systems and shady errands.",
    price: 4200,
    category: "contraband",
    stock: 3,
    itemId: "forged_document",
  },
  {
    id: "bm-mana-crystal",
    name: "Mana Crystal",
    description: "A tightly held magical crystal sold off-book at an ugly premium.",
    price: 9800,
    category: "rare_material",
    stock: 2,
    itemId: "mana_crystal",
  },
  {
    id: "bm-runed-stone",
    name: "Runed Stone",
    description: "A warded stone that should never have left formal channels. Convenient, really.",
    price: 11250,
    category: "rare_material",
    stock: 2,
    itemId: "runed_stone",
  },
  {
    id: "bm-lockpick-set",
    name: "Professional Lockpick Set",
    description: "Better than the basic junk most amateurs use. Future-proofed for higher-end covert systems.",
    price: 1850,
    category: "restricted_tool",
    stock: 4,
    itemId: "lockpick",
  },
  {
    id: "bm-fenced-gem",
    name: "Fenced Gemstone",
    description: "A gemstone that changed hands too quickly to have a clean story attached to it.",
    price: 7600,
    category: "fenced_goods",
    stock: 1,
    itemId: "rare_gemstone",
  },
  {
    id: "bm-alchemical-powder",
    name: "Alchemical Powder",
    description: "Volatile, useful, and sold through people with no concern for permits or safety.",
    price: 6400,
    category: "rare_material",
    stock: 3,
    itemId: "alchemical_powder",
  },
];
