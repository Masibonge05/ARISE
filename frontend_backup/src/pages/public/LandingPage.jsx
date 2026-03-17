import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const PERSONAS = [
  {
    key: "sphiwe",
    name: "Sphiwe",
    role: "Graduate · Job Seeker",
    tagline: "Your degree is verified.\nYour skills are proven.\nThe right job finds you.",
    color: "#FF6B35",
    icon: "🎓",
    stat: "94% match rate",
  },
  {
    key: "sipho",
    name: "Sipho",
    role: "Graphic Designer · Freelancer",
    tagline: "Your portfolio speaks.\nYour clients are verified.\nYour payment is protected.",
    color: "#4ECDC4",
    icon: "🎨",
    stat: "R24,000 earned in 3 months",
  },
  {
    key: "zama",
    name: "Zama",
    role: "Entrepreneur · Founder",
    tagline: "Your business is registered.\nYour mentor is matched.\nYour investor is waiting.",
    color: "#FFD93D",
    icon: "🚀",
    stat: "R8.2M in grants facilitated",
  },
];

const STATS = [
  { value: "353+", label: "Teams building on ARISE" },
  { value: "R7.8B", label: "B-BBEE ED spend unlocked" },
  { value: "8.9M", label: "Youth we serve" },
  { value: "47+", label: "Funding programs matched" },
];

const FEATURES = [
  { icon: "✓", title: "TrustID Verified", desc: "Every person, employer and investor is verified. No fakes. No scams." },
  { icon: "⚡", title: "AI-Powered Matching", desc: "Huawei ModelArts matches you to jobs, clients, mentors and investors." },
  { icon: "🛡️", title: "Safe By Design", desc: "Trafficking red flags detected automatically. Your safety is structural." },
  { icon: "📈", title: "ECS Credit Score", desc: "Build a financial identity from platform activity. Unlock micro-loans." },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [activePersona, setActivePersona] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const interval = setInterval(() => {
      setActivePersona((p) => (p + 1) % PERSONAS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const persona = PERSONAS[activePersona];

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0A0A0F; }
        .arise-btn-primary {
          background: #FF6B35; color: #fff; border: none;
          padding: 14px 32px; border-radius: 8px; font-size: 15px;
          font-weight: 700; cursor: pointer; font-family: 'Sora', sans-serif;
          transition: all 0.2s; letter-spacing: 0.3px;
        }
        .arise-btn-primary:hover { background: #FF4500; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(255,107,53,0.35); }
        .arise-btn-ghost {
          background: transparent; color: #E8E8F0; border: 1px solid rgba(255,255,255,0.15);
          padding: 14px 32px; border-radius: 8px; font-size: 15px;
          font-weight: 600; cursor: pointer; font-family: 'Sora', sans-serif;
          transition: all 0.2s;
        }
        .arise-btn-ghost:hover { border-color: #FF6B35; color: #FF6B35; }
        .persona-tab {
          background: none; border: none; cursor: pointer;
          padding: 10px 20px; border-radius: 20px; font-family: 'Sora', sans-serif;
          font-size: 13px; font-weight: 600; transition: all 0.2s; color: #666;
        }
        .persona-tab.active { color: #E8E8F0; }
        .feature-card {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px; padding: 24px; transition: all 0.2s;
        }
        .feature-card:hover { border-color: rgba(255,107,53,0.3); background: rgba(255,107,53,0.04); transform: translateY(-2px); }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.6; } }
        .fade-up { animation: fadeUp 0.6s ease forwards; }
      `}</style>

      {/* ── Nav ── */}
      <nav style={styles.nav}>
        <div style={styles.navInner}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>⚡</div>
            <span style={styles.logoText}>ARISE</span>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button className="arise-btn-ghost" style={{ padding: "10px 20px", fontSize: 13 }} onClick={() => navigate("/login")}>Sign In</button>
            <button className="arise-btn-primary" style={{ padding: "10px 20px", fontSize: 13 }} onClick={() => navigate("/signup")}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={styles.hero}>
        {/* Background glow */}
        <div style={styles.heroBg1} />
        <div style={styles.heroBg2} />

        <div style={{ ...styles.heroContent, opacity: visible ? 1 : 0, transition: "opacity 0.8s" }}>
          {/* Eyebrow */}
          <div style={styles.eyebrow}>
            <span style={{ animation: "pulse 2s infinite", display: "inline-block", marginRight: 6 }}>●</span>
            Powered by Huawei Cloud · Built for South Africa
          </div>

          {/* Headline */}
          <h1 style={styles.headline}>
            One verified identity.<br />
            <span style={{ color: "#FF6B35" }}>Every opportunity.</span>
          </h1>

          <p style={styles.subheadline}>
            ARISE connects South Africa's youth and women entrepreneurs to safe employment,
            freelance work, funding, mentorship, and investment — all built on trust.
          </p>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
            <button className="arise-btn-primary" style={{ fontSize: 16, padding: "16px 40px" }} onClick={() => navigate("/signup")}>
              Build Your TrustID — Free
            </button>
            <button className="arise-btn-ghost" style={{ fontSize: 16, padding: "16px 40px" }} onClick={() => navigate("/govlink/login")}>
              GovLink — DSBD Portal
            </button>
          </div>

          {/* Stats */}
          <div style={styles.statsRow}>
            {STATS.map((s) => (
              <div key={s.label} style={styles.statItem}>
                <div style={styles.statValue}>{s.value}</div>
                <div style={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Persona Section ── */}
      <section style={styles.personaSection}>
        <div style={styles.sectionInner}>
          <p style={styles.sectionEyebrow}>THREE PERSONAS. ONE PLATFORM.</p>
          <h2 style={styles.sectionTitle}>Who are you on ARISE?</h2>

          {/* Persona tabs */}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 48 }}>
            {PERSONAS.map((p, i) => (
              <button
                key={p.key}
                className={`persona-tab ${i === activePersona ? "active" : ""}`}
                style={{ background: i === activePersona ? `${p.color}20` : "none", color: i === activePersona ? p.color : "#666", border: i === activePersona ? `1px solid ${p.color}40` : "1px solid transparent" }}
                onClick={() => setActivePersona(i)}
              >
                {p.icon} {p.name}
              </button>
            ))}
          </div>

          {/* Persona card */}
          <div key={activePersona} style={{ ...styles.personaCard, borderColor: `${persona.color}30`, animation: "fadeUp 0.4s ease forwards" }}>
            <div style={styles.personaLeft}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>{persona.icon}</div>
              <div style={{ fontSize: 13, color: persona.color, fontFamily: "DM Mono, monospace", fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>{persona.role.toUpperCase()}</div>
              <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.3, whiteSpace: "pre-line", marginBottom: 24 }}>{persona.tagline}</div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${persona.color}15`, border: `1px solid ${persona.color}30`, borderRadius: 20, padding: "6px 16px" }}>
                <span style={{ fontSize: 12, color: persona.color, fontWeight: 700 }}>✓ {persona.stat}</span>
              </div>
            </div>
            <div style={styles.personaRight}>
              <div style={{ fontSize: 13, color: "#666", fontFamily: "DM Mono, monospace", marginBottom: 16 }}>// WHAT ARISE DOES FOR {persona.name.toUpperCase()}</div>
              {["Verified digital identity", "AI-powered opportunity matching", "Safe, scam-free connections", "ECS score that builds financial access"].map((item) => (
                <div key={item} style={styles.personaFeatureRow}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: `${persona.color}20`, border: `1px solid ${persona.color}50`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: persona.color, flexShrink: 0 }}>✓</div>
                  <span style={{ fontSize: 14, color: "#CCC" }}>{item}</span>
                </div>
              ))}
              <button className="arise-btn-primary" style={{ marginTop: 32, background: persona.color, width: "100%" }} onClick={() => navigate("/signup")}>
                Start as {persona.name} →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: "80px 24px", background: "rgba(255,255,255,0.01)" }}>
        <div style={styles.sectionInner}>
          <p style={styles.sectionEyebrow}>WHAT SETS ARISE APART</p>
          <h2 style={{ ...styles.sectionTitle, marginBottom: 48 }}>Built different. Built for trust.</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-card">
                <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: "#888", lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "100px 24px", textAlign: "center", position: "relative" }}>
        <div style={{ ...styles.heroBg1, top: "20%", opacity: 0.4 }} />
        <div style={styles.sectionInner}>
          <p style={styles.sectionEyebrow}>CODE4MZANSI · INDUSTRY CHALLENGE TRACK</p>
          <h2 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 900, lineHeight: 1.2, marginBottom: 16 }}>
            South Africa has <span style={{ color: "#FF6B35" }}>R7.8 billion</span><br />in untapped enterprise development.
          </h2>
          <p style={{ fontSize: 16, color: "#888", maxWidth: 520, margin: "0 auto 40px", lineHeight: 1.7 }}>
            ARISE is the infrastructure that connects it to the entrepreneurs who need it most.
          </p>
          <button className="arise-btn-primary" style={{ fontSize: 16, padding: "18px 48px" }} onClick={() => navigate("/signup")}>
            Join ARISE Today — It's Free
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={styles.footer}>
        <div style={styles.navInner}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={styles.logoIcon}>⚡</div>
            <span style={{ fontWeight: 700, color: "#E8E8F0" }}>ARISE</span>
            <span style={{ color: "#444", fontSize: 13 }}>· Empowering South Africa's youth economy</span>
          </div>
          <div style={{ fontSize: 12, color: "#444", fontFamily: "DM Mono, monospace" }}>
            Powered by Huawei Cloud · Code4Mzansi 2026
          </div>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  page: { fontFamily: "'Sora', sans-serif", background: "#0A0A0F", color: "#E8E8F0", minHeight: "100vh" },
  nav: { position: "sticky", top: 0, zIndex: 100, background: "rgba(10,10,15,0.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 24px" },
  navInner: { maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", height: 64 },
  logo: { display: "flex", alignItems: "center", gap: 10 },
  logoIcon: { width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #FF6B35, #FF3D00)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 },
  logoText: { fontSize: 20, fontWeight: 800, letterSpacing: -0.5 },
  hero: { position: "relative", padding: "120px 24px 100px", textAlign: "center", overflow: "hidden" },
  heroBg1: { position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,107,53,0.12) 0%, transparent 70%)", pointerEvents: "none" },
  heroBg2: { position: "absolute", top: "30%", right: "10%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(78,205,196,0.08) 0%, transparent 70%)", pointerEvents: "none" },
  heroContent: { position: "relative", maxWidth: 800, margin: "0 auto" },
  eyebrow: { display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,107,53,0.1)", border: "1px solid rgba(255,107,53,0.2)", borderRadius: 20, padding: "6px 16px", fontSize: 12, color: "#FF6B35", fontFamily: "DM Mono, monospace", fontWeight: 600, marginBottom: 32 },
  headline: { fontSize: "clamp(36px, 6vw, 72px)", fontWeight: 900, lineHeight: 1.1, letterSpacing: -2, marginBottom: 24 },
  subheadline: { fontSize: "clamp(15px, 2vw, 18px)", color: "#888", maxWidth: 580, margin: "0 auto 40px", lineHeight: 1.7 },
  statsRow: { display: "flex", gap: 48, justifyContent: "center", flexWrap: "wrap", marginTop: 64, paddingTop: 48, borderTop: "1px solid rgba(255,255,255,0.06)" },
  statItem: { textAlign: "center" },
  statValue: { fontSize: 32, fontWeight: 800, color: "#FF6B35" },
  statLabel: { fontSize: 12, color: "#666", fontFamily: "DM Mono, monospace", marginTop: 4 },
  personaSection: { padding: "80px 24px", background: "rgba(255,255,255,0.01)", borderTop: "1px solid rgba(255,255,255,0.04)" },
  sectionInner: { maxWidth: 1100, margin: "0 auto" },
  sectionEyebrow: { fontFamily: "DM Mono, monospace", fontSize: 11, fontWeight: 700, letterSpacing: 3, color: "#FF6B35", textAlign: "center", marginBottom: 12 },
  sectionTitle: { fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 800, textAlign: "center", marginBottom: 16 },
  personaCard: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, background: "rgba(255,255,255,0.03)", border: "1px solid", borderRadius: 16, padding: 48 },
  personaLeft: { display: "flex", flexDirection: "column" },
  personaRight: { display: "flex", flexDirection: "column", borderLeft: "1px solid rgba(255,255,255,0.06)", paddingLeft: 48 },
  personaFeatureRow: { display: "flex", alignItems: "center", gap: 12, marginBottom: 14 },
  footer: { borderTop: "1px solid rgba(255,255,255,0.06)", padding: "24px", marginTop: "auto" },
};