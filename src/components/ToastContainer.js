export const ToastContainer = ({ toasts }) => (
  <div style={{
    position: "fixed", top: 20, right: 20, zIndex: 9999,
    display: "flex", flexDirection: "column", gap: 8
  }}>
    {toasts.map(t => (
      <div key={t.id} style={{
        background: t.type === "error" ? "#450a0a" : t.type === "warning" ? "#431407" : "#052e16",
        border: `1px solid ${t.type === "error" ? "#ef4444" : t.type === "warning" ? "#f97316" : "#22c55e"}`,
        color: "#fff", padding: "10px 16px", borderRadius: 8, fontSize: 13,
        maxWidth: 320, animation: "slideIn 0.3s ease"
      }}>
        <span style={{ marginRight: 8 }}>
          {t.type === "error" ? "⚠" : t.type === "warning" ? "⚡" : "✓"}
        </span>
        {t.msg}
      </div>
    ))}
  </div>
);
