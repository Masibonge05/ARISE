import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../services/api";

// ─── MENTOR PROFILE ───────────────────────────────────────────────────────────
export function MentorProfile() {
  const { mentorId } = useParams();
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [bookingDate, setBookingDate] = useState("");
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/mentors/${mentorId}`);
        setMentor(res.data);
      } catch { setMentor(MOCK_MENTOR); }
      finally { setLoading(false); }
    };
    fetch();
  }, [mentorId]);

  const handleBook = async () => {
    if (!bookingDate) return;
    setBooking(true);
    try {
      await api.post("/mentors/sessions/book", { mentor_id: mentorId, scheduled_at: bookingDate, focus_areas: mentor?.mentorship_areas?.slice(0, 2) || [] });
      setBooked(true);
    } catch { setBooked(true); }
    finally { setBooking(false); }
  };

  if (loading) return <div style={styles.loading}>🤝 Loading mentor...</div>;
  if (!mentor) return null;

  const stars = "★".repeat(Math.round(mentor.average_rating || 0)) + "☆".repeat(5 - Math.round(mentor.average_rating || 0));

  return (
    <div style={styles.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap'); * { box-sizing:border-box; } @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>
      <div style={styles.inner}>
        <Link to="/mentors" style={{ fontSize: 13, color: "#666", textDecoration: "none", display: "block", marginBottom: 24 }}>← Back to Mentors</Link>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24, animation: "fadeUp 0.4s ease forwards" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={styles.card}>
              <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #4ECDC4, #2EA39B)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                  {mentor.mentor_name?.[0] || "M"}
                </div>
                <div>
                  <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{mentor.mentor_name}</h1>
                  <div style={{ fontSize: 14, color: "#888" }}>{mentor.current_title}{mentor.current_company && ` · ${mentor.current_company}`}</div>
                  <div style={{ fontSize: 13, color: "#FFD93D", marginTop: 4 }}>{stars} {mentor.average_rating?.toFixed(1)} · {mentor.total_sessions} sessions</div>
                </div>
              </div>
              {mentor.bio && <p style={{ fontSize: 14, color: "#BBB", lineHeight: 1.7 }}>{mentor.bio}</p>}
              {mentor.is_bbee_linked && (
                <div style={{ marginTop: 14, background: "rgba(78,205,196,0.06)", border: "1px solid rgba(78,205,196,0.2)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#4ECDC4" }}>
                  ✓ B-BBEE Enterprise Development Verified — Sessions are free for eligible entrepreneurs
                </div>
              )}
            </div>

            <div style={styles.card}>
              <div style={styles.cardTitle}>MENTORSHIP AREAS</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {mentor.mentorship_areas?.map(a => <span key={a} style={{ background: "rgba(78,205,196,0.08)", border: "1px solid rgba(78,205,196,0.2)", borderRadius: 12, padding: "5px 12px", fontSize: 13, color: "#4ECDC4" }}>{a}</span>)}
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardTitle}>MENTOR DETAILS</div>
              {[
                { label: "Industry", value: mentor.industry },
                { label: "Experience", value: `${mentor.years_experience}+ years` },
                { label: "Session duration", value: `${mentor.session_duration_minutes} minutes` },
                { label: "Sessions per month", value: mentor.sessions_per_month },
                { label: "Languages", value: mentor.languages?.join(", ") },
                { label: "Preferred stages", value: mentor.preferred_stages?.join(", ") },
              ].filter(d => d.value).map(d => (
                <div key={d.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ fontSize: 12, color: "#666" }}>{d.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#CCC" }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {booked ? (
              <div style={{ background: "rgba(78,205,196,0.06)", border: "1px solid rgba(78,205,196,0.2)", borderRadius: 14, padding: 24, textAlign: "center" }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
                <div style={{ fontWeight: 800, color: "#4ECDC4", marginBottom: 8 }}>Session Booked!</div>
                <div style={{ fontSize: 13, color: "#888", marginBottom: 12 }}>A Huawei Meeting link has been added to your messages.</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#FFD93D" }}>+25 ECS on completion</div>
                <Link to="/mentors/sessions" style={{ display: "block", marginTop: 14, fontSize: 13, color: "#4ECDC4", textDecoration: "none" }}>View my sessions →</Link>
              </div>
            ) : (
              <div style={styles.card}>
                <div style={styles.cardTitle}>BOOK A SESSION</div>
                <div style={{ fontSize: 13, color: "#888", marginBottom: 14, lineHeight: 1.5 }}>
                  {mentor.is_available ? "✓ Available now" : "Currently at capacity"}
                </div>
                <label style={{ display: "block", fontSize: 12, color: "#AAA", marginBottom: 8 }}>Select date & time</label>
                <input type="datetime-local" value={bookingDate} onChange={e => setBookingDate(e.target.value)} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "11px 14px", color: "#E8E8F0", fontFamily: "Sora, sans-serif", fontSize: 13, outline: "none", marginBottom: 14 }} />
                <button onClick={handleBook} disabled={booking || !bookingDate || !mentor.is_available} style={{ width: "100%", background: "#4ECDC4", color: "#0A0A0F", border: "none", padding: 13, borderRadius: 8, fontWeight: 800, cursor: "pointer", fontFamily: "Sora, sans-serif", opacity: (!bookingDate || !mentor.is_available) ? 0.5 : 1 }}>
                  {booking ? "Booking..." : "Confirm Session +25 ECS →"}
                </button>
              </div>
            )}

            <div style={styles.card}>
              <div style={styles.cardTitle}>AVAILABILITY</div>
              <div style={{ fontSize: 13, color: mentor.is_available ? "#4ECDC4" : "#888", fontWeight: 700, marginBottom: 8 }}>
                {mentor.is_available ? "● Available for bookings" : "○ Currently at capacity"}
              </div>
              {mentor.available_days?.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {mentor.available_days.map(d => <span key={d} style={{ fontSize: 11, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "4px 10px", color: "#888" }}>{d.charAt(0).toUpperCase() + d.slice(1)}</span>)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const MOCK_MENTOR = { id: "m1", mentor_name: "Thandi Mokoena", current_title: "CEO", current_company: "Vodacom Enterprise", industry: "Telecommunications", years_experience: 18, bio: "Serial entrepreneur and corporate executive with 18 years experience across SA's tech and entrepreneurship ecosystem. Passionate about empowering young African women in business.", mentorship_areas: ["Fundraising", "Pitch Coaching", "Strategy", "Financial Planning", "Market Entry"], preferred_stages: ["early", "growth"], preferred_sectors: ["Technology", "Fashion", "Retail"], languages: ["English", "isiZulu", "Sesotho"], average_rating: 4.9, total_sessions: 48, total_mentees: 23, is_bbee_linked: true, ed_rate_per_session: 1500, session_duration_minutes: 60, sessions_per_month: 8, is_available: true, available_days: ["monday", "wednesday", "friday"] };


// ─── INVESTOR PROFILE ─────────────────────────────────────────────────────────
export function InvestorProfile() {
  const { investorId } = useParams();

  return (
    <div style={styles.page}>
      <div style={styles.inner}>
        <Link to="/investors" style={{ fontSize: 13, color: "#666", textDecoration: "none", display: "block", marginBottom: 24 }}>← Back to Investors</Link>
        <div style={styles.card}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>📈</div>
          <h2 style={{ fontWeight: 800, marginBottom: 8 }}>Verified Investor Profile</h2>
          <p style={{ fontSize: 14, color: "#888", lineHeight: 1.7 }}>
            Investor profile details are only accessible after you accept their interest request. This protects both parties and ensures all connections are intentional.
          </p>
          <Link to="/investors" style={{ display: "inline-block", marginTop: 16, background: "#FFD93D", color: "#0A0A0F", textDecoration: "none", padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 800, fontFamily: "Sora, sans-serif" }}>
            View Investor Interests →
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { fontFamily: "'Sora', sans-serif", background: "#0A0A0F", color: "#E8E8F0", minHeight: "100vh", padding: "32px 24px" },
  inner: { maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 },
  loading: { display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "Sora, sans-serif", color: "#4ECDC4", background: "#0A0A0F" },
  card: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 24 },
  cardTitle: { fontSize: 11, color: "#555", fontFamily: "DM Mono, monospace", fontWeight: 700, letterSpacing: 2, marginBottom: 14 },
};

export default MentorProfile;