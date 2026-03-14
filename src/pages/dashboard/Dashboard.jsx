import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

// ─── Persona-specific quick actions ───────────────────────────────────────────
const QUICK_ACTIONS = {
  job_seeker: [
    { label: "Browse Jobs", icon: "💼", to: "/jobs", color: "#FF6B35" },
    { label: "My Applications", icon: "📋", to: "/applications", color: "#4ECDC4" },
    { label: "Skills Centre", icon: "⚡", to: "/skills", color: "#FFD93D" },
    { label: "My Profile", icon: "👤", to: "/profile", color: "#A8E6CF" },
  ],
  freelancer: [
    { label: "Find Projects", icon: "🔍", to: "/freelance", color: "#4ECDC4" },
    { label: "Active Projects", icon: "⚙️", to: "/freelance/active", color: "#FF6B35" },
    { label: "My Earnings", icon: "💰", to: "/freelance/earnings", color: "#FFD93D" },
    { label: "Portfolio", icon: "🎨", to: "/portfolio", color: "#A8E6CF" },
  ],
  entrepreneur: [
    { label: "LaunchPad", icon: "🚀", to: "/launchpad", color: "#FFD93D" },
    { label: "FundMatch", icon: "💡", to: "/fundmatch", color: "#FF6B35" },
    { label: "Find Mentors", icon: "🤝", to: "/mentors", color: "#4ECDC4" },
    { label: "Investors", icon: "📈", to: "/investors", color: "#A8E6CF" },
  ],
};

// ─── ECS Gauge ─────────────────────────────────────────────────────────────────
function ECSGaugeMini({ score }) {
  const pct = Math.min(100, (score / 850) * 100);
  const color = score < 300 ? "#FF6B35" : score < 500 ? "#FFD93D" : score < 650 ? "#4ECDC4" : "#A8E6CF";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ position: "relative", width: 100, height: 50, overflow: "hidden" }}>
        <svg viewBox="0 0 100 50" style={{ width: "100%", height: "100%" }}>
          <path d="M10,50 A40,40 0 0,1 90,50" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" strokeLinecap="round" />
          <path d="M10,50 A40,40 0 0,1 90,50" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={`${pct * 1.257} 125.7`} style={{ transition: "stroke-dasharray 1s ease" }} />
        </svg>
        <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", fontSize: 20, fontWeight: 800, color }}>{score}</div>
      </div>
      <div style={{ fontSize: 11, color: "#666", fontFamily: "DM Mono, monospace" }}>ECS SCORE / 850</div>
    </div>
  );
}

// ─── Verification Bar ──────────────────────────────────────────────────────────
function VerificationBar({ score }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: "#888" }}>TrustID Completion</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#FF6B35" }}>{score}%</span>
      </div>
      <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${score}%`, background: "linear-gradient(90deg, #FF6B35, #FFD93D)", borderRadius: 3, transition: "width 1s ease" }} />
      </div>
      {score < 60 && <div style={{ fontSize: 11, color: "#666", marginTop: 6 }}>Complete your profile to unlock more opportunities</div>}
    </div>
  );
}

export default function Dashboard() {
  const { user, isJobSeeker, isFreelancer, isEntrepreneur } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Determine persona for dashboard layout
  const persona = isEntrepreneur ? "entrepreneur" : isFreelancer ? "freelancer" : "job_seeker";
  const actions = QUICK_ACTIONS[persona] || QUICK_ACTIONS.job_seeker;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/users/me");
        setProfile(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return (
    <div style={styles.loading}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>⚡</div>
      <div style={{ color: "#FF6B35", fontFamily: "DM Mono, monospace", fontSize: 13 }}>Loading your dashboard...</div>
    </div>
  );

  const greetingTime = new Date().getHours();
  const greeting = greetingTime < 12 ? "Good morning" : greetingTime < 17 ? "Good afternoon" : "Good evening";
  const ecsScore = profile?.ecs_score || user?.ecs_score || 0;
  const trustScore = profile?.trust_completion_score || user?.trust_completion_score || 0;

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        .dash-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 20px; }
        .action-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 20px; cursor: pointer; transition: all 0.2s; text-decoration: none; display: flex; flex-direction: column; gap: 10; }
        .action-card:hover { transform: translateY(-2px); border-color: rgba(255,107,53,0.3); background: rgba(255,107,53,0.04); }
        .stat-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 20px; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.5s ease forwards; }
      `}</style>

      <div style={styles.inner}>
        {/* ── Header ── */}
        <div style={{ ...styles.header, animation: "fadeUp 0.4s ease forwards" }}>
          <div>
            <div style={{ fontSize: 13, color: "#666", fontFamily: "DM Mono, monospace", marginBottom: 6 }}>{greeting.toUpperCase()}</div>
            <h1 style={styles.title}>
              {greeting}, <span style={{ color: "#FF6B35" }}>{user?.first_name}</span> 👋
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
              <span style={styles.personaBadge}>
                {persona === "entrepreneur" ? "🚀" : persona === "freelancer" ? "🎨" : "🎓"}
                {" "}{persona.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}
              </span>
              {user?.is_identity_verified && (
                <span style={styles.verifiedBadge}>✓ Identity Verified</span>
              )}
            </div>
          </div>
          <Link to="/profile" style={{ textDecoration: "none" }}>
            <div style={styles.avatar}>
              {user?.profile_photo_url
                ? <img src={user.profile_photo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                : <span style={{ fontSize: 24 }}>{user?.first_name?.[0]}{user?.last_name?.[0]}</span>
              }
            </div>
          </Link>
        </div>

        {/* ── Top Stats Row ── */}
        <div style={styles.statsGrid}>
          {/* ECS Score */}
          <div className="stat-card" style={{ gridColumn: "span 1", display: "flex", flexDirection: "column", gap: 16, animation: "fadeUp 0.5s 0.1s ease both" }}>
            <div style={{ fontSize: 12, color: "#666", fontFamily: "DM Mono, monospace" }}>ENTREPRENEURSHIP CREDIT SCORE</div>
            <ECSGaugeMini score={ecsScore} />
            <Link to="/ecs" style={{ fontSize: 12, color: "#FF6B35", textDecoration: "none", textAlign: "center", fontWeight: 600 }}>View full breakdown →</Link>
          </div>

          {/* TrustID Completion */}
          <div className="stat-card" style={{ animation: "fadeUp 0.5s 0.15s ease both" }}>
            <div style={{ fontSize: 12, color: "#666", fontFamily: "DM Mono, monospace", marginBottom: 16 }}>TRUSTID PROFILE</div>
            <VerificationBar score={Math.round(trustScore)} />
            <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Identity", done: user?.is_identity_verified },
                { label: "Email", done: user?.is_email_verified },
                { label: "Skills", done: (profile?.skills?.length || 0) > 0 },
                { label: "Qualifications", done: (profile?.qualifications?.length || 0) > 0 },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "#888" }}>{item.label}</span>
                  <span style={{ fontSize: 11, color: item.done ? "#4ECDC4" : "#555", fontFamily: "DM Mono, monospace" }}>
                    {item.done ? "✓ Verified" : "○ Pending"}
                  </span>
                </div>
              ))}
            </div>
            <Link to="/profile/verify" style={{ display: "block", marginTop: 16, fontSize: 12, color: "#FF6B35", textDecoration: "none", fontWeight: 600 }}>Complete verification →</Link>
          </div>

          {/* Persona-specific stat */}
          <div className="stat-card" style={{ animation: "fadeUp 0.5s 0.2s ease both" }}>
            <div style={{ fontSize: 12, color: "#666", fontFamily: "DM Mono, monospace", marginBottom: 16 }}>
              {persona === "entrepreneur" ? "BUSINESS STATUS" : persona === "freelancer" ? "FREELANCE STATS" : "JOB SEARCH"}
            </div>
            {persona === "entrepreneur" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { label: "LaunchPad Progress", value: "Step 1 of 4", action: "/launchpad" },
                  { label: "FundMatch Grants", value: "6 matches found", action: "/fundmatch" },
                  { label: "Mentor Sessions", value: "0 completed", action: "/mentors" },
                  { label: "Investor Views", value: "Profile hidden", action: "/investors" },
                ].map((s) => (
                  <div key={s.label} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, color: "#888" }}>{s.label}</span>
                    <Link to={s.action} style={{ fontSize: 12, color: "#FFD93D", textDecoration: "none", fontWeight: 600 }}>{s.value}</Link>
                  </div>
                ))}
              </div>
            )}
            {persona === "freelancer" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { label: "Active Projects", value: "0" },
                  { label: "Total Earnings", value: "R0" },
                  { label: "Avg Rating", value: "—" },
                  { label: "Availability", value: user?.is_available ? "🟢 Available" : "🔴 Unavailable" },
                ].map((s) => (
                  <div key={s.label} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, color: "#888" }}>{s.label}</span>
                    <span style={{ fontSize: 12, color: "#4ECDC4", fontWeight: 600 }}>{s.value}</span>
                  </div>
                ))}
              </div>
            )}
            {persona === "job_seeker" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { label: "Applications Sent", value: "0" },
                  { label: "Profile Views", value: "0" },
                  { label: "Job Matches", value: "—" },
                  { label: "Interview Invites", value: "0" },
                ].map((s) => (
                  <div key={s.label} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, color: "#888" }}>{s.label}</span>
                    <span style={{ fontSize: 12, color: "#FF6B35", fontWeight: 600 }}>{s.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div style={{ animation: "fadeUp 0.5s 0.25s ease both" }}>
          <div style={styles.sectionLabel}>QUICK ACTIONS</div>
          <div style={styles.actionsGrid}>
            {actions.map((action, i) => (
              <Link key={action.label} className="action-card" to={action.to} style={{ animationDelay: `${0.3 + i * 0.05}s` }}>
                <div style={{ fontSize: 28 }}>{action.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#E8E8F0" }}>{action.label}</div>
                <div style={{ fontSize: 11, color: action.color, fontFamily: "DM Mono, monospace" }}>OPEN →</div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Next Steps / Tips ── */}
        <div className="dash-card" style={{ animation: "fadeUp 0.5s 0.4s ease both" }}>
          <div style={styles.sectionLabel}>NEXT STEPS TO GROW YOUR ECS</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            {[
              { title: "Upload ID to verify identity", points: "+50 ECS", to: "/onboarding/identity", color: "#FF6B35" },
              { title: "Add and assess your skills", points: "+15 ECS per skill", to: "/skills", color: "#4ECDC4" },
              { title: "Add work or study history", points: "+25 ECS", to: "/profile", color: "#FFD93D" },
              persona === "entrepreneur"
                ? { title: "Book your first mentor session", points: "+25 ECS", to: "/mentors", color: "#A8E6CF" }
                : { title: "Complete a project on ARISE", points: "+30 ECS", to: "/freelance", color: "#A8E6CF" },
            ].map((tip) => (
              <Link key={tip.title} to={tip.to} style={{ textDecoration: "none", background: "rgba(255,255,255,0.02)", border: `1px solid ${tip.color}20`, borderRadius: 10, padding: 14, display: "flex", flexDirection: "column", gap: 6, transition: "all 0.2s" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#CCC", lineHeight: 1.4 }}>{tip.title}</div>
                <div style={{ fontSize: 11, color: tip.color, fontFamily: "DM Mono, monospace", fontWeight: 700 }}>{tip.points}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { fontFamily: "'Sora', sans-serif", background: "#0A0A0F", color: "#E8E8F0", minHeight: "100vh", padding: "32px 24px" },
  inner: { maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 },
  loading: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0A0A0F", fontFamily: "Sora, sans-serif", color: "#E8E8F0" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  title: { fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 800, letterSpacing: -0.5 },
  personaBadge: { display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,107,53,0.1)", border: "1px solid rgba(255,107,53,0.2)", borderRadius: 20, padding: "4px 12px", fontSize: 12, color: "#FF6B35", fontWeight: 600 },
  verifiedBadge: { display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(78,205,196,0.1)", border: "1px solid rgba(78,205,196,0.2)", borderRadius: 20, padding: "4px 12px", fontSize: 12, color: "#4ECDC4", fontWeight: 600 },
  avatar: { width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg, #FF6B35, #FF3D00)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: "#fff", border: "2px solid rgba(255,107,53,0.3)", cursor: "pointer" },
  statsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 },
  sectionLabel: { fontSize: 11, color: "#555", fontFamily: "DM Mono, monospace", fontWeight: 700, letterSpacing: 2, marginBottom: 14 },
  actionsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 },
};