import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// ─── NOT FOUND ─────────────────────────────────────────────────────────────────
export function NotFound() {
  const { isAuthenticated } = useAuth();
  return (
    <div style={styles.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;700;800;900&display=swap'); * { box-sizing:border-box; } @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-12px); } }`}</style>
      <div style={styles.inner}>
        <div style={{ fontSize: 80, animation: "float 3s ease-in-out infinite" }}>⚡</div>
        <div style={{ fontSize: 80, fontWeight: 900, color: "rgba(255,107,53,0.15)", lineHeight: 1 }}>404</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Page not found</h1>
        <p style={{ fontSize: 15, color: "#888", maxWidth: 340, textAlign: "center", lineHeight: 1.7 }}>
          This page doesn't exist on ARISE. It may have moved or been removed.
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <Link to={isAuthenticated ? "/dashboard" : "/"} style={{ background: "#FF6B35", color: "#fff", textDecoration: "none", padding: "12px 28px", borderRadius: 8, fontWeight: 700, fontSize: 14, fontFamily: "Sora, sans-serif" }}>
            {isAuthenticated ? "Go to Dashboard" : "Go Home"}
          </Link>
          <Link to="/safety" style={{ background: "transparent", color: "#888", textDecoration: "none", padding: "12px 28px", borderRadius: 8, fontWeight: 600, fontSize: 14, border: "1px solid rgba(255,255,255,0.1)", fontFamily: "Sora, sans-serif" }}>
            Safety Info
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── SAFETY PAGE ───────────────────────────────────────────────────────────────
export function SafetyPage() {
  const TIPS = [
    { icon: "🚫", title: "Never pay upfront", desc: "Legitimate employers will never ask you to pay a fee to apply, for equipment, or for training before starting work. This is always a scam." },
    { icon: "🔒", title: "Keep communication inside ARISE", desc: "All messages happen inside ARISE until both parties agree to share contacts. Never move conversations to WhatsApp or email before this step." },
    { icon: "✅", title: "Check employer verification badges", desc: "Only apply to postings from Verified Employers (green badge). Unverified employers are flagged clearly — proceed with caution." },
    { icon: "🛡️", title: "Escrow protects your payments", desc: "As a freelancer, payments are held in escrow until you deliver. Never accept payment outside ARISE for work posted here." },
    { icon: "🚩", title: "Report suspicious activity", desc: "See a job that looks fake, offers unrealistic pay, or asks for personal documents upfront? Use the 🚩 flag button immediately." },
    { icon: "🤝", title: "Investors must be verified", desc: "On ARISE, investors complete identity and mandate verification before accessing your profile. You control when contact is shared." },
  ];

  const WARNING_SIGNS = [
    "Job offers an unusually high salary with no experience required",
    "Employer asks you to pay for a 'starter kit', 'training', or 'registration'",
    "Job requires you to travel to an unknown location before contract signing",
    "Contact happens only via WhatsApp with no verifiable company details",
    "Job description is vague but salary promises are very specific",
    "Employer asks for your banking details or ID before an interview",
  ];

  return (
    <div style={{ fontFamily: "'Sora', sans-serif", background: "#0A0A0F", color: "#E8E8F0", minHeight: "100vh", padding: "32px 24px" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap'); * { box-sizing:border-box; }`}</style>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <Link to="/" style={{ fontSize: 13, color: "#666", textDecoration: "none", display: "block", marginBottom: 32 }}>← Back</Link>

        <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 40 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "rgba(78,205,196,0.1)", border: "1px solid rgba(78,205,196,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>🛡️</div>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8 }}>ARISE Safety</h1>
            <p style={{ fontSize: 15, color: "#888", lineHeight: 1.7 }}>
              ARISE is built to structurally prevent job scams, human trafficking, and exploitation. Here's how we protect you — and how you can protect yourself.
            </p>
          </div>
        </div>

        {/* How ARISE protects you */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 11, color: "#4ECDC4", fontFamily: "DM Mono, monospace", fontWeight: 700, letterSpacing: 3, marginBottom: 20 }}>HOW ARISE PROTECTS YOU</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14 }}>
            {TIPS.map((t) => (
              <div key={t.title} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 20, display: "flex", gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(78,205,196,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{t.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{t.title}</div>
                  <div style={{ fontSize: 13, color: "#888", lineHeight: 1.6 }}>{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Warning signs */}
        <div style={{ background: "rgba(255,107,53,0.05)", border: "1px solid rgba(255,107,53,0.2)", borderRadius: 14, padding: 24, marginBottom: 40 }}>
          <div style={{ fontSize: 11, color: "#FF6B35", fontFamily: "DM Mono, monospace", fontWeight: 700, letterSpacing: 3, marginBottom: 16 }}>⚠ WARNING SIGNS — LEAVE & REPORT IMMEDIATELY</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {WARNING_SIGNS.map((w) => (
              <div key={w} style={{ display: "flex", gap: 10 }}>
                <span style={{ color: "#FF6B35", fontSize: 16, flexShrink: 0 }}>✗</span>
                <span style={{ fontSize: 14, color: "#CCC" }}>{w}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency resources */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 24, marginBottom: 40 }}>
          <div style={{ fontSize: 11, color: "#E8E8F0", fontFamily: "DM Mono, monospace", fontWeight: 700, letterSpacing: 3, marginBottom: 16 }}>EMERGENCY CONTACTS</div>
          {[
            { org: "SAPS (Police)", number: "10111", desc: "Emergency police response" },
            { org: "Human Trafficking Hotline", number: "0800 222 777", desc: "Free 24/7 hotline (Toll-free)" },
            { org: "SAPS Crime Stop", number: "08600 10111", desc: "Report crimes anonymously" },
            { org: "ARISE Safety Report", number: "report@arise.co.za", desc: "Report suspicious listings directly to us" },
          ].map((r) => (
            <div key={r.org} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{r.org}</div>
                <div style={{ fontSize: 12, color: "#666" }}>{r.desc}</div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#FF6B35", fontFamily: "DM Mono, monospace" }}>{r.number}</div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center" }}>
          <Link to="/jobs" style={{ background: "#FF6B35", color: "#fff", textDecoration: "none", padding: "13px 32px", borderRadius: 8, fontWeight: 700, fontSize: 14, fontFamily: "Sora, sans-serif" }}>
            Browse Safe, Verified Jobs →
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { fontFamily: "'Sora', sans-serif", background: "#0A0A0F", color: "#E8E8F0", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" },
  inner: { display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center" },
};

export default NotFound;