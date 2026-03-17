import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const SECTORS = ["Technology","Agriculture","Retail","Manufacturing","Healthcare","Education","Fashion","Food & Beverage","Construction","Creative & Media","Financial Services","Transport & Logistics","Tourism","Other"];
const PROVINCES = ["Gauteng","Western Cape","KwaZulu-Natal","Eastern Cape","Limpopo","Mpumalanga","North West","Free State","Northern Cape"];
const REVENUE_RANGES = ["R0 – R50,000","R50,001 – R500,000","R500,001 – R5,000,000","R5,000,001+"];

const WIZARD_STEPS = [
  { number: 1, label: "Business Identity", icon: "🏢" },
  { number: 2, label: "Legal Registration", icon: "📋" },
  { number: 3, label: "Financials", icon: "💰" },
  { number: 4, label: "Funding Goals", icon: "🎯" },
];

export default function LaunchPad() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [ecsAwarded, setEcsAwarded] = useState(0);

  const [form, setForm] = useState({
    business_name: "", trading_name: "", sector: "", subsector: "", description: "",
    province: user?.province || "", city: user?.city || "",
    business_structure: "", has_cipc_registration: false, cipc_number: "", founded_date: "",
    revenue_range: "", employees_count: 1, is_vat_registered: false, vat_number: "",
    funding_status: "not_seeking", funding_amount_seeking: "", funding_use_of_funds: "", equity_offering_percent: "",
  });

  const set = (key, val) => { setError(null); setForm((f) => ({ ...f, [key]: val })); };

  const submitStep = async () => {
    setLoading(true); setError(null);
    try {
      if (step < 4) {
        await api.post(`/launchpad/step/${step}`, form);
        setStep(step + 1);
      } else {
        const res = await api.post("/launchpad/complete", form);
        setEcsAwarded(res.data.ecs_points_awarded || 100);
        await refreshUser();
        setCompleted(true);
      }
    } catch (e) {
      setError(e.response?.data?.detail || "Something went wrong. Please try again.");
    } finally { setLoading(false); }
  };

  if (completed) return (
    <div style={styles.successPage}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&display=swap'); * { box-sizing:border-box; } @keyframes pop { 0% { transform:scale(0); } 70% { transform:scale(1.15); } 100% { transform:scale(1); } } @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }`}</style>
      <div style={{ textAlign: "center", maxWidth: 480, margin: "0 auto" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, #FFD93D, #FF6B35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 24px", animation: "pop 0.5s ease forwards" }}>🚀</div>
        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 12 }}>Your business is live on ARISE!</h1>
        <p style={{ fontSize: 15, color: "#888", marginBottom: 24, lineHeight: 1.7 }}>
          <strong style={{ color: "#FFD93D" }}>{form.business_name}</strong> is now registered on ARISE. Your TrustID has been updated with your verified business identity.
        </p>
        <div style={{ background: "rgba(255,107,53,0.08)", border: "1px solid rgba(255,107,53,0.2)", borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: "#666", fontFamily: "DM Mono, monospace", marginBottom: 4 }}>ECS POINTS AWARDED</div>
          <div style={{ fontSize: 48, fontWeight: 900, color: "#FF6B35" }}>+{ecsAwarded}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button onClick={() => navigate("/fundmatch")} style={styles.primaryBtn}>Find Matching Grants →</button>
          <button onClick={() => navigate("/mentors")} style={styles.secondaryBtn}>Book a Mentor Session</button>
          <button onClick={() => navigate("/dashboard")} style={styles.ghostBtn}>Go to Dashboard</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        .lp-input { width:100%; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:12px 16px; color:#E8E8F0; font-family:'Sora',sans-serif; font-size:14px; outline:none; transition:border-color 0.2s; }
        .lp-input:focus { border-color:#FFD93D; background:rgba(255,215,61,0.04); }
        .lp-input::placeholder { color:#555; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <div style={styles.inner}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "linear-gradient(135deg, #FFD93D, #FF6B35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🚀</div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800 }}>LaunchPad</h1>
            <p style={{ fontSize: 13, color: "#888" }}>Register your business in 4 steps · Free · Earn 100 ECS points</p>
          </div>
        </div>

        {/* Step indicator */}
        <div style={styles.stepRow}>
          {WIZARD_STEPS.map((s) => (
            <div key={s.number} style={{ display: "flex", alignItems: "center", gap: 0, flex: s.number < WIZARD_STEPS.length ? 1 : 0 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: step >= s.number ? "#FFD93D" : "rgba(255,255,255,0.06)", border: step >= s.number ? "none" : "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: step > s.number ? 14 : 16, color: step >= s.number ? "#0A0A0F" : "#555", fontWeight: 800, transition: "all 0.3s" }}>
                  {step > s.number ? "✓" : s.icon}
                </div>
                <div style={{ fontSize: 10, color: step >= s.number ? "#FFD93D" : "#555", fontFamily: "DM Mono, monospace", whiteSpace: "nowrap" }}>{s.label}</div>
              </div>
              {s.number < WIZARD_STEPS.length && <div style={{ flex: 1, height: 2, background: step > s.number ? "#FFD93D" : "rgba(255,255,255,0.06)", marginBottom: 20, transition: "background 0.3s" }} />}
            </div>
          ))}
        </div>

        {/* Form card */}
        <div style={styles.formCard}>
          {error && <div style={styles.errorBanner}>⚠ {error}</div>}

          {/* Step 1 — Business Identity */}
          {step === 1 && (
            <div style={{ animation: "fadeUp 0.4s ease forwards" }}>
              <div style={styles.stepTitle}>What does your business do?</div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Business Name *</label>
                <input className="lp-input" placeholder="e.g. Zama's Fashion Studio" value={form.business_name} onChange={(e) => set("business_name", e.target.value)} />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Trading Name (optional)</label>
                <input className="lp-input" placeholder="Name customers know you by" value={form.trading_name} onChange={(e) => set("trading_name", e.target.value)} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Sector *</label>
                  <select className="lp-input" value={form.sector} onChange={(e) => set("sector", e.target.value)} style={{ color: form.sector ? "#E8E8F0" : "#555" }}>
                    <option value="">Select sector</option>
                    {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Province *</label>
                  <select className="lp-input" value={form.province} onChange={(e) => set("province", e.target.value)} style={{ color: form.province ? "#E8E8F0" : "#555" }}>
                    <option value="">Select province</option>
                    {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>City</label>
                <input className="lp-input" placeholder="Johannesburg" value={form.city} onChange={(e) => set("city", e.target.value)} />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Business Description *</label>
                <textarea className="lp-input" rows={3} placeholder="Describe what your business does, who your customers are, and what makes you different..." value={form.description} onChange={(e) => set("description", e.target.value)} style={{ resize: "vertical" }} />
              </div>
            </div>
          )}

          {/* Step 2 — Legal */}
          {step === 2 && (
            <div style={{ animation: "fadeUp 0.4s ease forwards" }}>
              <div style={styles.stepTitle}>Legal registration details</div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Business Structure *</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {["Sole Proprietor","PTY Ltd","Partnership","Non-Profit (NPO)"].map((s) => (
                    <div key={s} onClick={() => set("business_structure", s)} style={{ padding: "12px 16px", borderRadius: 8, border: `1px solid ${form.business_structure === s ? "#FFD93D" : "rgba(255,255,255,0.08)"}`, background: form.business_structure === s ? "rgba(255,215,61,0.08)" : "rgba(255,255,255,0.03)", cursor: "pointer", fontSize: 13, fontWeight: 600, color: form.business_structure === s ? "#FFD93D" : "#888", transition: "all 0.2s" }}>
                      {s}
                    </div>
                  ))}
                </div>
              </div>
              <div style={styles.fieldGroup}>
                <label style={{ ...styles.label, display: "flex", alignItems: "center", gap: 10 }}>
                  <input type="checkbox" checked={form.has_cipc_registration} onChange={(e) => set("has_cipc_registration", e.target.checked)} style={{ accentColor: "#FFD93D", width: 16, height: 16 }} />
                  I have a CIPC registration number
                </label>
              </div>
              {form.has_cipc_registration && (
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>CIPC Registration Number</label>
                  <input className="lp-input" placeholder="e.g. 2024/123456/07" value={form.cipc_number} onChange={(e) => set("cipc_number", e.target.value)} />
                  <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>We'll automatically verify this against the Companies register.</div>
                </div>
              )}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Year Founded</label>
                <input className="lp-input" type="number" placeholder="2024" min="1990" max={new Date().getFullYear()} value={form.founded_date} onChange={(e) => set("founded_date", e.target.value)} />
              </div>
            </div>
          )}

          {/* Step 3 — Financials */}
          {step === 3 && (
            <div style={{ animation: "fadeUp 0.4s ease forwards" }}>
              <div style={styles.stepTitle}>Financial basics</div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Annual Revenue Range</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {REVENUE_RANGES.map((r) => (
                    <div key={r} onClick={() => set("revenue_range", r)} style={{ padding: "12px 16px", borderRadius: 8, border: `1px solid ${form.revenue_range === r ? "#FFD93D" : "rgba(255,255,255,0.08)"}`, background: form.revenue_range === r ? "rgba(255,215,61,0.06)" : "rgba(255,255,255,0.02)", cursor: "pointer", fontSize: 14, color: form.revenue_range === r ? "#FFD93D" : "#888", fontWeight: form.revenue_range === r ? 700 : 400, transition: "all 0.2s" }}>
                      {r}
                    </div>
                  ))}
                </div>
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Number of Employees (including yourself)</label>
                <input className="lp-input" type="number" min="1" value={form.employees_count} onChange={(e) => set("employees_count", parseInt(e.target.value))} />
              </div>
              <div style={styles.fieldGroup}>
                <label style={{ ...styles.label, display: "flex", alignItems: "center", gap: 10 }}>
                  <input type="checkbox" checked={form.is_vat_registered} onChange={(e) => set("is_vat_registered", e.target.checked)} style={{ accentColor: "#FFD93D", width: 16, height: 16 }} />
                  VAT registered
                </label>
              </div>
              {form.is_vat_registered && (
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>VAT Number</label>
                  <input className="lp-input" placeholder="4123456789" value={form.vat_number} onChange={(e) => set("vat_number", e.target.value)} />
                </div>
              )}
            </div>
          )}

          {/* Step 4 — Funding Goals */}
          {step === 4 && (
            <div style={{ animation: "fadeUp 0.4s ease forwards" }}>
              <div style={styles.stepTitle}>What are you looking for?</div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Funding Status</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { key: "not_seeking", label: "Not seeking funding", icon: "🚫" },
                    { key: "seeking_mentorship", label: "Looking for mentorship", icon: "🤝" },
                    { key: "seeking_investment", label: "Looking for investment", icon: "💰" },
                    { key: "seeking_both", label: "Both mentorship & investment", icon: "🚀" },
                  ].map((o) => (
                    <div key={o.key} onClick={() => set("funding_status", o.key)} style={{ padding: "14px", borderRadius: 10, border: `1px solid ${form.funding_status === o.key ? "#FFD93D" : "rgba(255,255,255,0.08)"}`, background: form.funding_status === o.key ? "rgba(255,215,61,0.06)" : "rgba(255,255,255,0.02)", cursor: "pointer", textAlign: "center", transition: "all 0.2s" }}>
                      <div style={{ fontSize: 24, marginBottom: 6 }}>{o.icon}</div>
                      <div style={{ fontSize: 12, color: form.funding_status === o.key ? "#FFD93D" : "#888", fontWeight: form.funding_status === o.key ? 700 : 400 }}>{o.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              {["seeking_investment", "seeking_both"].includes(form.funding_status) && (
                <>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>How much funding are you seeking? (ZAR)</label>
                    <input className="lp-input" type="number" placeholder="e.g. 250000" value={form.funding_amount_seeking} onChange={(e) => set("funding_amount_seeking", e.target.value)} />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>How will you use the funding?</label>
                    <textarea className="lp-input" rows={3} placeholder="Describe how the investment will grow your business..." value={form.funding_use_of_funds} onChange={(e) => set("funding_use_of_funds", e.target.value)} style={{ resize: "vertical" }} />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Equity offering (% of business)</label>
                    <input className="lp-input" type="number" placeholder="e.g. 20" min="0" max="100" value={form.equity_offering_percent} onChange={(e) => set("equity_offering_percent", e.target.value)} />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} style={styles.backBtn}>← Back</button>
            )}
            <button
              onClick={submitStep}
              disabled={loading || (step === 1 && (!form.business_name || !form.sector || !form.description))}
              style={{ ...styles.primaryBtn, flex: 1, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Saving..." : step === 4 ? "🚀 Launch My Business!" : `Continue to Step ${step + 1} →`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { fontFamily: "'Sora', sans-serif", background: "#0A0A0F", color: "#E8E8F0", minHeight: "100vh", padding: "32px 24px" },
  successPage: { fontFamily: "'Sora', sans-serif", background: "#0A0A0F", color: "#E8E8F0", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" },
  inner: { maxWidth: 640, margin: "0 auto" },
  stepRow: { display: "flex", alignItems: "flex-start", marginBottom: 32 },
  formCard: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 32 },
  stepTitle: { fontSize: 20, fontWeight: 800, marginBottom: 24, color: "#E8E8F0" },
  fieldGroup: { marginBottom: 20 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#AAA", marginBottom: 8 },
  errorBanner: { background: "rgba(255,100,100,0.08)", border: "1px solid rgba(255,100,100,0.2)", borderRadius: 8, padding: "12px 16px", fontSize: 13, color: "#FF8888", marginBottom: 20 },
  primaryBtn: { background: "#FFD93D", color: "#0A0A0F", border: "none", padding: "14px 24px", borderRadius: 8, fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "Sora, sans-serif", transition: "all 0.2s" },
  secondaryBtn: { background: "transparent", color: "#E8E8F0", border: "1px solid rgba(255,255,255,0.12)", padding: "13px 24px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "Sora, sans-serif", width: "100%" },
  ghostBtn: { background: "none", border: "none", color: "#666", padding: "10px", fontSize: 13, cursor: "pointer", fontFamily: "Sora, sans-serif", width: "100%" },
  backBtn: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#888", padding: "14px 20px", borderRadius: 8, fontSize: 14, cursor: "pointer", fontFamily: "Sora, sans-serif" },
};