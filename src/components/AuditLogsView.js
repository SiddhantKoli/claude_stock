import { USERS } from "../constants/data";
import { fmt, statusColor } from "../utils/helpers";

export const AuditView = ({ audit, items }) => (
  <div style={{
    background: "#0f172a", border: "1px solid #1e293b",
    borderRadius: 12, padding: 20
  }}>
    <div style={{
      color: "#94a3b8", fontSize: 12, fontWeight: 600, marginBottom: 16
    }}>📊 FULL STOCK AUDIT TRAIL</div>
    <div style={{ overflowX: "auto" }}>
      <table style={{
        width: "100%", borderCollapse: "collapse", fontSize: 12
      }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #334155" }}>
            {["Time", "Item", "Action", "Qty", "By", "Notes"].map(h => (
              <th key={h} style={{
                color: "#64748b", textAlign: "left",
                padding: "8px 12px", fontWeight: 600, fontSize: 11
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...audit].reverse().map(a => {
            const item = items.find(i => i.id === a.food_item_id);
            const actionColors = {
              Added: "#22c55e", Removed: "#ef4444", Ordered: "#3b82f6",
              Delivered: "#22c55e", Adjusted: "#f97316", Expired: "#64748b"
            };
            return (
              <tr key={a.id} style={{ borderBottom: "1px solid #0f172a" }}>
                <td style={{
                  color: "#64748b", padding: "10px 12px"
                }}>{new Date(a.ts).toLocaleString("en-IN")}</td>
                <td style={{
                  color: "#f1f5f9", padding: "10px 12px", fontWeight: 600
                }}>{item?.name || "—"}</td>
                <td style={{ padding: "10px 12px" }}>
                  <span style={{
                    color: actionColors[a.action] || "#94a3b8",
                    background: (actionColors[a.action] || "#94a3b8") + "20",
                    padding: "2px 8px", borderRadius: 4
                  }}>{a.action}</span>
                </td>
                <td style={{
                  color: "#94a3b8", padding: "10px 12px"
                }}>{a.qty} {item?.unit}</td>
                <td style={{
                  color: "#64748b", padding: "10px 12px"
                }}>{a.by}</td>
                <td style={{
                  color: "#475569", padding: "10px 12px"
                }}>{a.notes}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

export const LogsView = ({ logs, items, USERS: users }) => (
  <div style={{
    background: "#0f172a", border: "1px solid #1e293b",
    borderRadius: 12, padding: 20
  }}>
    <div style={{
      color: "#94a3b8", fontSize: 12, fontWeight: 600, marginBottom: 16
    }}>📤 CHECKOUT LOGS (ADMIN ONLY)</div>
    <table style={{
      width: "100%", borderCollapse: "collapse", fontSize: 12
    }}>
      <thead>
        <tr style={{ borderBottom: "1px solid #334155" }}>
          {["Time", "Officer", "Item", "Qty", "Reason"].map(h => (
            <th key={h} style={{
              color: "#64748b", textAlign: "left",
              padding: "8px 12px", fontWeight: 600, fontSize: 11
            }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[...logs].reverse().map(l => {
          const item = items.find(i => i.id === l.food_item_id);
          const officer = USERS.find(u => u.id === l.officer_id);
          return (
            <tr key={l.id} style={{ borderBottom: "1px solid #0f172a" }}>
              <td style={{
                color: "#64748b", padding: "10px 12px"
              }}>{new Date(l.timestamp).toLocaleString("en-IN")}</td>
              <td style={{
                color: "#f1f5f9", padding: "10px 12px"
              }}>{officer?.name || "—"}</td>
              <td style={{
                color: "#94a3b8", padding: "10px 12px"
              }}>{item?.name || "—"}</td>
              <td style={{
                color: "#ef4444", padding: "10px 12px"
              }}>-{l.qty} {item?.unit}</td>
              <td style={{
                color: "#64748b", padding: "10px 12px"
              }}>{l.reason}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);
