import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const PERSONAS = [
  { key: "job_seeker", label: "Job Seeker", icon: "🎓", desc: "Find verified employment matching your skills and qualifications.", color: "#FF6B35" },
  { key: "freelancer", label: "Freelancer", icon: "🎨", desc: "Find clients, protect payments with escrow, grow your portfolio.", color: "#4ECDC4" },
  { key: "entrepreneur", label: "Entrepreneur", icon: "🚀", desc: "Register your business, find mentors, access funding, meet investors.", color: "#FFD93D" },
];

const PROVINCES = ["Gauteng","Western Cape","KwaZulu-Natal","Eastern Cape","Limpopo","Mpumalanga","North West","Free State","Northern Cape"];

export default function SignupPage() {
  const navigate = useNavigate();
  const { register, error, setError } = useAuth();
  const [step, setStep] = useState(1); // 1=persona, 2=details
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "",
    password: "", phone: "", province: "",
    city: "", primary_persona: "", preferred_language: "English",
  });

  const handleChange = (e) => {
    setError(null);
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const selectPersona = (key) => {
    setForm({ ...form, primary_persona: key });
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) return;
    setLoading(true);
    const result = await register(form);
    setLoading(false);
    if (result.success) navigate("/onboarding");
  };

  const selectedPersona = PERSONAS.find((p) => p.key === form.primary_persona);

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .arise-input {
          width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px; padding: 13px 16px; color: #E8E8F0;
          font-family: 'Sora', sans-serif; font-size: 14px; outline: none; transition: border-color 0.2s;
        }
        .arise-input:focus { border-color: #FF6B35; }
        .arise-input::placeholder { color: #555; }
        .persona-card {
          background: rgba(255,255,255,0.03); border: 2px solid rgba(255,255,255,0.07);
          border-radius: 14px; padding: 28px; cursor: pointer; transition: all 0.2s; text-align: left;
        }
        .persona-card:hover { transform: translateY(-2px); }
        .arise-submit {
          width: 100%; background: #FF6B35; color: #fff; border: none;
          padding: 15px; border-radius: 8px; font-size: 15px; font-weight: 700;
          cursor: pointer; font-family: 'Sora', sans-serif; transition: all 0.2s;
        }
        .arise-submit:hover:not(:disabled) { background: #FF4500; }
        .arise-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* Nav */}
      <nav style={styles.nav}>
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={styles.logoIcon}>⚡</div>
          <span style={{ fontSize: 18, fontWeight: 800, color: "#E8E8F0" }}>ARISE</span>
        </Link>
        <div style={{ fontSize: 13, color: "#666" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#FF6B35", textDecoration: "none", fontWeight: 600 }}>Sign in</Link>
        </div>
      </nav>

      <div style={styles.content}>
        {/* Progress */}
        <div style={styles.progress}>
          {[1, 2].map((s) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 12, fontWeight: 700,
                background: step >= s ? "#FF6B35" : "rgba(255,255,255,0.05)",
                color: step >= s ? "#fff" : "#555",
                border: step >= s ? "none" : "1px solid rgba(255,255,255,0.1)",
              }}>{s < step ? "✓" : s}</div>
              <span style={{ fontSize: 12, color: step >= s ? "#E8E8F0" : "#555", fontWeight: step === s ? 700 : 400 }}>
                {s === 1 ? "Choose your path" : "Your details"}
              </span>
              {s < 2 && <div style={{ width: 32, height: 1, background: step > s ? "#FF6B35" : "rgba(255,255,255,0.1)", margin: "0 4px" }} />}
            </div>
          ))}
        </div>

        {/* Step 1 — Persona */}
        {step === 1 && (
          <div style={{ animation: "fadeUp 0.4s ease forwards" }}>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <h1 style={styles.title}>Who are you on ARISE?</h1>
              <p style={{ color: "#888", fontSize: 15 }}>Choose your primary path. You can add more later.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, maxWidth: 900, margin: "0 auto" }}>
              {PERSONAS.map((p) => (
                <div
                  key={p.key}
                  className="persona-card"
                  style={{ borderColor: `${p.color}20` }}
                  onClick={() => selectPersona(p.key)}
                >
                  <div style={{ fontSize: 40, marginBottom: 16 }}>{p.icon}</div>
                  <div style={{ fontSize: 11, color: p.color, fontFamily: "DM Mono, monospace", fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>{p.key.replace("_", " ").toUpperCase()}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>{p.label}</div>
                  <div style={{ fontSize: 13, color: "#888", lineHeight: 1.6, marginBottom: 20 }}>{p.desc}</div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, color: p.color, fontSize: 13, fontWeight: 700 }}>
                    Start as {p.label} →
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 — Details */}
        {step === 2 && (
          <div style={{ animation: "fadeUp 0.4s ease forwards", maxWidth: 520, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>{selectedPersona?.icon}</div>
              <h1 style={styles.title}>Your details</h1>
              <p style={{ color: "#888", fontSize: 14 }}>
                Signing up as a <span style={{ color: selectedPersona?.color, fontWeight: 700 }}>{selectedPersona?.label}</span>
                {" "}·{" "}
                <button onClick={() => setStep(1)} style={{ background: "none", border: "none", color: "#FF6B35", cursor: "pointer", fontSize: 14, fontFamily: "Sora, sans-serif" }}>Change</button>
              </p>
            </div>

            {error && (
              <div style={styles.errorBanner}>⚠ {error}</div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={styles.label}>First name *</label>
                  <input className="arise-input" name="first_name" placeholder="Thabo" value={form.first_name} onChange={handleChange} required />
                </div>
                <div>
                  <label style={styles.label}>Last name *</label>
                  <input className="arise-input" name="last_name" placeholder="Nkosi" value={form.last_name} onChange={handleChange} required />
                </div>
              </div>

              <div>
                <label style={styles.label}>Email address *</label>
                <input className="arise-input" type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
              </div>

              <div>
                <label style={styles.label}>Password * <span style={{ color: "#555", fontWeight: 400 }}>(min 8 chars, 1 number)</span></label>
                <input className="arise-input" type="password" name="password" placeholder="Create a strong password" value={form.password} onChange={handleChange} required minLength={8} />
                {form.password && (
                  <div style={{ marginTop: 6, display: "flex", gap: 4 }}>
                    {[8, 12, 16].map((len) => (
                      <div key={len} style={{ flex: 1, height: 3, borderRadius: 2, background: form.password.length >= len ? "#FF6B35" : "rgba(255,255,255,0.1)", transition: "background 0.2s" }} />
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={styles.label}>Province</label>
                  <select className="arise-input" name="province" value={form.province} onChange={handleChange} style={{ color: form.province ? "#E8E8F0" : "#555" }}>
                    <option value="">Select province</option>
                    {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={styles.label}>City</label>
                  <input className="arise-input" name="city" placeholder="Johannesburg" value={form.city} onChange={handleChange} />
                </div>
              </div>

              <div>
                <label style={styles.label}>Phone (optional)</label>
                <input className="arise-input" type="tel" name="phone" placeholder="+27 82 000 0000" value={form.phone} onChange={handleChange} />
              </div>

              <button
                className="arise-submit"
                type="submit"
                disabled={loading || !form.first_name || !form.last_name || !form.email || form.password.length < 8}
                style={{ marginTop: 8, background: selectedPersona?.color || "#FF6B35" }}
              >
                {loading ? "Creating your TrustID..." : `Create My TrustID as ${selectedPersona?.label} →`}
              </button>

              <p style={{ textAlign: "center", fontSize: 12, color: "#555", lineHeight: 1.6 }}>
                By creating an account you agree to ARISE's{" "}
                <span style={{ color: "#FF6B35" }}>Terms of Service</span> and{" "}
                <span style={{ color: "#FF6B35" }}>Privacy Policy</span>.
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { fontFamily: "'Sora', sans-serif", background: "#0A0A0F", color: "#E8E8F0", minHeight: "100vh" },
  nav: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 32px", height: 64, borderBottom: "1px solid rgba(255,255,255,0.06)" },
  logoIcon: { width: 30, height: 30, borderRadius: 7, background: "linear-gradient(135deg, #FF6B35, #FF3D00)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 },
  content: { padding: "60px 24px", maxWidth: 1100, margin: "0 auto" },
  progress: { display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginBottom: 56 },
  title: { fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, marginBottom: 12 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#AAA", marginBottom: 7 },
  errorBanner: { background: "rgba(255,100,100,0.1)", border: "1px solid rgba(255,100,100,0.2)", borderRadius: 8, padding: "12px 16px", fontSize: 13, color: "#FF8888", marginBottom: 16 },
};