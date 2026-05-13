import { inputStyle, labelStyle } from "./Modal";

export const LoginPage = ({ loginForm, setLoginForm, handleLogin, toasts }) => {
  return (
    <div style={{
      minHeight: "100vh", background: "#0a0f1e", display: "flex",
      alignItems: "center", justifyContent: "center", fontFamily: "'Rajdhani', 'Inter', sans-serif"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #0a0f1e; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
        select option { background: #0f172a; color: #f1f5f9; }
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        input:focus, select:focus, textarea:focus { outline: none; border-color: #22c55e !important; }
        button:hover { opacity: 0.9; }
      `}</style>
      <div style={{ width: "100%", maxWidth: 420, padding: 20 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎖️</div>
          <div style={{
            color: "#22c55e", fontSize: 11, letterSpacing: 4, fontWeight: 700
          }}>CLASSIFIED SYSTEM</div>
          <div style={{
            color: "#f1f5f9", fontSize: 28, fontWeight: 700, marginTop: 4
          }}>FOOD INVENTORY</div>
          <div style={{
            color: "#22c55e", fontSize: 20, fontWeight: 700
          }}>MANAGEMENT SYSTEM</div>
          <div style={{
            color: "#334155", fontSize: 11, marginTop: 8
          }}>INDIAN ARMED FORCES — MULTI-BRANCH</div>
        </div>
        <div style={{
          background: "#0f172a", border: "1px solid #1e293b",
          borderRadius: 16, padding: 32
        }}>
          <div style={{
            color: "#94a3b8", fontSize: 12, marginBottom: 20, textAlign: "center"
          }}>SECURE ACCESS PORTAL</div>
          <label style={labelStyle}>EMAIL / SERVICE ID</label>
          <input style={inputStyle} value={loginForm.email}
            onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))}
            placeholder="Enter credentials" />
          <label style={labelStyle}>PASSWORD</label>
          <input type="password" style={inputStyle} value={loginForm.password}
            onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            placeholder="••••••••" />
          <button onClick={handleLogin} style={{
            width: "100%", padding: "12px", background: "#22c55e",
            border: "none", borderRadius: 8, color: "#052e16",
            fontWeight: 700, fontSize: 14, cursor: "pointer", marginTop: 4
          }}>
            AUTHENTICATE & ENTER
          </button>
          <div style={{ marginTop: 20, color: "#334155", fontSize: 11 }}>
            <div style={{ marginBottom: 6, color: "#475569" }}>DEMO CREDENTIALS:</div>
            <div>Admin: admin@mil.gov.in / admin123</div>
            <div>Officer: officer@mil.gov.in / officer123</div>
            <div>Vendor: vendor1@supremefoods.mil / vendor123</div>
          </div>
        </div>
      </div>
    </div>
  );
};
