import { FOOD_IMAGES, LOCATIONS, VENDORS } from "../constants/data";
import { stockPct, priorityColor, daysUntilExpiry, expiryColor } from "../utils/helpers";
import { StockBar } from "./StockBar";

const btnStyle = (bg, border) => ({
  flex: 1, padding: "6px 0", fontSize: 12, fontWeight: 600,
  background: bg, border: `1px solid ${border}`, color: border,
  borderRadius: 6, cursor: "pointer"
});

export const ItemCard = ({ item, vendors, locations, onCheckout, onRestock, role }) => {
  const vendor = vendors.find(v => v.id === item.vendor_id);
  const loc = locations.find(l => l.id === item.location_id);
  const days = daysUntilExpiry(item.expiry_date);
  const pct = stockPct(item);

  return (
    <div style={{
      background: "#0f172a", border: `1px solid ${pct <= 20 ? "#ef444440" : "#1e293b"}`,
      borderRadius: 12, overflow: "hidden", transition: "border-color 0.2s",
      boxShadow: pct <= 20 ? "0 0 20px #ef444415" : "none"
    }}>
      <div style={{ position: "relative", height: 140, overflow: "hidden" }}>
        <img
          src={FOOD_IMAGES[item.name] || "/images/food-fallback.svg"}
          alt={item.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={e => {
            if (!e.target.src.includes("/images/food-fallback.svg")) {
              e.target.src = "/images/food-fallback.svg";
            }
          }}
        />
        <div style={{ position: "absolute", top: 8, left: 8 }}>
          <span style={{
            background: priorityColor(item.priority), color: "#fff",
            fontSize: 10, padding: "2px 8px", borderRadius: 4, fontWeight: 700
          }}>{item.priority.toUpperCase()}</span>
        </div>
        {pct <= 20 && (
          <div style={{
            position: "absolute", top: 8, right: 8, background: "#ef4444",
            borderRadius: 4, padding: "2px 8px", fontSize: 10, color: "#fff",
            fontWeight: 700
          }}>
            LOW STOCK
          </div>
        )}
      </div>
      <div style={{ padding: 14 }}>
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "flex-start", marginBottom: 8
        }}>
          <div>
            <div style={{
              color: "#f1f5f9", fontWeight: 700, fontSize: 15
            }}>{item.name}</div>
            <div style={{
              color: "#64748b", fontSize: 11, marginTop: 2
            }}>{item.category} • {loc?.name || "—"}</div>
          </div>
          <div style={{
            fontSize: 10, color: expiryColor(days), textAlign: "right"
          }}>
            <div>EXP</div>
            <div style={{ fontWeight: 700 }}>{days}d</div>
          </div>
        </div>
        <StockBar item={item} />
        <div style={{
          display: "flex", justifyContent: "space-between",
          marginTop: 10, fontSize: 11, color: "#475569"
        }}>
          <span>Min: {item.min_required} {item.unit}</span>
          <span>🏭 {vendor?.name?.split(" ")[0] || "—"}</span>
        </div>
        <div style={{
          fontSize: 10, color: "#334155", marginTop: 4
        }}>📌 {item.barcode}</div>
        {role !== "vendor" && (
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            {(role === "officer" || role === "admin") && (
              <>
                <button onClick={() => onCheckout(item)} style={btnStyle("#ef444415", "#ef4444")}>
                  Checkout
                </button>
                <button onClick={() => onRestock(item)} style={btnStyle("#22c55e15", "#22c55e")}>
                  + Restock
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
