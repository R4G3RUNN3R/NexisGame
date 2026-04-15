export type ItemCategory =
  | "consumable"
  | "weapon"
  | "armor"
  | "material"
  | "tool"
  | "misc";

export type Item = {
  id: string;
  name: string;
  category: ItemCategory;
  description: string;
  baseValue: number; // in copper
  stackable: boolean;
};

export const items: Item[] = [
  {
    id: "bread_loaf",
    name: "Loaf of Bread",
    category: "consumable",
    description: "Simple bread. Restores a small amount of energy.",
    baseValue: 50,
    stackable: true,
  },
  {
    id: "water_flask",
    name: "Water Flask",
    category: "consumable",
    description: "Clean drinking water.",
    baseValue: 25,
    stackable: true,
  },
  {
    id: "iron_sword",
    name: "Iron Sword",
    category: "weapon",
    description: "Standard issue iron blade.",
    baseValue: 5000,
    stackable: false,
  },
  {
    id: "leather_armor",
    name: "Leather Armor",
    category: "armor",
    description: "Basic protective gear.",
    baseValue: 3500,
    stackable: false,
  },
  {
    id: "timber_bundle",
    name: "Timber Bundle",
    category: "material",
    description: "Processed wood used for construction.",
    baseValue: 800,
    stackable: true,
  },
  {
    id: "iron_ingot",
    name: "Iron Ingot",
    category: "material",
    description: "Refined iron for crafting.",
    baseValue: 1200,
    stackable: true,
  }
];

export function getItemById(id: string) {
  return items.find((i) => i.id === id);
}
