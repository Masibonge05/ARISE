import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const LANGUAGES = ["English", "isiZulu", "Afrikaans", "Sesotho", "Xhosa", "Sepedi", "Setswana"];

function Section({ title, children }) {
  return (
    <div style={styles.section}>
      <div style={styles.sectionTitle}>{title}</div>
      {children}
    </div>
  );
}

function Toggle({ label, desc, value, onChange }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{label}</div>
        {desc && <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{desc}</div>}
      </div>
      <button onClick={() => onChange(!value)} style={{ width: 44, height: 24, borderRadius: 12, background: value ? "#FF6B35" : "rgba(255,255,255,0.1)", border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
        <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: value ? 23 : 3, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
      </button>
    </div>
  );
}

export default function Settings() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState("profile");

  const [prefs, setPrefs] = useState({
    preferred_language: user?.preferred_language || "English",
    is_available: user?.is_available ?? true,
    is_visible_to_investors: user?.is_visible_to_investors ?? false,
    is_visible_to_employers: user?.is_visible_to_employers ?? true,
    email_notifications: true,
    job_match_alerts: true,
    ecs_updates: true,
    investor_interest_alerts: true,
    marketing_emails: false,
  });

  const set = (key, val) => { setSaved(false); setPrefs((p) => ({ ...p, [key]: val })); };

  const savePrefs = async () => {
    setSaving(true);
    try {
      await api.patch("/users/me", {
        preferred_language: prefs.preferred_language,
        is_available: prefs.is_available,
        is_visible_to_investors: prefs.is_visible_to_investors,
        is_visible_to_employers: prefs.is_visible_to_employers,
      });
      updateUser({ preferred_language: prefs.preferred_language, is_available: prefs.is_available, is_visible_to_investors: prefs.is_visible_to_investors });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    finally { setSaving(false); }
  };

  const handleLogout = () => { logout(); navigate("/"); };

  const SECTIONS = [
    { key: "profile", label: "Profile & Visibility", icon: "👤" },
    { key: "notifications", label: "Notifications", icon: "🔔" },
    { key: "privacy", label: "Privacy & Safety", icon: "🔒" },
    { key: "account", label: "Account", icon: "⚙️" },
  ];

  return (
    <div style={styles.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap'); * { box-sizing:border-box; } .arise-select { width:100%; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:11px 14px; color:#E8E8F0; font-family:'Sora',sans-serif; font-size:14px; outline:none; cursor:pointer; transition:border-color 0.2s; } .arise-select:focus { border-color:#FF6B35; } @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>

      <div style={styles.inner}>
        <div style={{ animation: "fadeUp 0.4s ease forwards" }}>
          <h1 style={styles.title}>Settings</h1>
          <div style={{ display: "flex", gap: 6, color: "#888", fontSize: 14 }}>
            <span>{user?.full_name || user?.first_name}</span>
            <span>·</span>
            <span>{user?.email}</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 20 }}>
          {/* Sidebar nav */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {SECTIONS.map((s) => (
              <button key={s.key} onClick={() => setActiveSection(s.key)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 8, background: activeSection === s.key ? "rgba(255,107,53,0.1)" : "transparent", border: `1px solid ${activeSection === s.key ? "rgba(255,107,53,0.25)" : "transparent"}`, color: activeSection === s.key ? "#FF6B35" : "#888", cursor: "pointer", fontFamily: "Sora, sans-serif", fontSize: 13, fontWeight: activeSection === s.key ? 700 : 500, textAlign: "left", transition: "all 0.15s" }}>
                <span>{s.icon}</span> {s.label}
              </button>
            ))}
            <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "8px 0" }} />
            <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 8, background: "transparent", border: "none", color: "#FF6B35", cursor: "pointer", fontFamily: "Sora, sans-serif", fontSize: 13, fontWeight: 600, textAlign: "left" }}>
              🚪 Sign Out
            </button>
          </div>

          {/* Content */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {activeSection === "profile" && (
              <Section title="PROFILE & VISIBILITY">
                <div style={{ marginBottom: 18 }}>
                  <label style={styles.label}>Preferred Language</label>
                  <select className="arise-select" value={prefs.preferred_language} onChange={(e) => set("preferred_language", e.target.value)}>
                    {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                  <div style={{ fontSize: 12, color: "#555", marginTop: 6 }}>ARISE will use this language where available across the platform.</div>
                </div>
                <Toggle label="Available for opportunities" desc="Show as available to employers and clients" value={prefs.is_available} onChange={(v) => set("is_available", v)} />
                <Toggle label="Visible to employers" desc="Allow verified employers to find your TrustID profile" value={prefs.is_visible_to_employers} onChange={(v) => set("is_visible_to_employers", v)} />
                <Toggle label="Visible to investors" desc="Allow verified investors to discover your business profile" value={prefs.is_visible_to_investors} onChange={(v) => set("is_visible_to_investors", v)} />
              </Section>
            )}

            {activeSection === "notifications" && (
              <Section title="NOTIFICATION PREFERENCES">
                <Toggle label="Job match alerts" desc="Notified when new jobs match your TrustID" value={prefs.job_match_alerts} onChange={(v) => set("job_match_alerts", v)} />
                <Toggle label="ECS score updates" desc="Notified when your score changes" value={prefs.ecs_updates} onChange={(v) => set("ecs_updates", v)} />
                <Toggle label="Investor interest alerts" desc="Notified when an investor views your profile" value={prefs.investor_interest_alerts} onChange={(v) => set("investor_interest_alerts", v)} />
                <Toggle label="Email notifications" desc="Receive notifications via email" value={prefs.email_notifications} onChange={(v) => set("email_notifications", v)} />
                <Toggle label="Marketing & tips" desc="Occasional tips on growing your ECS score" value={prefs.marketing_emails} onChange={(v) => set("marketing_emails", v)} />
              </Section>
            )}

            {activeSection === "privacy" && (
              <Section title="PRIVACY & SAFETY">
                <div style={{ background: "rgba(78,205,196,0.05)", border: "1px solid rgba(78,205,196,0.15)", borderRadius: 10, padding: 16, marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#4ECDC4", marginBottom: 6 }}>🛡️ Your data is protected</div>
                  <div style={{ fontSize: 13, color: "#888", lineHeight: 1.6 }}>Your documents are encrypted with Huawei DEW. Your ID number is never displayed to employers or investors. Contact details are only shared with your explicit consent.</div>
                </div>
                <Toggle label="Two-factor authentication" desc="Extra security layer for your account" value={false} onChange={() => alert("Coming soon — 2FA will be available in the next update.")} />
                <div style={{ padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Download your data</div>
                  <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>Export all your TrustID data in JSON format (POPIA compliance)</div>
                  <button style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#888", borderRadius: 7, padding: "8px 16px", fontSize: 12, cursor: "pointer", fontFamily: "Sora, sans-serif" }}>Request Data Export</button>
                </div>
                <div style={{ padding: "14px 0" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#FF4444", marginBottom: 4 }}>Delete account</div>
                  <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>Permanently delete your TrustID and all associated data. This cannot be undone.</div>
                  <button style={{ background: "rgba(255,68,68,0.08)", border: "1px solid rgba(255,68,68,0.2)", color: "#FF4444", borderRadius: 7, padding: "8px 16px", fontSize: 12, cursor: "pointer", fontFamily: "Sora, sans-serif" }}>Delete Account</button>
                </div>
              </Section>
            )}

            {activeSection === "account" && (
              <Section title="ACCOUNT">
                <div style={{ padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Email address</div>
                  <div style={{ fontSize: 13, color: "#888", marginBottom: 4 }}>{user?.email}</div>
                  {user?.is_email_verified ? <span style={{ fontSize: 11, color: "#4ECDC4", fontWeight: 700 }}>✓ Verified</span> : <span style={{ fontSize: 11, color: "#FFD93D" }}>○ Not verified</span>}
                </div>
                <div style={{ padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Change password</div>
                  <button style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#888", borderRadius: 7, padding: "8px 16px", fontSize: 12, cursor: "pointer", fontFamily: "Sora, sans-serif" }}>Update Password →</button>
                </div>
                <div style={{ padding: "14px 0" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>ARISE version</div>
                  <div style={{ fontSize: 12, color: "#555", fontFamily: "DM Mono, monospace" }}>v1.0.0 · Code4Mzansi 2026 · Powered by Huawei Cloud</div>
                </div>
              </Section>
            )}

            {/* Save button */}
            {["profile", "notifications"].includes(activeSection) && (
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <button onClick={savePrefs} disabled={saving} style={{ background: "#FF6B35", color: "#fff", border: "none", padding: "12px 28px", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Sora, sans-serif", opacity: saving ? 0.6 : 1 }}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                {saved && <span style={{ fontSize: 13, color: "#4ECDC4", fontWeight: 600 }}>✓ Saved</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { fontFamily: "'Sora', sans-serif", background: "#0A0A0F", color: "#E8E8F0", minHeight: "100vh", padding: "32px 24px" },
  inner: { maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 },
  title: { fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 800, marginBottom: 4 },
  section: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 24 },
  sectionTitle: { fontSize: 11, color: "#555", fontFamily: "DM Mono, monospace", fontWeight: 700, letterSpacing: 2, marginBottom: 16 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#AAA", marginBottom: 8 },
};