import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function OnboardingComplete() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [count, setCount] = useState(0);
  const [showActions, setShowActions] = useState(false);

  const targetScore = user?.ecs_score || 175;

  useEffect(() => {
    refreshUser();
    // Animate ECS count up
    let frame;
    const duration = 2000;
    const start = Date.now();
    const animate = () => {
      const progress = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(targetScore * eased));
      if (progress < 1) frame = requestAnimationFrame(animate);
      else setShowActions(true);
    };
    const t = setTimeout(() => { frame = requestAnimationFrame(animate); }, 800);
    return () => { clearTimeout(t); cancelAnimationFrame(frame); };
  }, []);

  const persona = user?.primary_persona;
  const nextAction = {
    job_seeker: { label: "Browse Job Opportunities", to: "/jobs", icon: "💼" },
    freelancer: { label: "Find Freelance Projects", to: "/freelance", icon: "🔍" },
    entrepreneur: { label: "Start Your LaunchPad", to: "/launchpad", icon: "🚀" },
  }[persona] || { label: "Go to Dashboard", to: "/dashboard", icon: "⚡" };

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pop { 0% { transform:scale(0) rotate(-10deg); } 70% { transform:scale(1.15) rotate(3deg); } 100% { transform:scale(1) rotate(0); } }
        @keyframes shimmer { 0%,100% { opacity:0.6; } 50% { opacity:1; } }
        @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }
        .action-btn { display:flex; align-items:center; gap:12; background:#FF6B35; color:#fff; border:none; padding:16px 32px; border-radius:10px; font-size:16px; font-weight:700; cursor:pointer; font-family:'Sora',sans-serif; transition:all 0.2s; text-decoration:none; justify-content:center; }
        .action-btn:hover { background:#FF4500; transform:translateY(-2px); box-shadow:0 8px 24px rgba(255,107,53,0.35); }
        .secondary-btn { display:flex; align-items:center; justify-content:center; gap:8; background:transparent; color:#888; border:1px solid rgba(255,255,255,0.1); padding:14px 24px; border-radius:10px; font-size:14px; font-weight:600; cursor:pointer; font-family:'Sora',sans-serif; transition:all 0.2s; text-decoration:none; }
        .secondary-btn:hover { color:#CCC; border-color:rgba(255,255,255,0.2); }
      `}</style>

      {/* Floating particles */}
      {["🎉","✨","⚡","🌟","🎊"].map((e, i) => (
        <div key={i} style={{ position: "fixed", fontSize: 24, opacity: 0.4, animation: `float ${2 + i * 0.3}s ${i * 0.5}s ease-in-out infinite, shimmer 3s ${i * 0.4}s infinite`, top: `${10 + i * 15}%`, left: i % 2 === 0 ? `${5 + i * 3}%` : "auto", right: i % 2 !== 0 ? `${5 + i * 3}%` : "auto", pointerEvents: "none" }}>{e}</div>
      ))}

      <div style={styles.inner}>
        {/* Badge */}
        <div style={{ animation: "pop 0.6s 0.3s ease both" }}>
          <div style={styles.badge}>
            <div style={styles.badgeInner}>
              <div style={{ fontSize: 48 }}>⚡</div>
            </div>
          </div>
        </div>

        {/* Title */}
        <div style={{ textAlign: "center", animation: "fadeUp 0.5s 0.8s ease both" }}>
          <div style={{ fontSize: 13, color: "#FF6B35", fontFamily: "DM Mono, monospace", fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>TRUSTID CREATED</div>
          <h1 style={styles.title}>
            Welcome to ARISE,<br />
            <span style={{ color: "#FF6B35" }}>{user?.first_name}!</span>
          </h1>
          <p style={{ fontSize: 16, color: "#888", lineHeight: 1.7, maxWidth: 440, margin: "0 auto" }}>
            Your verified digital identity is live. Every action you take on ARISE builds your TrustID and grows your ECS score.
          </p>
        </div>

        {/* ECS Score reveal */}
        <div style={{ animation: "fadeUp 0.5s 1s ease both" }}>
          <div style={styles.ecsReveal}>
            <div style={{ fontSize: 11, color: "#666", fontFamily: "DM Mono, monospace", letterSpacing: 2, marginBottom: 8 }}>YOUR STARTING ECS SCORE</div>
            <div style={{ fontSize: 72, fontWeight: 900, color: "#FF6B35", lineHeight: 1, marginBottom: 4 }}>{count}</div>
            <div style={{ fontSize: 13, color: "#555", fontFamily: "DM Mono, monospace" }}>/ 850 · Building tier</div>
            <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden", marginTop: 16 }}>
              <div style={{ height: "100%", width: `${(count / 850) * 100}%`, background: "linear-gradient(90deg, #FF6B35, #FFD93D)", borderRadius: 3, transition: "width 0.1s" }} />
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div style={{ animation: "fadeUp 0.5s 1.2s ease both", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, width: "100%", maxWidth: 500 }}>
          {[
            { icon: "✉️", label: "Email Verified", points: "+25", done: user?.is_email_verified },
            { icon: "🪪", label: "Identity Scanned", points: "+50", done: user?.is_identity_verified },
            { icon: "⚡", label: "Skills Added", points: "+15", done: (user?.trust_completion_score || 0) > 20 },
          ].map((a) => (
            <div key={a.label} style={{ background: a.done ? "rgba(78,205,196,0.06)" : "rgba(255,255,255,0.03)", border: `1px solid ${a.done ? "rgba(78,205,196,0.2)" : "rgba(255,255,255,0.07)"}`, borderRadius: 10, padding: "14px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{a.icon}</div>
              <div style={{ fontSize: 11, color: a.done ? "#4ECDC4" : "#555", fontWeight: 700, marginBottom: 4 }}>{a.label}</div>
              <div style={{ fontSize: 12, color: a.done ? "#4ECDC4" : "#444", fontFamily: "DM Mono, monospace", fontWeight: 700 }}>{a.done ? a.points : "Pending"}</div>
            </div>
          ))}
        </div>

        {/* Actions */}
        {showActions && (
          <div style={{ animation: "fadeUp 0.5s ease forwards", display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 400 }}>
            <a href={nextAction.to} className="action-btn" onClick={(e) => { e.preventDefault(); navigate(nextAction.to); }}>
              <span>{nextAction.icon}</span> {nextAction.label}
            </a>
            <a href="/dashboard" className="secondary-btn" onClick={(e) => { e.preventDefault(); navigate("/dashboard"); }}>
              Go to Dashboard →
            </a>
          </div>
        )}

        <div style={{ fontSize: 12, color: "#444", fontFamily: "DM Mono, monospace", textAlign: "center", animation: "fadeUp 0.5s 1.5s ease both" }}>
          POWERED BY HUAWEI CLOUD · CODE4MZANSI 2026
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { fontFamily: "'Sora', sans-serif", background: "#0A0A0F", color: "#E8E8F0", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", position: "relative", overflow: "hidden" },
  inner: { maxWidth: 560, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 32 },
  badge: { width: 100, height: 100, borderRadius: "50%", background: "rgba(255,107,53,0.1)", border: "2px solid rgba(255,107,53,0.3)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 60px rgba(255,107,53,0.2)" },
  badgeInner: { width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, #FF6B35, #FF3D00)", display: "flex", alignItems: "center", justifyContent: "center" },
  title: { fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 900, lineHeight: 1.2, marginBottom: 16, letterSpacing: -1 },
  ecsReveal: { background: "rgba(255,107,53,0.06)", border: "1px solid rgba(255,107,53,0.2)", borderRadius: 16, padding: "28px 40px", textAlign: "center", minWidth: 280 },
};