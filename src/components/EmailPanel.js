export const EmailPanel = ({ emails }) => (
  <div style={{
    background: "#0f172a", border: "1px solid #1e293b",
    borderRadius: 12, padding: 20, marginTop: 20
  }}>
    <div style={{
      color: "#94a3b8", fontSize: 12, fontWeight: 600, marginBottom: 16
    }}>📧 AUTOMATED EMAIL LOG</div>
    {emails.length === 0 ? (
      <div style={{
        color: "#334155", fontSize: 13, textAlign: "center", padding: 20
      }}>No emails sent yet</div>
    ) : (
      <div style={{
        display: "flex", flexDirection: "column", gap: 10,
        maxHeight: 300, overflowY: "auto"
      }}>
        {emails.slice().reverse().map((e, i) => (
          <div key={i} style={{
            background: "#0a0f1e", border: "1px solid #1e293b",
            borderRadius: 8, padding: 12
          }}>
            <div style={{
              display: "flex", justifyContent: "space-between", marginBottom: 6
            }}>
              <span style={{
                color: "#3b82f6", fontSize: 11, fontWeight: 600
              }}>{e.subject}</span>
              <span style={{
                color: "#334155", fontSize: 10
              }}>{new Date(e.ts).toLocaleTimeString()}</span>
            </div>
            <div style={{ color: "#64748b", fontSize: 11 }}>To: {e.to}</div>
            {e.body && (
              <div style={{
                color: "#475569", fontSize: 11, marginTop: 6,
                whiteSpace: "pre-wrap", maxHeight: 80, overflowY: "auto"
              }}>{e.body}</div>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
);
