import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { useToast } from "../../hooks/useToast";
import styles from "./MentorSessions.module.css";

export default function MentorSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const toast = useToast();

  const statusColors = {
    scheduled: "#FFD93D",
    completed: "#4ECDC4",
    cancelled: "#555",
    no_show: "#FF4444",
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/mentors/sessions/my");
        setSessions(res.data.sessions?.length ? res.data.sessions : MOCK_SESSIONS);
      } catch {
        setSessions(MOCK_SESSIONS);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h1 className={styles.title}>My Mentor Sessions</h1>
          <div className={styles.stats}>
            <span>Total: <strong>{sessions.length}</strong></span>
            <span>Completed: <strong>{sessions.filter((s) => s.status === "completed").length}</strong></span>
            <span>ECS from sessions: <strong>+{sessions.filter((s) => s.status === "completed").length * 25}</strong></span>
          </div>
        </div>

        {loading ? (
          <div className={styles.loading}>🤝 Loading sessions...</div>
        ) : sessions.length === 0 ? (
          <div className={styles.noSessions}>
            <div className={styles.noSessionsIcon}>🤝</div>
            <div className={styles.noSessionsTitle}>No sessions yet</div>
            <Link to="/mentors" className={styles.noSessionsLink}>Find a mentor →</Link>
          </div>
        ) : (
          <div className={styles.sessionsList}>
            {sessions.map((s, i) => {
              const color = statusColors[s.status] || "#888";
              const isExpanded = expanded === s.id;
              return (
                <div
                  key={s.id}
                  className={styles.sessionCard}
                  style={{ borderColor: `${color}20`, animationDelay: `${i * 0.05}s` }}
                >
                  <div className={styles.sessionHeader}>
                    <div>
                      <div className={styles.mentorName}>{s.mentor_name}</div>
                      <div className={styles.sessionInfo}>
                        {new Date(s.scheduled_at).toLocaleDateString("en-ZA", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })} · {s.duration_minutes} min
                      </div>
                    </div>
                    <span
                      className={styles.statusBadge}
                      style={{ background: `${color}15`, borderColor: `${color}30`, color }}
                    >
                      {s.status.toUpperCase()}
                    </span>
                  </div>

                  {s.focus_areas?.length > 0 && (
                    <div className={styles.focusAreas}>
                      {s.focus_areas.map((f) => (
                        <span key={f} className={styles.focusTag}>{f}</span>
                      ))}
                    </div>
                  )}

                  {s.ecs_points_awarded > 0 && s.status === "completed" && (
                    <div className={styles.ecsPoints}>⭐ +{s.ecs_points_awarded} ECS points awarded</div>
                  )}

                  {s.status === "completed" && s.ai_session_notes && (
                    <div>
                      <button
                        onClick={() => setExpanded(isExpanded ? null : s.id)}
                        className={styles.toggleNotes}
                      >
                        {isExpanded ? "▲ Hide AI session notes" : "▼ View AI session notes"}
                      </button>
                      {isExpanded && (
                        <div className={styles.aiNotes}>
                          <div className={styles.aiHeader}>AI NOTES · POWERED BY HUAWEI NLP</div>
                          <div className={styles.aiText}>{s.ai_session_notes}</div>
                          {s.action_items?.length > 0 && (
                            <div>
                              <div className={styles.actionHeader}>ACTION ITEMS</div>
                              {s.action_items.map((item, idx) => (
                                <div key={idx} className={styles.actionItem}>
                                  <span>→</span>
                                  <span>{item}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {s.status === "scheduled" && s.meeting_link && (
                    <a href={s.meeting_link} target="_blank" rel="noreferrer" className={styles.meetingLink}>
                      🎥 Join Huawei Meeting →
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <Link to="/mentors" className={styles.bookAnother}>
          + Book Another Session
        </Link>
      </div>
    </div>
  );
}

const MOCK_SESSIONS = [
  {
    id: "s1",
    mentor_name: "Thandi Mokoena",
    scheduled_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    duration_minutes: 60,
    status: "completed",
    focus_areas: ["Fundraising", "Pitch Coaching"],
    ecs_points_awarded: 25,
    ai_session_notes:
      "Session focused on preparing Zama's first investor pitch. Key discussion points: revenue model clarity, market size articulation, and competitor differentiation. Thandi recommended referencing the Women Development Fund as a near-term funding target.",
    action_items: [
      "Refine revenue model slide to show 3-year projection",
      "Apply to Women Development Fund by end of month",
      "Practice pitch with 2 trusted advisors before investor meeting",
    ],
    meeting_link: null,
  },
  {
    id: "s2",
    mentor_name: "David Nkosi",
    scheduled_at: new Date(Date.now() + 86400000 * 5).toISOString(),
    duration_minutes: 60,
    status: "scheduled",
    focus_areas: ["Financial Planning", "Pricing Strategy"],
    ecs_points_awarded: 25,
    meeting_link: "https://meeting.huawei.com/arise/demo123",
  },
];