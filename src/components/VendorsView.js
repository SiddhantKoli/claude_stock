import { VENDORS } from "../constants/data";

export const VendorsView = ({ VENDORS: vendors, items, orders, sendEmail, toast }) => {
  return (
    <div>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: 16
      }}>
        {VENDORS.map(v => {
          const vItems = items.filter(i => i.vendor_id === v.id);
          const vOrders = orders.filter(o => o.vendor_id === v.id);
          return (
            <div key={v.id} style={{
              background: "#0f172a", border: "1px solid #1e293b",
              borderRadius: 12, padding: 20
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 12, marginBottom: 16
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: "#22c55e20", display: "flex",
                  alignItems: "center", justifyContent: "center", fontSize: 20
                }}>🏭</div>
                <div>
                  <div style={{
                    color: "#f1f5f9", fontWeight: 700
                  }}>{v.name}</div>
                  <div style={{
                    color: "#64748b", fontSize: 12
                  }}>{v.email}</div>
                </div>
              </div>
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                gap: 10, marginBottom: 16
              }}>
                {[
                  { label: "Items", value: vItems.length },
                  { label: "Orders", value: vOrders.length },
                  { label: "Rating", value: v.rating + "★" }
                ].map(s => (
                  <div key={s.label} style={{
                    background: "#0a0f1e", borderRadius: 8,
                    padding: "10px 8px", textAlign: "center"
                  }}>
                    <div style={{
                      color: "#22c55e", fontSize: 18, fontWeight: 700
                    }}>{s.value}</div>
                    <div style={{
                      color: "#64748b", fontSize: 10
                    }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ color: "#64748b", fontSize: 12 }}>
                <div>📞 {v.phone}</div>
                <div style={{ marginTop: 6 }}>
                  Items: {vItems.map(i => i.name).join(", ") || "None"}
                </div>
              </div>
              <button onClick={async () => {
                await sendEmail(v.email, "Vendor Status Check",
                  `Status inquiry for vendor ${v.name}`);
                toast("Email sent to vendor");
              }}
                style={{
                  marginTop: 12, width: "100%", padding: "8px",
                  background: "#3b82f615", border: "1px solid #3b82f6",
                  borderRadius: 8, color: "#3b82f6", cursor: "pointer",
                  fontSize: 12
                }}>
                📧 Contact Vendor
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
