import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../services/api";

// ─── MENTOR SESSIONS ─────────────────────────────────────────────────────────
export function MentorSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/mentors/sessions/my");
        setSessions(res.data.sessions?.length ? res.data.sessions : MOCK_SESSIONS);
      } catch { setSessions(MOCK_SESSIONS); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const statusColors = { scheduled: "#FFD93D", completed: "#4ECDC4", cancelled: "#555", no_show: "#FF4444" };

  return (
    <div style={styles.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap'); * { box-sizing:border-box; } @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>
      <div style={styles.inner}>
        <div style={{ animation: "fadeUp 0.4s ease forwards" }}>
          <h1 style={styles.title}>My Mentor Sessions</h1>
          <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
            <span style={{ fontSize: 13, color: "#888" }}>Total: <strong style={{ color: "#E8E8F0" }}>{sessions.length}</strong></span>
            <span style={{ fontSize: 13, color: "#888" }}>Completed: <strong style={{ color: "#4ECDC4" }}>{sessions.filter((s) => s.status === "completed").length}</strong></span>
            <span style={{ fontSize: 13, color: "#888" }}>ECS from sessions: <strong style={{ color: "#FFD93D" }}>+{sessions.filter((s) => s.status === "completed").length * 25}</strong></span>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#666" }}>🤝 Loading sessions...</div>
        ) : sessions.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "#666", background: "rgba(255,255,255,0.02)", borderRadius: 14 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🤝</div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>No sessions yet</div>
            <Link to="/mentors" style={{ color: "#4ECDC4", textDecoration: "none", fontWeight: 600, fontSize: 13 }}>Find a mentor →</Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {sessions.map((s, i) => {
              const color = statusColors[s.status] || "#888";
              const isExpanded = expanded === s.id;
              return (
                <div key={s.id} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${color}20`, borderRadius: 14, padding: 20, animation: `fadeUp 0.4s ${i * 0.05}s ease both` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{s.mentor_name}</div>
                      <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>
                        {new Date(s.scheduled_at).toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                        {" · "}{s.duration_minutes} min
                      </div>
                    </div>
                    <span style={{ fontSize: 10, background: `${color}15`, border: `1px solid ${color}30`, borderRadius: 12, padding: "3px 10px", color, fontWeight: 700, fontFamily: "DM Mono, monospace" }}>
                      {s.status.toUpperCase()}
                    </span>
                  </div>

                  {s.focus_areas?.length > 0 && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                      {s.focus_areas.map((f) => <span key={f} style={{ fontSize: 11, background: "rgba(78,205,196,0.08)", border: "1px solid rgba(78,205,196,0.2)", borderRadius: 12, padding: "3px 10px", color: "#4ECDC4" }}>{f}</span>)}
                    </div>
                  )}

                  {s.ecs_points_awarded > 0 && s.status === "completed" && (
                    <div style={{ fontSize: 12, color: "#FFD93D", marginBottom: 8 }}>⭐ +{s.ecs_points_awarded} ECS points awarded</div>
                  )}

                  {s.status === "completed" && s.ai_session_notes && (
                    <div>
                      <button onClick={() => setExpanded(isExpanded ? null : s.id)} style={{ background: "none", border: "none", color: "#4ECDC4", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "Sora, sans-serif", padding: 0 }}>
                        {isExpanded ? "▲ Hide AI session notes" : "▼ View AI session notes"}
                      </button>
                      {isExpanded && (
                        <div style={{ marginTop: 12, padding: 14, background: "rgba(78,205,196,0.04)", border: "1px solid rgba(78,205,196,0.15)", borderRadius: 8 }}>
                          <div style={{ fontSize: 11, color: "#4ECDC4", fontFamily: "DM Mono, monospace", marginBottom: 8 }}>AI NOTES · POWERED BY HUAWEI NLP</div>
                          <div style={{ fontSize: 13, color: "#AAA", lineHeight: 1.6, marginBottom: 12 }}>{s.ai_session_notes}</div>
                          {s.action_items?.length > 0 && (
                            <div>
                              <div style={{ fontSize: 11, color: "#555", fontFamily: "DM Mono, monospace", marginBottom: 6 }}>ACTION ITEMS</div>
                              {s.action_items.map((item, idx) => (
                                <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                                  <span style={{ color: "#FFD93D" }}>→</span>
                                  <span style={{ fontSize: 13, color: "#CCC" }}>{item}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {s.status === "scheduled" && s.meeting_link && (
                    <a href={s.meeting_link} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#4ECDC4", color: "#0A0A0F", textDecoration: "none", padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 800, marginTop: 8, fontFamily: "Sora, sans-serif" }}>
                      🎥 Join Huawei Meeting →
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <Link to="/mentors" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(78,205,196,0.1)", border: "1px solid rgba(78,205,196,0.25)", color: "#4ECDC4", textDecoration: "none", padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 700, fontFamily: "Sora, sans-serif" }}>
          + Book Another Session
        </Link>
      </div>
    </div>
  );
}

const MOCK_SESSIONS = [
  { id: "s1", mentor_name: "Thandi Mokoena", scheduled_at: new Date(Date.now() - 86400000 * 3).toISOString(), duration_minutes: 60, status: "completed", focus_areas: ["Fundraising", "Pitch Coaching"], ecs_points_awarded: 25, ai_session_notes: "Session focused on preparing Zama's first investor pitch. Key discussion points: revenue model clarity, market size articulation, and competitor differentiation. Thandi recommended referencing the Women Development Fund as a near-term funding target.", action_items: ["Refine revenue model slide to show 3-year projection", "Apply to Women Development Fund by end of month", "Practice pitch with 2 trusted advisors before investor meeting"], meeting_link: null },
  { id: "s2", mentor_name: "David Nkosi", scheduled_at: new Date(Date.now() + 86400000 * 5).toISOString(), duration_minutes: 60, status: "scheduled", focus_areas: ["Financial Planning", "Pricing Strategy"], ecs_points_awarded: 25, meeting_link: "https://meeting.huawei.com/arise/demo123" },
];


// ─── FUNDER DETAIL ────────────────────────────────────────────────────────────
export function FunderDetail() {
  const { funderId } = useParams();
  const [funder, setFunder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/fundmatch/${funderId}`);
        setFunder(res.data);
      } catch { setFunder(MOCK_FUNDER); }
      finally { setLoading(false); }
    };
    fetch();
  }, [funderId]);

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "Sora, sans-serif", color: "#FFD93D", background: "#0A0A0F" }}>💡 Loading funder details...</div>;
  if (!funder) return null;

  const scoreColor = funder.eligibility_score >= 80 ? "#4ECDC4" : funder.eligibility_score >= 60 ? "#FFD93D" : "#FF6B35";

  return (
    <div style={styles.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap'); * { box-sizing:border-box; }`}</style>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px" }}>
        <Link to="/fundmatch" style={{ fontSize: 13, color: "#666", textDecoration: "none", display: "block", marginBottom: 24 }}>← Back to FundMatch</Link>

        <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${scoreColor}25`, borderRadius: 16, padding: 28, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: "#FFD93D", fontFamily: "DM Mono, monospace", marginBottom: 8 }}>{funder.type?.toUpperCase().replace("_", " ")}</div>
              <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>{funder.name}</h1>
              <div style={{ fontSize: 15, color: "#888", marginBottom: 12 }}>{funder.funder}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#FFD93D" }}>Up to R{funder.max_amount?.toLocaleString()}</div>
            </div>
            <div style={{ textAlign: "center", background: `${scoreColor}10`, border: `1px solid ${scoreColor}25`, borderRadius: 12, padding: "16px 24px" }}>
              <div style={{ fontSize: 40, fontWeight: 900, color: scoreColor }}>{funder.eligibility_score}%</div>
              <div style={{ fontSize: 11, color: scoreColor, fontFamily: "DM Mono, monospace" }}>MATCH</div>
              {funder.is_eligible && <div style={{ fontSize: 10, color: "#4ECDC4", marginTop: 4, fontWeight: 700 }}>✓ YOU QUALIFY</div>}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={styles.card}>
            <div style={styles.cardTitle}>WHY YOU MATCH</div>
            {funder.eligibility_reasons?.map((r, i) => <div key={i} style={{ fontSize: 13, color: "#4ECDC4", marginBottom: 6, display: "flex", gap: 8 }}><span>✓</span><span>{r}</span></div>)}
            {funder.disqualifiers?.map((d, i) => <div key={i} style={{ fontSize: 13, color: "#FF8888", marginBottom: 6, display: "flex", gap: 8 }}><span>✗</span><span>{d}</span></div>)}
          </div>
          <div style={styles.card}>
            <div style={styles.cardTitle}>REQUIREMENTS</div>
            {funder.criteria?.map((c, i) => <div key={i} style={{ fontSize: 13, color: "#AAA", marginBottom: 6, display: "flex", gap: 8 }}><span style={{ color: "#FFD93D" }}>→</span><span>{c}</span></div>)}
          </div>
        </div>

        {/* Pre-filled application */}
        {funder.application_draft && (
          <div style={{ ...styles.card, marginTop: 16 }}>
            <div style={styles.cardTitle}>PRE-FILLED APPLICATION DRAFT</div>
            <div style={{ background: "rgba(255,215,61,0.04)", border: "1px solid rgba(255,215,61,0.15)", borderRadius: 8, padding: 14, marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "#FFD93D", marginBottom: 6 }}>✨ ARISE auto-filled {funder.application_draft.completion_percentage}% of this application from your TrustID</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {Object.entries(funder.application_draft).filter(([k]) => k !== "completion_percentage").map(([key, value]) => (
                <div key={key} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "10px 14px" }}>
                  <div style={{ fontSize: 10, color: "#555", fontFamily: "DM Mono, monospace", marginBottom: 3 }}>{key.replace(/_/g, " ").toUpperCase()}</div>
                  <div style={{ fontSize: 13, color: value.startsWith("[") ? "#666" : "#E8E8F0", fontStyle: value.startsWith("[") ? "italic" : "normal" }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          {!submitted ? (
            <button onClick={() => setSubmitted(true)} style={{ flex: 2, background: funder.is_eligible ? "#FFD93D" : "rgba(255,255,255,0.06)", color: funder.is_eligible ? "#0A0A0F" : "#888", border: "none", padding: "14px", borderRadius: 8, fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "Sora, sans-serif" }}>
              {funder.is_eligible ? "Submit Application →" : "View Official Application Page →"}
            </button>
          ) : (
            <div style={{ flex: 2, background: "rgba(78,205,196,0.08)", border: "1px solid rgba(78,205,196,0.2)", borderRadius: 8, padding: "14px", textAlign: "center", color: "#4ECDC4", fontWeight: 700, fontSize: 14 }}>
              ✅ Application submitted! We'll track the status for you.
            </div>
          )}
          <a href={funder.application_url || "#"} target="_blank" rel="noreferrer" style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#888", borderRadius: 8, padding: "14px", textDecoration: "none", textAlign: "center", fontSize: 13, fontFamily: "Sora, sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
            Official Site ↗
          </a>
        </div>
      </div>
    </div>
  );
}

const MOCK_FUNDER = { id: "nyda-001", name: "NYDA Youth Fund", funder: "National Youth Development Agency", type: "grant", max_amount: 100000, description: "Supports South African youth entrepreneurs aged 18-35.", eligibility_score: 87, is_eligible: true, eligibility_reasons: ["Age 23 meets requirement", "SA citizenship confirmed", "All sectors eligible"], disqualifiers: [], criteria: ["SA citizen or permanent resident", "Aged 18-35", "Viable business plan", "Registered or registerable business"], application_url: "https://www.nyda.gov.za", application_draft: { applicant_name: "Zama Dlamini", contact_email: "zama@example.com", province: "Gauteng", business_name: "Zama's Fashion Studio", cipc_number: "2024/234567/07", business_sector: "Fashion", funding_amount_requested: "R100,000", funding_purpose: "[Describe how you will use the funds]", completion_percentage: 75 } };

const styles = {
  page: { fontFamily: "'Sora', sans-serif", background: "#0A0A0F", color: "#E8E8F0", minHeight: "100vh", padding: "32px 24px" },
  inner: { maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 },
  title: { fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 800, marginBottom: 4 },
  card: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 22 },
  cardTitle: { fontSize: 11, color: "#555", fontFamily: "DM Mono, monospace", fontWeight: 700, letterSpacing: 2, marginBottom: 14 },
};

export default MentorSessions;