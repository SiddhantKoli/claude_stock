export const Header = ({
  user, lowStockItems, emails, emailPanel,
  setEmailPanel, setUser, setPage
}) => (
  <div style={{
    background: "#0a0f1e", borderBottom: "1px solid #1e293b",
    padding: "12px 24px", display: "flex", alignItems: "center",
    justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <span style={{ fontSize: 24 }}>🎖️</span>
      <div>
        <div style={{
          color: "#22c55e", fontSize: 11, letterSpacing: 3, fontWeight: 700
        }}>ARMED FORCES</div>
        <div style={{
          color: "#f1f5f9", fontSize: 16, fontWeight: 700, lineHeight: 1.2
        }}>FOOD INVENTORY MGMT</div>
      </div>
    </div>
    <div style={{
      display: "flex", alignItems: "center", gap: 16
    }}>
      {lowStockItems.length > 0 && (
        <div style={{
          background: "#ef444415", border: "1px solid #ef4444",
          borderRadius: 8, padding: "4px 12px", color: "#ef4444",
          fontSize: 12, fontWeight: 600
        }}>
          ⚠ {lowStockItems.length} LOW STOCK
        </div>
      )}
      <button onClick={() => setEmailPanel(p => !p)} style={{
        background: "#1e293b", border: "1px solid #334155",
        borderRadius: 8, padding: "6px 12px", color: "#94a3b8",
        cursor: "pointer", fontSize: 12
      }}>
        📧 {emails.length} emails
      </button>
      <div style={{ color: "#94a3b8", fontSize: 12 }}>
        <span style={{ color: "#22c55e" }}>●</span> {user.name}
        <span style={{
          background: "#1e293b", borderRadius: 4, padding: "2px 8px",
          marginLeft: 8, color: "#64748b", fontSize: 10, textTransform: "uppercase"
        }}>{user.role}</span>
      </div>
      <button onClick={() => {
        setUser(null);
        setPage("login");
      }} style={{
        background: "none", border: "1px solid #334155", borderRadius: 6,
        padding: "4px 12px", color: "#64748b", cursor: "pointer", fontSize: 12
      }}>
        Logout
      </button>
    </div>
  </div>
);
