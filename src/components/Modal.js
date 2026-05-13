export const Modal = ({ title, onClose, children }) => (
  <div style={{
    position: "fixed", inset: 0, background: "#00000090", zIndex: 1000,
    display: "flex", alignItems: "center", justifyContent: "center", padding: 20
  }}>
    <div style={{
      background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16,
      padding: 28, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto"
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 20
      }}>
        <div style={{
          color: "#f1f5f9", fontWeight: 700, fontSize: 18
        }}>{title}</div>
        <button onClick={onClose} style={{
          background: "none", border: "none", color: "#94a3b8",
          cursor: "pointer", fontSize: 22
        }}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

export const inputStyle = {
  width: "100%", padding: "10px 14px", background: "#1e293b",
  border: "1px solid #334155", borderRadius: 8, color: "#f1f5f9",
  fontSize: 14, boxSizing: "border-box", marginBottom: 12
};

export const labelStyle = {
  color: "#94a3b8", fontSize: 12, marginBottom: 4, display: "block"
};
