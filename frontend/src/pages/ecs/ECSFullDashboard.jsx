import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import api from "../../services/api";

const SCORE_BANDS = [
  { min: 0, max: 299, label: "Building", color: "#FF6B35", desc: "Keep growing your profile to unlock opportunities" },
  { min: 300, max: 499, label: "Developing", color: "#FFD93D", desc: "Good progress! More opportunities unlocking" },
  { min: 500, max: 649, label: "Established", color: "#4ECDC4", desc: "Strong profile — investors and lenders notice you" },
  { min: 650, max: 749, label: "Thriving", color: "#A8E6CF", desc: "Excellent standing. Premium opportunities unlocked" },
  { min: 750, max: 850, label: "Elite", color: "#FF6B35", desc: "Top tier. All ARISE opportunities available" },
];

function getScoreBand(score) {
  return SCORE_BANDS.find((b) => score >= b.min && score <= b.max) || SCORE_BANDS[0];
}

function AnimatedScore({ target, color }) {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    let frame;
    const duration = 1500;
    const start = Date.now();
    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return (
    <div style={{ fontSize: 80, fontWeight: 900, color, lineHeight: 1, letterSpacing: -3, transition: "color 0.3s" }}>
      {current}
    </div>
  );
}

function FactorBar({ name, score, max, color, description }) {
  const pct = Math.min(100, (score / max) * 100);
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div>
          <span style={{ fontSize: 14, fontWeight: 600 }}>{name}</span>
          <span style={{ fontSize: 11, color: "#555", marginLeft: 8, fontFamily: "DM Mono, monospace" }}>{description}</span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
          <span style={{ fontSize: 20, fontWeight: 800, color }}>{score}</span>
          <span style={{ fontSize: 11, color: "#555", fontFamily: "DM Mono, monospace" }}>/{max}</span>
        </div>
      </div>
      <div style={{ height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${color}99, ${color})`, borderRadius: 4, transition: "width 1.2s ease" }} />
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#1A1A2E", border: "1px solid rgba(255,107,53,0.3)", borderRadius: 8, padding: "10px 14px" }}>
      <div style={{ fontSize: 11, color: "#666", fontFamily: "DM Mono, monospace", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: "#FF6B35" }}>{payload[0].value}</div>
    </div>
  );
};

export default function ECSFullDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/ecs/");
        setData(res.data);
      } catch (e) {
        setData(MOCK_ECS_DATA);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "80vh", fontFamily: "Sora, sans-serif", color: "#E8E8F0", background: "#0A0A0F", gap: 12 }}>
      <div style={{ fontSize: 32 }}>⭐</div>
      <div style={{ color: "#FF6B35", fontFamily: "DM Mono, monospace", fontSize: 13 }}>Calculating your ECS score...</div>
    </div>
  );

  const band = getScoreBand(data.score);
  const factors = data.factors || {};

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        .ecs-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 24px; }
        .milestone-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 14px; cursor: pointer; transition: all 0.2s; text-decoration: none; display: block; }
        .milestone-card:hover { border-color: rgba(255,107,53,0.3); transform: translateY(-1px); }
        .lender-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(78,205,196,0.2); border-radius: 10px; padding: 16px; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes scoreGlow { 0%,100% { text-shadow: 0 0 40px rgba(255,107,53,0.3); } 50% { text-shadow: 0 0 80px rgba(255,107,53,0.6); } }
      `}</style>

      <div style={styles.inner}>
        {/* ── Hero Score ── */}
        <div style={{ ...styles.heroCard, borderColor: `${band.color}25`, animation: "fadeUp 0.5s ease forwards" }}>
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 50%, ${band.color}08, transparent 60%)`, borderRadius: 16, pointerEvents: "none" }} />
          <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 24 }}>
            <div>
              <div style={{ fontSize: 11, color: "#666", fontFamily: "DM Mono, monospace", letterSpacing: 2, marginBottom: 8 }}>ENTREPRENEURSHIP CREDIT SCORE</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
                <AnimatedScore target={data.score} color={band.color} />
                <div style={{ fontSize: 24, color: "#444", fontFamily: "DM Mono, monospace" }}>/ 850</div>
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${band.color}15`, border: `1px solid ${band.color}30`, borderRadius: 20, padding: "6px 16px", marginBottom: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: band.color }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: band.color }}>{band.label}</span>
              </div>
              <p style={{ fontSize: 14, color: "#888", maxWidth: 400 }}>{band.desc}</p>
            </div>

            {/* Score bands legend */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {SCORE_BANDS.map((b) => (
                <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 8, opacity: data.score >= b.min && data.score <= b.max ? 1 : 0.35 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: b.color }} />
                  <span style={{ fontSize: 12, color: "#AAA", fontFamily: "DM Mono, monospace" }}>{b.min}–{b.max}</span>
                  <span style={{ fontSize: 12, fontWeight: data.score >= b.min && data.score <= b.max ? 700 : 400, color: data.score >= b.min && data.score <= b.max ? b.color : "#555" }}>{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Score progress bar */}
          <div style={{ position: "relative", marginTop: 24 }}>
            <div style={{ height: 10, background: "rgba(255,255,255,0.06)", borderRadius: 5, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(data.score / 850) * 100}%`, background: `linear-gradient(90deg, #FF6B35, ${band.color})`, borderRadius: 5, transition: "width 1.5s ease" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              <span style={{ fontSize: 10, color: "#555", fontFamily: "DM Mono, monospace" }}>0</span>
              <span style={{ fontSize: 10, color: "#555", fontFamily: "DM Mono, monospace" }}>850</span>
            </div>
          </div>
        </div>

        {/* ── Factors + Chart Row ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Factors */}
          <div className="ecs-card" style={{ animation: "fadeUp 0.5s 0.1s ease both" }}>
            <div style={styles.cardTitle}>5 CONTRIBUTING FACTORS</div>
            {Object.entries(factors).map(([key, f]) => (
              <FactorBar
                key={key}
                name={f.label}
                score={f.score}
                max={f.max}
                color={f.score / f.max > 0.7 ? "#4ECDC4" : f.score / f.max > 0.4 ? "#FFD93D" : "#FF6B35"}
                description={`max ${f.max}`}
              />
            ))}
          </div>

          {/* Score history chart */}
          <div className="ecs-card" style={{ animation: "fadeUp 0.5s 0.15s ease both" }}>
            <div style={styles.cardTitle}>SCORE HISTORY</div>
            {data.history?.length > 1 ? (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={data.history} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#555", fontFamily: "DM Mono" }} tickFormatter={(v) => new Date(v).toLocaleDateString("en-ZA", { month: "short", day: "numeric" })} />
                  <YAxis tick={{ fontSize: 10, fill: "#555", fontFamily: "DM Mono" }} domain={[0, 850]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="score" stroke="#FF6B35" strokeWidth={2} fill="url(#scoreGrad)" dot={{ fill: "#FF6B35", r: 3 }} activeDot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 240, color: "#555" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📈</div>
                <div style={{ fontSize: 13 }}>Complete actions to build your score history</div>
              </div>
            )}

            {/* Recent events */}
            {data.history?.length > 0 && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ fontSize: 11, color: "#555", fontFamily: "DM Mono, monospace", marginBottom: 8 }}>RECENT EVENTS</div>
                {data.history.slice(-3).reverse().map((h, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: "#888" }}>{h.event || "Score update"}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: h.points_change > 0 ? "#4ECDC4" : "#FF6B35", fontFamily: "DM Mono, monospace" }}>
                      {h.points_change > 0 ? "+" : ""}{h.points_change}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Next Milestones ── */}
        {data.next_milestones?.length > 0 && (
          <div className="ecs-card" style={{ animation: "fadeUp 0.5s 0.2s ease both" }}>
            <div style={styles.cardTitle}>BOOST YOUR SCORE — NEXT STEPS</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
              {data.next_milestones.map((m, i) => (
                <Link key={i} to={m.action_url || "/profile"} className="milestone-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#CCC", lineHeight: 1.4, flex: 1 }}>{m.action}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#FF6B35", fontFamily: "DM Mono, monospace", marginLeft: 8, whiteSpace: "nowrap" }}>+{m.points} pts</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#555", fontFamily: "DM Mono, monospace", textTransform: "uppercase" }}>{m.category}</div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Micro-Lenders ── */}
        <div style={{ animation: "fadeUp 0.5s 0.25s ease both" }}>
          <div style={styles.cardTitle}>MICRO-LENDERS UNLOCKED BY YOUR ECS</div>
          {data.eligible_lenders?.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
              {data.eligible_lenders.map((l) => (
                <div key={l.id} className="lender-card">
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{l.name}</div>
                  <div style={{ fontSize: 13, color: "#888", marginBottom: 10, lineHeight: 1.5 }}>{l.description}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: "#666" }}>Max loan</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#4ECDC4" }}>R{l.max_loan?.toLocaleString()}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <span style={{ fontSize: 12, color: "#666" }}>Min ECS required</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#4ECDC4" }}>{l.min_ecs}</span>
                  </div>
                  <a href={l.website || "#"} target="_blank" rel="noreferrer" style={{ display: "block", textAlign: "center", background: "rgba(78,205,196,0.1)", border: "1px solid rgba(78,205,196,0.25)", borderRadius: 8, padding: "8px", fontSize: 13, color: "#4ECDC4", textDecoration: "none", fontWeight: 600 }}>
                    Apply Now →
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="ecs-card" style={{ textAlign: "center", padding: 40, color: "#555" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🔒</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>No lenders unlocked yet</div>
              <div style={{ fontSize: 13 }}>Reach a score of 300+ to start unlocking micro-lending options.</div>
            </div>
          )}
        </div>

        {/* ── Profile tip ── */}
        {data.profile_tip && (
          <div style={{ background: "rgba(255,107,53,0.06)", border: "1px solid rgba(255,107,53,0.2)", borderRadius: 10, padding: "14px 20px", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 20 }}>💡</span>
            <span style={{ fontSize: 13, color: "#CCC" }}>{data.profile_tip}</span>
          </div>
        )}
      </div>
    </div>
  );
}

const MOCK_ECS_DATA = {
  score: 340,
  max_score: 850,
  score_band: { band: "Building", color: "#FF6B35" },
  factors: {
    formalization: { score: 85, max: 200, label: "Business Formalization" },
    mentorship: { score: 0, max: 150, label: "Mentorship Participation" },
    grant_compliance: { score: 30, max: 150, label: "Grant Compliance" },
    revenue: { score: 150, max: 200, label: "Revenue Activity" },
    community: { score: 75, max: 150, label: "Community Reputation" },
  },
  history: [
    { date: new Date(Date.now() - 86400000 * 30).toISOString(), score: 200, event: "Profile created", points_change: 200 },
    { date: new Date(Date.now() - 86400000 * 20).toISOString(), score: 250, event: "Email verified", points_change: 25 },
    { date: new Date(Date.now() - 86400000 * 10).toISOString(), score: 300, event: "Skill assessed", points_change: 15 },
    { date: new Date().toISOString(), score: 340, event: "Project completed", points_change: 30 },
  ],
  next_milestones: [
    { action: "Verify your identity via ID upload", points: 50, category: "formalization", action_url: "/onboarding/identity" },
    { action: "Book your first mentor session", points: 25, category: "mentorship", action_url: "/mentors" },
    { action: "Apply for a matched grant", points: 30, category: "grants", action_url: "/fundmatch" },
  ],
  eligible_lenders: [],
  profile_tip: "Upload your ID to verify your identity and gain 50 ECS points",
};

const styles = {
  page: { fontFamily: "'Sora', sans-serif", background: "#0A0A0F", color: "#E8E8F0", minHeight: "100vh", padding: "32px 24px" },
  inner: { maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 },
  heroCard: { background: "rgba(255,255,255,0.03)", border: "1px solid", borderRadius: 16, padding: 32, position: "relative", overflow: "hidden" },
  cardTitle: { fontSize: 11, color: "#555", fontFamily: "DM Mono, monospace", fontWeight: 700, letterSpacing: 2, marginBottom: 20 },
};