import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../services/api";
import { useToast } from "../../hooks/useToast";

export default function MentorSessions() {
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

  const toast = useToast();
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