import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

export default function BusinessProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/launchpad/status");
        setProfile(res.data.started ? res.data : null);
      } catch { setProfile(MOCK_PROFILE); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <div style={styles.loading}>🚀 Loading business profile...</div>;

  if (!profile || !profile.started) return (
    <div style={styles.page}>
      <div style={styles.inner}>
        <div style={{ textAlign: "center", padding: 80 }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🚀</div>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>No business registered yet</h2>
          <p style={{ fontSize: 15, color: "#888", marginBottom: 32 }}>Register your business through LaunchPad to create your investor-ready business identity.</p>
          <Link to="/launchpad" style={{ background: "#FFD93D", color: "#0A0A0F", textDecoration: "none", padding: "14px 32px", borderRadius: 8, fontWeight: 800, fontSize: 15, fontFamily: "Sora, sans-serif" }}>Start LaunchPad →</Link>
        </div>
      </div>
    </div>
  );

  const stageColors = { idea: "#666", early: "#FFD93D", growth: "#4ECDC4", scaling: "#FF6B35" };
  const stageColor = stageColors[profile.stage] || "#666";

  return (
    <div style={styles.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap'); * { box-sizing:border-box; } @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>
      <div style={styles.inner}>
        {/* Business header */}
        <div style={{ ...styles.card, borderColor: "rgba(255,215,61,0.2)", animation: "fadeUp 0.4s ease forwards" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <h1 style={{ fontSize: 26, fontWeight: 900 }}>{profile.business_name}</h1>
                {profile.verification_status === "verified" && (
                  <span style={{ fontSize: 11, background: "rgba(78,205,196,0.1)", border: "1px solid rgba(78,205,196,0.3)", borderRadius: 12, padding: "3px 10px", color: "#4ECDC4", fontWeight: 700 }}>✓ CIPC VERIFIED</span>
                )}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, background: `${stageColor}15`, border: `1px solid ${stageColor}30`, borderRadius: 12, padding: "3px 10px", color: stageColor, fontWeight: 700, fontFamily: "DM Mono, monospace" }}>
                  {profile.stage?.toUpperCase()} STAGE
                </span>
                {profile.sector && <span style={styles.tag}>{profile.sector}</span>}
                {profile.province && <span style={styles.tag}>{profile.city} {profile.province}</span>}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Link to="/investors" style={styles.primaryBtn}>View Investor Interest</Link>
              <button onClick={() => setEditing(true)} style={styles.secondaryBtn}>Edit Profile</button>
            </div>
          </div>

          {profile.description && (
            <p style={{ fontSize: 14, color: "#BBB", lineHeight: 1.7, marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              {profile.description}
            </p>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Business metrics */}
          <div style={{ ...styles.card, animation: "fadeUp 0.4s 0.1s ease both" }}>
            <div style={styles.cardTitle}>BUSINESS METRICS</div>
            {[
              { label: "CIPC Number", value: profile.cipc_number || "Not registered", highlight: !!profile.cipc_number },
              { label: "Revenue Range", value: profile.revenue_range || "Not disclosed" },
              { label: "Employees", value: profile.employees_count || 1 },
              { label: "B-BBEE Level", value: profile.bbee_level || "Not assessed" },
              { label: "VAT Registered", value: profile.is_vat_registered ? "Yes" : "No" },
            ].map((m) => (
              <div key={m.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ fontSize: 12, color: "#666" }}>{m.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: m.highlight ? "#4ECDC4" : "#E8E8F0" }}>{m.value}</span>
              </div>
            ))}
          </div>

          {/* Funding details */}
          <div style={{ ...styles.card, animation: "fadeUp 0.4s 0.15s ease both" }}>
            <div style={styles.cardTitle}>FUNDING STATUS</div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: "#888", marginBottom: 6 }}>Currently</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#FFD93D" }}>
                {profile.funding_status === "seeking_investment" ? "Seeking Investment" : profile.funding_status === "seeking_both" ? "Seeking Investment & Mentorship" : profile.funding_status === "seeking_mentorship" ? "Seeking Mentorship" : "Not Currently Seeking"}
              </div>
            </div>
            {profile.funding_amount_seeking && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 13, color: "#888", marginBottom: 4 }}>Amount Seeking</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#FFD93D" }}>R{Number(profile.funding_amount_seeking).toLocaleString()}</div>
              </div>
            )}
            {profile.equity_offering_percent && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 13, color: "#888", marginBottom: 4 }}>Equity Offering</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{profile.equity_offering_percent}%</div>
              </div>
            )}
            {profile.funding_use_of_funds && (
              <div>
                <div style={{ fontSize: 13, color: "#888", marginBottom: 4 }}>Use of Funds</div>
                <div style={{ fontSize: 13, color: "#BBB", lineHeight: 1.5 }}>{profile.funding_use_of_funds}</div>
              </div>
            )}
          </div>
        </div>

        {/* Investor visibility toggle */}
        <div style={{ ...styles.card, animation: "fadeUp 0.4s 0.2s ease both" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={styles.cardTitle}>INVESTOR VISIBILITY</div>
              <div style={{ fontSize: 14, color: user?.is_visible_to_investors ? "#4ECDC4" : "#888" }}>
                {user?.is_visible_to_investors ? "✓ Visible to verified investors" : "Hidden from investors"}
              </div>
              <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>You control when investors can discover your profile.</div>
            </div>
            <Link to="/investors" style={styles.primaryBtn}>Manage Visibility →</Link>
          </div>
        </div>

        {/* Completeness tips */}
        <div style={{ ...styles.card, animation: "fadeUp 0.4s 0.25s ease both" }}>
          <div style={styles.cardTitle}>INVESTOR READINESS CHECKLIST</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
            {[
              { label: "Business registered", done: !!profile.business_name, to: "/launchpad" },
              { label: "CIPC verified", done: !!profile.cipc_number, to: "/launchpad/upload/cipc" },
              { label: "Funding status set", done: profile.funding_status !== "not_seeking", to: "/launchpad" },
              { label: "ECS score 500+", done: (user?.ecs_score || 0) >= 500, to: "/ecs" },
              { label: "Mentor sessions completed", done: false, to: "/mentors" },
              { label: "Investor visibility ON", done: user?.is_visible_to_investors, to: "/investors" },
            ].map((c) => (
              <Link key={c.label} to={c.to} style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 12px", background: c.done ? "rgba(78,205,196,0.06)" : "rgba(255,255,255,0.02)", border: `1px solid ${c.done ? "rgba(78,205,196,0.2)" : "rgba(255,255,255,0.06)"}`, borderRadius: 8, textDecoration: "none" }}>
                <span style={{ fontSize: 16 }}>{c.done ? "✅" : "⬜"}</span>
                <span style={{ fontSize: 12, color: c.done ? "#4ECDC4" : "#888", fontWeight: c.done ? 700 : 400 }}>{c.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const MOCK_PROFILE = { started: true, business_name: "Zama's Fashion Studio", sector: "Fashion", stage: "early", province: "Gauteng", city: "Soweto", description: "A contemporary African fashion brand creating sustainable, culturally-inspired clothing for the modern African woman. We source locally, employ locally, and design globally.", cipc_number: "2024/234567/07", verification_status: "verified", revenue_range: "R0 – R50,000", employees_count: 3, is_vat_registered: false, funding_status: "seeking_investment", funding_amount_seeking: 250000, equity_offering_percent: 20, funding_use_of_funds: "Equipment purchase, 2 full-time staff, and marketing campaign targeting Cape Town market." };

const styles = {
  page: { fontFamily: "'Sora', sans-serif", background: "#0A0A0F", color: "#E8E8F0", minHeight: "100vh", padding: "32px 24px" },
  inner: { maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 },
  loading: { display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "Sora, sans-serif", color: "#FFD93D", background: "#0A0A0F" },
  card: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 24 },
  cardTitle: { fontSize: 11, color: "#555", fontFamily: "DM Mono, monospace", fontWeight: 700, letterSpacing: 2, marginBottom: 16 },
  tag: { display: "inline-block", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "3px 10px", fontSize: 11, color: "#AAA" },
  primaryBtn: { display: "inline-flex", alignItems: "center", background: "#FFD93D", color: "#0A0A0F", border: "none", padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 800, cursor: "pointer", textDecoration: "none", fontFamily: "Sora, sans-serif" },
  secondaryBtn: { background: "transparent", color: "#888", border: "1px solid rgba(255,255,255,0.1)", padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "Sora, sans-serif" },
};