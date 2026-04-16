export type ConsortiumEffects = {
  travelGoodsCapacityBonus?: number;
  standardTradeMarginBonus?: number;
  illicitHandlingBonus?: number;
  craftingEfficiencyBonus?: number;
  recoverySupportBonus?: number;
  routeKnowledgeBonus?: number;
  caravanLossReduction?: number;
};

export const consortiumEffectsById: Record<string, ConsortiumEffects> = {
  merchant_consortium: {
    standardTradeMarginBonus: 0.08,
  },
  caravan_consortium: {
    travelGoodsCapacityBonus: 2,
    caravanLossReduction: 0.1,
  },
  smithing_consortium: {
    craftingEfficiencyBonus: 0.1,
  },
  healing_consortium: {
    recoverySupportBonus: 0.1,
  },
  arcane_research_consortium: {
    illicitHandlingBonus: 0.05,
  },
  security_consortium: {
    caravanLossReduction: 0.06,
  },
  exploration_consortium: {
    routeKnowledgeBonus: 0.1,
  },
};

export function getConsortiumEffectsById(id: string): ConsortiumEffects {
  return consortiumEffectsById[id] ?? {};
}
