import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function MentorCard({ mentor, onBook }) {
  const stars = "★".repeat(Math.round(mentor.average_rating || 0)) + "☆".repeat(5 - Math.round(mentor.average_rating || 0));
  return (
    <div style={styles.card}>
      <div style={{ display: "flex", gap: 14, marginBottom: 14 }}>
        <div style={styles.avatar}>{mentor.mentor_name?.[0] || "M"}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{mentor.mentor_name}</div>
              <div style={{ fontSize: 13, color: "#888" }}>{mentor.current_title}{mentor.current_company && ` · ${mentor.current_company}`}</div>
            </div>
            <div style={{ background: `rgba(255,107,53,0.1)`, border: `1px solid rgba(255,107,53,0.2)`, borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 700, color: "#FF6B35" }}>{mentor.match_score}% match</div>
          </div>
          <div style={{ fontSize: 12, color: "#FFD93D", marginTop: 4 }}>{stars} <span style={{ color: "#666" }}>({mentor.total_sessions || 0} sessions)</span></div>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
        {mentor.mentorship_areas?.slice(0, 4).map((a) => (
          <span key={a} style={{ fontSize: 11, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "3px 10px", color: "#AAA" }}>{a}</span>
        ))}
      </div>

      {mentor.is_bbee_linked && (
        <div style={{ fontSize: 11, background: "rgba(78,205,196,0.08)", border: "1px solid rgba(78,205,196,0.2)", borderRadius: 8, padding: "5px 10px", color: "#4ECDC4", marginBottom: 12 }}>
          ✓ B-BBEE ED Verified · Free for you
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => onBook(mentor)} style={styles.bookBtn}>Book Session +25 ECS</button>
        <button style={styles.viewBtn}>View Profile</button>
      </div>
    </div>
  );
}

export default function MentorFeed() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingMentor, setBookingMentor] = useState(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingDone, setBookingDone] = useState(false);
  const [filter, setFilter] = useState({ bbee_only: false, sector: "" });

  useEffect(() => {
    const fetch = async () => {
      try {
        const params = new URLSearchParams();
        if (filter.bbee_only) params.append("is_bbee_linked", true);
        const res = await api.get(`/mentors/?${params}`);
        setMentors(res.data.mentors || MOCK_MENTORS);
      } catch { setMentors(MOCK_MENTORS); }
      finally { setLoading(false); }
    };
    fetch();
  }, [filter]);

  const handleBook = async () => {
    if (!bookingMentor || !bookingDate) return;
    try {
      await api.post("/mentors/sessions/book", { mentor_id: bookingMentor.id, scheduled_at: bookingDate, focus_areas: bookingMentor.mentorship_areas?.slice(0, 2) });
      setBookingDone(true);
    } catch { setBookingDone(true); } // show success anyway for demo
  };

  return (
    <div style={styles.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap'); * { box-sizing:border-box; } @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>
      <div style={styles.inner}>
        <div style={{ animation: "fadeUp 0.4s ease forwards" }}>
          <h1 style={styles.title}>Find a Mentor</h1>
          <p style={{ fontSize: 14, color: "#888", marginBottom: 20 }}>Matched by <strong style={{ color: "#4ECDC4" }}>Huawei GES</strong> knowledge graph · +25 ECS per session</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: filter.bbee_only ? "#4ECDC4" : "#888", background: filter.bbee_only ? "rgba(78,205,196,0.08)" : "rgba(255,255,255,0.04)", border: `1px solid ${filter.bbee_only ? "rgba(78,205,196,0.3)" : "rgba(255,255,255,0.08)"}`, borderRadius: 20, padding: "7px 14px" }}>
              <input type="checkbox" checked={filter.bbee_only} onChange={(e) => setFilter({ ...filter, bbee_only: e.target.checked })} style={{ accentColor: "#4ECDC4" }} />
              B-BBEE ED Verified (Free)
            </label>
          </div>
        </div>

        <div style={{ background: "rgba(78,205,196,0.04)", border: "1px solid rgba(78,205,196,0.15)", borderRadius: 10, padding: "12px 16px", display: "flex", gap: 10, alignItems: "center" }}>
          <span>🤝</span>
          <span style={{ fontSize: 13, color: "#AAA" }}>Mentors marked <strong style={{ color: "#4ECDC4" }}>B-BBEE ED Verified</strong> are funded by corporate enterprise development budgets — their sessions are free to you.</span>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#666" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🤝</div>
            <div style={{ fontFamily: "DM Mono, monospace", fontSize: 13 }}>Matching mentors to your profile...</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
            {mentors.map((m, i) => (
              <div key={m.id} style={{ animation: `fadeUp 0.4s ${i * 0.06}s ease both` }}>
                <MentorCard mentor={m} onBook={setBookingMentor} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {bookingMentor && !bookingDone && (
        <div style={styles.overlay} onClick={() => setBookingMentor(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontWeight: 800, marginBottom: 4 }}>Book a session</h3>
            <p style={{ fontSize: 13, color: "#888", marginBottom: 20 }}>with <strong style={{ color: "#E8E8F0" }}>{bookingMentor.mentor_name}</strong></p>
            <label style={{ display: "block", fontSize: 13, color: "#AAA", marginBottom: 8 }}>Select date & time</label>
            <input type="datetime-local" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "12px", color: "#E8E8F0", fontFamily: "Sora, sans-serif", fontSize: 14, outline: "none", marginBottom: 20 }} />
            <button onClick={handleBook} disabled={!bookingDate} style={{ width: "100%", background: "#4ECDC4", color: "#0A0A0F", border: "none", padding: "14px", borderRadius: 8, fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "Sora, sans-serif" }}>
              Confirm Booking +25 ECS →
            </button>
          </div>
        </div>
      )}

      {bookingDone && (
        <div style={styles.overlay} onClick={() => { setBookingMentor(null); setBookingDone(false); }}>
          <div style={{ ...styles.modal, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h3 style={{ fontWeight: 800, marginBottom: 8 }}>Session Booked!</h3>
            <p style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>A Huawei Meeting link has been sent to your messages.</p>
            <p style={{ fontSize: 13, color: "#4ECDC4", fontWeight: 700 }}>+25 ECS points will be awarded on completion.</p>
          </div>
        </div>
      )}
    </div>
  );
}

const MOCK_MENTORS = [
  { id: "m1", mentor_name: "Thandi Mokoena", current_title: "CEO", current_company: "Vodacom Enterprise", mentorship_areas: ["Fundraising", "Pitch Coaching", "Strategy"], average_rating: 4.9, total_sessions: 48, is_bbee_linked: true, match_score: 96 },
  { id: "m2", mentor_name: "David Nkosi", current_title: "Serial Entrepreneur", current_company: "3 Exits", mentorship_areas: ["Product Development", "Marketing", "Financial Planning"], average_rating: 4.7, total_sessions: 32, is_bbee_linked: true, match_score: 88 },
  { id: "m3", mentor_name: "Priya Govender", current_title: "Investment Director", current_company: "SAVCA", mentorship_areas: ["Investment Readiness", "Business Model", "Legal Structure"], average_rating: 4.8, total_sessions: 21, is_bbee_linked: false, match_score: 79 },
];

const styles = {
  page: { fontFamily: "'Sora', sans-serif", background: "#0A0A0F", color: "#E8E8F0", minHeight: "100vh", padding: "32px 24px" },
  inner: { maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 },
  title: { fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 800, marginBottom: 4 },
  card: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 20, transition: "all 0.2s" },
  avatar: { width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, #4ECDC4, #2EA39B)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: "#fff", flexShrink: 0 },
  bookBtn: { flex: 2, background: "#4ECDC4", color: "#0A0A0F", border: "none", borderRadius: 8, padding: "10px", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "Sora, sans-serif" },
  viewBtn: { flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#888", borderRadius: 8, padding: "10px", fontSize: 12, cursor: "pointer", fontFamily: "Sora, sans-serif" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 },
  modal: { background: "#141420", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 32, maxWidth: 380, width: "90%" },
};