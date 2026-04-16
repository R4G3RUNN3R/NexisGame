import { useMemo, useState } from "react";
import { shopsV2, type ShopV2 } from "../../data/shopDataV2";
import { getItemByIdV2 } from "../../data/itemDataV2";
import { createEmptyInventory, type InventoryState } from "../../state/inventorySystem";
import { buyFromShop, type ShopSystemState } from "../../state/shopSystem";
import { formatCurrencyCompact } from "../../data/economyData";
import { getRemainingDailyShopPurchases } from "../../state/shopLimitSystem";
import { getRemainingDailyBlackMarketPurchases } from "../../state/blackMarketLimitSystem";
import { countTravelGoodsInInventory } from "../../state/travelImportSystem";
import { getTravelGoodsCapacity } from "../../state/travelCapacitySystem";

const STARTING_GOLD = 100;

function describeShopType(type: ShopV2["type"]) {
  switch (type) {
    case "general_store":
      return "General Store";
    case "arms_dealer":
      return "Arms Dealer";
    case "black_market":
      return "Black Market";
    default:
      return type;
  }
}

export default function ShopPurchasePanel() {
  const [selectedShopId, setSelectedShopId] = useState(shopsV2[0]?.id ?? "");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [resultMessage, setResultMessage] = useState<string>("");
  const [state, setState] = useState<ShopSystemState>({
    gold: STARTING_GOLD,
    inventory: createEmptyInventory(),
  });

  const selectedShop = useMemo(
    () => shopsV2.find((shop) => shop.id === selectedShopId) ?? shopsV2[0],
    [selectedShopId],
  );

  const travelGoodsCount = countTravelGoodsInInventory(state.inventory);
  const travelGoodsCapacity = getTravelGoodsCapacity();
  const remainingStandard = getRemainingDailyShopPurchases(state.standardShopWindow);
  const remainingBlackMarket = getRemainingDailyBlackMarketPurchases(state.blackMarketWindow);

  function setQuantity(itemId: string, value: number) {
    setQuantities((current) => ({
      ...current,
      [itemId]: Math.max(1, Math.floor(value) || 1),
    }));
  }

  function handleBuy(itemId: string) {
    if (!selectedShop) return;
    const quantity = quantities[itemId] ?? 1;
    const result = buyFromShop(state, selectedShop.id, itemId, quantity, {
      currentTravelGoods: travelGoodsCount,
      travelCapacityModifiers: {},
    });

    if (!result.ok || !result.nextState) {
      setResultMessage(result.reason ?? "Purchase failed.");
      return;
    }

    setState(result.nextState);
    const item = getItemByIdV2(itemId);
    setResultMessage(
      `Bought ${quantity}x ${item?.name ?? itemId} for ${formatCurrencyCompact({ copper: result.totalCostCopper ?? 0 })}.`,
    );
  }

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div
        style={{
          display: "grid",
          gap: 8,
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 8,
          padding: 12,
          background: "rgba(7, 13, 20, 0.55)",
        }}
      >
        <div><strong>Gold:</strong> {state.gold.toFixed(2)}</div>
        <div><strong>Standard shop remaining:</strong> {remainingStandard} / 100</div>
        <div><strong>Black market remaining:</strong> {remainingBlackMarket} / 5</div>
        <div><strong>Travel goods carried:</strong> {travelGoodsCount} / {travelGoodsCapacity}</div>
        {resultMessage ? <div style={{ color: "#b7c3cf" }}>{resultMessage}</div> : null}
      </div>

      <div>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Choose Shop</span>
          <select value={selectedShopId} onChange={(e) => setSelectedShopId(e.target.value)}>
            {shopsV2.map((shop) => (
              <option key={shop.id} value={shop.id}>
                {shop.name} · {describeShopType(shop.type)} · {shop.location}
              </option>
            ))}
          </select>
        </label>
      </div>

      {selectedShop ? (
        <div
          style={{
            display: "grid",
            gap: 10,
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8,
            padding: 12,
            background: "rgba(7, 13, 20, 0.55)",
          }}
        >
          <div>
            <strong>{selectedShop.name}</strong>
            <div style={{ fontSize: 13, color: "#b7c3cf" }}>{selectedShop.description}</div>
          </div>

          {selectedShop.inventory.map((entry) => {
            const item = getItemByIdV2(entry.itemId);
            if (!item) return null;
            const unitPriceCopper = Math.ceil(item.baseValue * entry.priceMultiplier);
            const quantity = quantities[entry.itemId] ?? 1;

            return (
              <div
                key={entry.itemId}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.6fr 0.8fr 0.8fr auto",
                  gap: 10,
                  alignItems: "center",
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                  paddingTop: 10,
                }}
              >
                <div>
                  <div style={{ fontWeight: 700 }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: "#b7c3cf" }}>{item.description}</div>
                  <div style={{ fontSize: 12, color: "#b7c3cf" }}>
                    {item.isIllicit ? "Illicit" : item.isTravelGood ? "Travel Good" : item.category}
                  </div>
                </div>
                <div>
                  <div>{formatCurrencyCompact({ copper: unitPriceCopper })}</div>
                  <div style={{ fontSize: 12, color: "#b7c3cf" }}>Stock {entry.stock}/{entry.maxStock}</div>
                </div>
                <input
                  type="number"
                  min={1}
                  max={entry.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(entry.itemId, Number(e.target.value))}
                />
                <button type="button" onClick={() => handleBuy(entry.itemId)}>
                  Buy
                </button>
              </div>
            );
          })}
        </div>
      ) : null}

      <div
        style={{
          display: "grid",
          gap: 6,
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 8,
          padding: 12,
          background: "rgba(7, 13, 20, 0.55)",
        }}
      >
        <strong>Inventory Preview</strong>
        {state.inventory.entries.length === 0 ? (
          <div style={{ color: "#b7c3cf" }}>No items yet.</div>
        ) : (
          state.inventory.entries.map((entry) => {
            const item = getItemByIdV2(entry.itemId);
            return (
              <div key={entry.itemId} style={{ fontSize: 13 }}>
                {item?.name ?? entry.itemId} × {entry.quantity}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
