import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function GovLinkLogin() {
  const navigate = useNavigate();
  const { login, error, setError } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(form.email, form.password);
    setLoading(false);
    if (result.success) {
      if (result.user?.primary_persona === "government") {
        navigate("/govlink");
      } else {
        setError("This portal is restricted to government officials. Please use the main login.");
      }
    }
  };

  const fillDemo = () => {
    setError(null);
    setForm({ email: "dsbd@demo.arise.co.za", password: "Demo1234" });
  };

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        .gov-input { width:100%; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:13px 16px; color:#E8E8F0; font-family:'Sora',sans-serif; font-size:14px; outline:none; transition:border-color 0.2s; }
        .gov-input:focus { border-color:#FF6B35; }
        .gov-input::placeholder { color:#555; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* Background grid */}
      <div style={styles.gridBg} />
      <div style={styles.glowBg} />

      <div style={styles.card}>
        {/* Gov branding */}
        <div style={{ textAlign: "center", marginBottom: 36, animation: "fadeUp 0.4s ease forwards" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg, #FF6B35, #FF3D00)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>⚡</div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 20, fontWeight: 800 }}>ARISE GovLink</div>
              <div style={{ fontSize: 11, color: "#666", fontFamily: "DM Mono, monospace" }}>DSBD · SEDA · NYDA PORTAL</div>
            </div>
          </div>
          <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(255,107,53,0.3), transparent)", marginBottom: 20 }} />
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Government Official Access</h1>
          <p style={{ fontSize: 13, color: "#888", lineHeight: 1.6 }}>
            Access the ARISE national impact dashboard.<br />
            Real-time data on South Africa's youth & women economy.
          </p>
        </div>

        {error && (
          <div style={styles.errorBanner}>⚠ {error}</div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16, animation: "fadeUp 0.4s 0.1s ease both" }}>
          <div>
            <label style={styles.label}>Official Email Address</label>
            <input className="gov-input" type="email" placeholder="official@dsbd.gov.za" value={form.email} onChange={(e) => { setError(null); setForm({ ...form, email: e.target.value }); }} autoFocus />
          </div>
          <div>
            <label style={styles.label}>Password</label>
            <input className="gov-input" type="password" placeholder="Your secure password" value={form.password} onChange={(e) => { setError(null); setForm({ ...form, password: e.target.value }); }} />
          </div>
          <button
            type="submit"
            disabled={loading || !form.email || !form.password}
            style={{ background: "#FF6B35", color: "#fff", border: "none", padding: "14px", borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "Sora, sans-serif", opacity: (loading || !form.email || !form.password) ? 0.6 : 1, transition: "all 0.2s" }}
          >
            {loading ? "Authenticating..." : "Access GovLink Portal →"}
          </button>
        </form>

        {/* Demo button */}
        <div style={{ marginTop: 20, padding: 16, background: "rgba(255,107,53,0.05)", border: "1px solid rgba(255,107,53,0.15)", borderRadius: 10, textAlign: "center", animation: "fadeUp 0.4s 0.2s ease both" }}>
          <div style={{ fontSize: 11, color: "#666", fontFamily: "DM Mono, monospace", marginBottom: 8 }}>— DEMO ACCESS —</div>
          <button onClick={fillDemo} style={{ background: "rgba(255,107,53,0.15)", border: "1px solid rgba(255,107,53,0.3)", color: "#FF6B35", borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "Sora, sans-serif" }}>
            🏛️ Login as DSBD Official
          </button>
          <div style={{ fontSize: 11, color: "#444", marginTop: 6 }}>Fills credentials automatically</div>
        </div>

        <div style={{ marginTop: 24, textAlign: "center" }}>
          <Link to="/login" style={{ fontSize: 12, color: "#555", textDecoration: "none", fontFamily: "DM Mono, monospace" }}>
            ← Back to main login
          </Link>
        </div>

        {/* Security notice */}
        <div style={{ marginTop: 20, display: "flex", gap: 8, padding: "12px 14px", background: "rgba(255,255,255,0.02)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
          <span style={{ fontSize: 14 }}>🔒</span>
          <span style={{ fontSize: 11, color: "#555", lineHeight: 1.5 }}>
            This portal is restricted to authorised government officials. All access is logged and monitored. Data is encrypted with Huawei DEW.
          </span>
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 24, fontSize: 11, color: "#333", fontFamily: "DM Mono, monospace" }}>
        ARISE · POWERED BY HUAWEI CLOUD · CODE4MZANSI 2026
      </div>
    </div>
  );
}

const styles = {
  page: { fontFamily: "'Sora', sans-serif", background: "#0A0A0F", color: "#E8E8F0", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", position: "relative", overflow: "hidden" },
  gridBg: { position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,107,53,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,107,53,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" },
  glowBg: { position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,107,53,0.08) 0%, transparent 70%)", pointerEvents: "none" },
  card: { position: "relative", width: "100%", maxWidth: 420, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,107,53,0.15)", borderRadius: 18, padding: 36 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#AAA", marginBottom: 8 },
  errorBanner: { background: "rgba(255,100,100,0.1)", border: "1px solid rgba(255,100,100,0.2)", borderRadius: 8, padding: "11px 14px", fontSize: 13, color: "#FF8888", marginBottom: 16 },
};