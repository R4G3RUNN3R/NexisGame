export type Meter = {
  current: number;
  max: number;
};

export const activeAccount = {
  id: 0,
  name: "Wanderer",
  gold: 0,
  points: 0,
  level: 0,
  rank: "Unknown",
  ageDays: 0,
  maritalStatus: "Single",
  education: 0,
  manualLabor: 0,
  intelligence: 0,
  endurance: 0,
  strength: 0,
  dexterity: 0,
  defense: 0,
  speed: 0,
  energy: { current: 0, max: 100 } satisfies Meter,
  stamina: { current: 0, max: 10 } satisfies Meter,
  comfort: { current: 0, max: 100 } satisfies Meter,
  life: { current: 0, max: 100 } satisfies Meter,
};

export const playerFlags = {
  blackMarketUnlocked: false,
};

export function formatAccountMoney(value: number) {
  return `${value.toLocaleString("en-GB")}g`;
}
