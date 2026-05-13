import { BRANCHES, CATEGORIES, PRIORITIES, LOCATIONS, VENDORS, FOOD_IMAGES } from "../constants/data";
import { stockPct, priorityColor, daysUntilExpiry, expiryColor } from "../utils/helpers";
import { ItemCard } from "./ItemCard";

export const InventoryView = ({
  visibleItems, filterCat, filterPri, filterLoc, branch,
  setFilterCat, setFilterPri, setFilterLoc, setBranch,
  user, onCheckout, onRestock, onAddItem
}) => {
  return (
    <div>
      <div style={{
        display: "flex", gap: 8, marginBottom: 20,
        overflowX: "auto", paddingBottom: 4
      }}>
        {BRANCHES.map(b => (
          <button key={b} onClick={() => setBranch(b)} style={{
            padding: "8px 20px", borderRadius: 8, border: "1px solid",
            borderColor: branch === b ? "#22c55e" : "#334155",
            background: branch === b ? "#22c55e15" : "transparent",
            color: branch === b ? "#22c55e" : "#64748b",
            cursor: "pointer", fontWeight: 700, fontSize: 13, whiteSpace: "nowrap"
          }}>
            {b === "Air Defence" ? "✈ " : b === "Navy" ? "⚓ " : "🪖 "}
            {b.toUpperCase()}
          </button>
        ))}
      </div>

      <div style={{
        display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap"
      }}>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{
          background: "#1e293b", border: "1px solid #334155", borderRadius: 8,
          color: "#f1f5f9", fontSize: 12, padding: "6px 12px", marginBottom: 0,
          cursor: "pointer"
        }}>
          <option value="All">All Categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>

        <select value={filterPri} onChange={e => setFilterPri(e.target.value)} style={{
          background: "#1e293b", border: "1px solid #334155", borderRadius: 8,
          color: "#f1f5f9", fontSize: 12, padding: "6px 12px", marginBottom: 0,
          cursor: "pointer"
        }}>
          <option value="All">All Priorities</option>
          {PRIORITIES.map(p => <option key={p}>{p}</option>)}
        </select>

        <select value={filterLoc} onChange={e => setFilterLoc(e.target.value)} style={{
          background: "#1e293b", border: "1px solid #334155", borderRadius: 8,
          color: "#f1f5f9", fontSize: 12, padding: "6px 12px", marginBottom: 0,
          cursor: "pointer"
        }}>
          <option value="All">All Locations</option>
          {LOCATIONS.filter(l => l.branch === branch).map(l =>
            <option key={l.id} value={l.id}>{l.name}</option>
          )}
        </select>

        {user.role === "admin" && (
          <button onClick={onAddItem} style={{
            background: "#22c55e", border: "none", borderRadius: 8,
            padding: "6px 16px", color: "#052e16", fontWeight: 700,
            fontSize: 12, cursor: "pointer"
          }}>
            + Add Item
          </button>
        )}
      </div>

      {visibleItems.length === 0 ? (
        <div style={{
          textAlign: "center", color: "#334155", padding: 60, fontSize: 14
        }}>No items found for current filters</div>
      ) : (
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 16
        }}>
          {visibleItems.sort((a, b) => {
            const po = { Critical: 0, High: 1, Normal: 2 };
            return po[a.priority] - po[b.priority];
          }).map(item => (
            <ItemCard
              key={item.id} item={item} vendors={VENDORS} locations={LOCATIONS}
              role={user.role} onCheckout={onCheckout} onRestock={onRestock}
            />
          ))}
        </div>
      )}
    </div>
  );
};
