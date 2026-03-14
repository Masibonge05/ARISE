import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const PERSONAS = [
  {
    key: "job_seeker", icon: "🎓", color: "#FF6B35",
    title: "Job Seeker",
    desc: "Find verified, safe employment matched to your TrustID. No more fake jobs or scams.",
    bullets: ["Verified employer postings only", "AI job matching by your skills", "Apply with one tap — no CV needed"],
  },
  {
    key: "freelancer", icon: "🎨", color: "#4ECDC4",
    title: "Freelancer",
    desc: "Find clients, get paid safely with escrow, and build a verified portfolio.",
    bullets: ["Skill-matched project briefs", "Escrow-protected payments", "Client trust scores visible"],
  },
  {
    key: "entrepreneur", icon: "🚀", color: "#FFD93D",
    title: "Entrepreneur",
    desc: "Register your business, access grants, find mentors, and connect with investors.",
    bullets: ["CIPC registration in 4 minutes", "47+ funding programs matched", "B-BBEE mentor marketplace"],
  },
];

export default function PersonaSelect() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const handleSelect = async (persona) => {
    try {
      await api.patch("/users/me", { primary_persona: persona });
      await refreshUser();
    } catch {}
    navigate("/onboarding/identity");
  };

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing:border-box; }
        .persona-card { background:rgba(255,255,255,0.03); border:2px solid rgba(255,255,255,0.07); border-radius:16px; padding:32px; cursor:pointer; transition:all 0.2s; }
        .persona-card:hover { transform:translateY(-4px); }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <div style={styles.inner}>
        <div style={{ textAlign: "center", marginBottom: 48, animation: "fadeUp 0.4s ease forwards" }}>
          <div style={{ fontSize: 11, color: "#FF6B35", fontFamily: "DM Mono, monospace", letterSpacing: 3, marginBottom: 12 }}>STEP 1 OF 5 · BUILD YOUR TRUSTID</div>
          <h1 style={{ fontSize: "clamp(26px, 5vw, 42px)", fontWeight: 900, marginBottom: 12 }}>
            Welcome, <span style={{ color: "#FF6B35" }}>{user?.first_name}</span>.<br />Who are you on ARISE?
          </h1>
          <p style={{ fontSize: 15, color: "#888", maxWidth: 480, margin: "0 auto" }}>
            Choose your primary path. This shapes your dashboard, opportunities, and TrustID profile. You can add more later.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, maxWidth: 980, margin: "0 auto" }}>
          {PERSONAS.map((p, i) => (
            <div key={p.key} className="persona-card" style={{ borderColor: `${p.color}25`, animation: `fadeUp 0.4s ${0.1 + i * 0.1}s ease both` }} onClick={() => handleSelect(p.key)}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>{p.icon}</div>
              <div style={{ fontSize: 11, color: p.color, fontFamily: "DM Mono, monospace", fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>{p.key.replace("_", " ").toUpperCase()}</div>
              <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>{p.title}</div>
              <div style={{ fontSize: 13, color: "#888", lineHeight: 1.6, marginBottom: 20 }}>{p.desc}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {p.bullets.map((b) => (
                  <div key={b} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <div style={{ width: 16, height: 16, borderRadius: "50%", background: `${p.color}20`, border: `1px solid ${p.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: p.color, flexShrink: 0, marginTop: 1 }}>✓</div>
                    <span style={{ fontSize: 12, color: "#AAA" }}>{b}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 6, color: p.color, fontSize: 14, fontWeight: 700 }}>
                Start as {p.title} →
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { fontFamily: "'Sora', sans-serif", background: "#0A0A0F", color: "#E8E8F0", minHeight: "100vh", padding: "60px 24px" },
  inner: { maxWidth: 1100, margin: "0 auto" },
};