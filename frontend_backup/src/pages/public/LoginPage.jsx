import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, error, setError } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setError(null);
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return;
    setLoading(true);
    const result = await login(form.email, form.password);
    setLoading(false);
    if (result.success) navigate("/dashboard");
  };

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .arise-input {
          width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px; padding: 14px 16px; color: #E8E8F0; font-family: 'Sora', sans-serif;
          font-size: 14px; outline: none; transition: border-color 0.2s;
        }
        .arise-input:focus { border-color: #FF6B35; background: rgba(255,107,53,0.05); }
        .arise-input::placeholder { color: #555; }
        .arise-submit {
          width: 100%; background: #FF6B35; color: #fff; border: none;
          padding: 15px; border-radius: 8px; font-size: 15px; font-weight: 700;
          cursor: pointer; font-family: 'Sora', sans-serif; transition: all 0.2s;
        }
        .arise-submit:hover:not(:disabled) { background: #FF4500; transform: translateY(-1px); }
        .arise-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.5s ease forwards; }
      `}</style>

      {/* Left panel — branding */}
      <div style={styles.leftPanel}>
        <div style={styles.leftBg} />
        <div style={styles.leftContent}>
          <Link to="/" style={{ textDecoration: "none" }}>
            <div style={styles.logo}>
              <div style={styles.logoIcon}>⚡</div>
              <span style={styles.logoText}>ARISE</span>
            </div>
          </Link>
          <div style={{ marginTop: "auto" }}>
            <div style={{ fontSize: 13, color: "#FF6B35", fontFamily: "DM Mono, monospace", fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>YOUR TRUSTED DIGITAL IDENTITY</div>
            <h2 style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.3, marginBottom: 16 }}>
              Welcome back.<br />
              <span style={{ color: "#FF6B35" }}>Your opportunities await.</span>
            </h2>
            <p style={{ fontSize: 14, color: "#888", lineHeight: 1.7 }}>
              Every login brings you closer to the job, client, mentor, or investor that matches your verified profile.
            </p>
            <div style={{ marginTop: 48, display: "flex", flexDirection: "column", gap: 16 }}>
              {["Verified employers only", "Safe from trafficking & scams", "AI-matched to your TrustID"].map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF6B35" }} />
                  <span style={{ fontSize: 13, color: "#AAA" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: "auto", paddingTop: 48 }}>
            <div style={{ fontSize: 11, color: "#444", fontFamily: "DM Mono, monospace" }}>POWERED BY HUAWEI CLOUD · CODE4MZANSI 2026</div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div style={styles.rightPanel}>
        <div style={{ ...styles.formCard, animation: "fadeUp 0.5s ease forwards" }}>
          <div style={{ marginBottom: 40 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Sign in</h1>
            <p style={{ fontSize: 14, color: "#888" }}>
              Don't have an account?{" "}
              <Link to="/signup" style={{ color: "#FF6B35", textDecoration: "none", fontWeight: 600 }}>Create one free</Link>
            </p>
          </div>

          {error && (
            <div style={styles.errorBanner}>
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label style={styles.label}>Email address</label>
              <input
                className="arise-input"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                autoFocus
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <label style={styles.label}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: 12, color: "#FF6B35", textDecoration: "none" }}>Forgot password?</Link>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  className="arise-input"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Your password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  style={{ paddingRight: 48 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 16 }}
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            <button className="arise-submit" type="submit" disabled={loading || !form.email || !form.password}>
              {loading ? "Signing in..." : "Sign in to ARISE →"}
            </button>
          </form>

          {/* Demo accounts */}
          <div style={styles.demoSection}>
            <div style={{ fontSize: 11, color: "#555", fontFamily: "DM Mono, monospace", textAlign: "center", marginBottom: 12 }}>— DEMO ACCOUNTS —</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {[
                { name: "Sphiwe", email: "sphiwe@demo.arise.co.za", color: "#FF6B35" },
                { name: "Sipho", email: "sipho@demo.arise.co.za", color: "#4ECDC4" },
                { name: "Zama", email: "zama@demo.arise.co.za", color: "#FFD93D" },
              ].map((d) => (
                <button
                  key={d.name}
                  type="button"
                  onClick={() => setForm({ email: d.email, password: "Demo1234" })}
                  style={{ background: `${d.color}10`, border: `1px solid ${d.color}30`, borderRadius: 6, padding: "8px 4px", cursor: "pointer", color: d.color, fontSize: 12, fontWeight: 700, fontFamily: "Sora, sans-serif" }}
                >
                  {d.name}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 11, color: "#444", textAlign: "center", marginTop: 8 }}>Click to fill · password: Demo1234</div>
          </div>

          <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
            <Link to="/govlink/login" style={{ fontSize: 12, color: "#555", textDecoration: "none", fontFamily: "DM Mono, monospace" }}>
              Government official? → GovLink Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { display: "flex", minHeight: "100vh", fontFamily: "'Sora', sans-serif", background: "#0A0A0F", color: "#E8E8F0" },
  leftPanel: { width: "45%", background: "rgba(255,107,53,0.04)", borderRight: "1px solid rgba(255,255,255,0.06)", padding: 48, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" },
  leftBg: { position: "absolute", top: "-20%", left: "-20%", width: "140%", height: "140%", background: "radial-gradient(circle at 30% 40%, rgba(255,107,53,0.08) 0%, transparent 60%)", pointerEvents: "none" },
  leftContent: { position: "relative", display: "flex", flexDirection: "column", height: "100%" },
  logo: { display: "flex", alignItems: "center", gap: 10, marginBottom: 80 },
  logoIcon: { width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg, #FF6B35, #FF3D00)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 },
  logoText: { fontSize: 22, fontWeight: 800, color: "#E8E8F0" },
  rightPanel: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 48 },
  formCard: { width: "100%", maxWidth: 420 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#CCC", marginBottom: 8 },
  errorBanner: { background: "rgba(255,100,100,0.1)", border: "1px solid rgba(255,100,100,0.2)", borderRadius: 8, padding: "12px 16px", fontSize: 13, color: "#FF8888", marginBottom: 20, display: "flex", gap: 8, alignItems: "center" },
  demoSection: { marginTop: 32, padding: 20, background: "rgba(255,255,255,0.02)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)" },
};