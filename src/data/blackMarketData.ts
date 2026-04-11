export type BlackMarketGoodsCategory = "contraband" | "fenced_goods" | "rare_material" | "restricted_tool";

export type BlackMarketGoodsListing = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: BlackMarketGoodsCategory;
  stock: number;
  itemId?: string;
};

export type BlackMarketAuctionListing = {
  id: string;
  name: string;
  description: string;
  currentBid: number;
  category: "artifact" | "forbidden_relic" | "broker_lot";
  bidderCount: number;
  endsInLabel: string;
};

export type BlackMarketContract = {
  id: string;
  title: string;
  difficulty: "hard" | "severe" | "lethal";
  type: "smuggling" | "assassination" | "retrieval" | "sabotage";
  description: string;
  rewardSummary: string;
};

export const blackMarketGoodsListings: BlackMarketGoodsListing[] = [
  {
    id: "bm-forged-papers",
    name: "Forged Papers",
    description: "High-quality forged identity and travel papers. Useful for covert movement and quiet lies.",
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
    description: "Better than the basic junk most amateurs use. Suited for higher-end covert work.",
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

export const blackMarketAuctionListings: BlackMarketAuctionListing[] = [
  {
    id: "bma-obsidian-seal",
    name: "Obsidian Seal of the Veiled Magistrate",
    description: "A forbidden civic artifact tied to closed ledgers and erased warrants.",
    currentBid: 48000,
    category: "forbidden_relic",
    bidderCount: 4,
    endsInLabel: "6h 12m",
  },
  {
    id: "bma-sunken-idol",
    name: "Sunken Idol Fragment",
    description: "A relic shard dredged up from prohibited ruins and now being fenced to the highest fool.",
    currentBid: 72500,
    category: "artifact",
    bidderCount: 7,
    endsInLabel: "11h 03m",
  },
  {
    id: "bma-ledger-lot",
    name: "Broker Lot: Shadow Route Archive",
    description: "A sealed lot of underworld route records, manifests, and coded correspondences.",
    currentBid: 91000,
    category: "broker_lot",
    bidderCount: 2,
    endsInLabel: "1d 4h",
  },
];

export const blackMarketContracts: BlackMarketContract[] = [
  {
    id: "bmc-sable-run",
    title: "Sable Run",
    difficulty: "hard",
    type: "smuggling",
    description: "Move restricted cargo through a watched western route without inspection or loss.",
    rewardSummary: "High gold payout, contraband reputation, rare material chance",
  },
  {
    id: "bmc-red-ink",
    title: "Red Ink Settlement",
    difficulty: "severe",
    type: "assassination",
    description: "Eliminate a protected target before they testify against a broker network.",
    rewardSummary: "Large gold payout, black market standing, rare contract chain unlock",
  },
  {
    id: "bmc-cold-vault",
    title: "Cold Vault Retrieval",
    difficulty: "hard",
    type: "retrieval",
    description: "Recover a sealed artifact crate before city agents inventory the vault.",
    rewardSummary: "Gold, rare upgrade item, artifact clue chance",
  },
  {
    id: "bmc-chainbreak",
    title: "Chainbreak",
    difficulty: "lethal",
    type: "sabotage",
    description: "Cripple a lawful supply route without exposing the clients behind the job.",
    rewardSummary: "Extreme payout, underworld prestige, dangerous retaliation risk later",
  },
];
