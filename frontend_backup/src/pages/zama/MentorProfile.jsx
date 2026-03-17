import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../services/api";
import { useToast } from "../../hooks/useToast";
import styles from "./MentorProfile.module.css";

export default function MentorProfile() {
  const { mentorId } = useParams();
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [bookingDate, setBookingDate] = useState("");
  const [booked, setBooked] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/mentors/${mentorId}`);
        setMentor(res.data);
      } catch {
        setMentor(MOCK_MENTOR);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [mentorId]);

  const handleBook = async () => {
    if (!bookingDate) return;
    setBooking(true);
    try {
      await api.post("/mentors/sessions/book", {
        mentor_id: mentorId,
        scheduled_at: bookingDate,
        focus_areas: mentor?.mentorship_areas?.slice(0, 2) || [],
      });
      setBooked(true);
      toast.success("Session booked! +25 ECS on completion.");
    } catch {
      setBooked(true);
      toast.error("Could not book — please try again.");
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <div className={styles.loading}>🤝 Loading mentor...</div>;
  if (!mentor) return null;

  const stars =
    "★".repeat(Math.round(mentor.average_rating || 0)) +
    "☆".repeat(5 - Math.round(mentor.average_rating || 0));

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <Link to="/mentors" className={styles.backLink}>
          ← Back to Mentors
        </Link>

        <div className={styles.grid}>
          <div className={styles.left}>
            <div className={styles.card}>
              <div className={styles.mentorHeader}>
                <div className={styles.avatar}>
                  {mentor.mentor_name?.[0] || "M"}
                </div>
                <div>
                  <h1 className={styles.mentorName}>{mentor.mentor_name}</h1>
                  <div className={styles.titleCompany}>
                    {mentor.current_title}
                    {mentor.current_company && ` · ${mentor.current_company}`}
                  </div>
                  <div className={styles.rating}>
                    {stars} {mentor.average_rating?.toFixed(1)} ·{" "}
                    {mentor.total_sessions} sessions
                  </div>
                </div>
              </div>
              {mentor.bio && <p className={styles.bio}>{mentor.bio}</p>}
              {mentor.is_bbee_linked && (
                <div className={styles.bbee}>
                  ✓ B-BBEE Enterprise Development Verified — Sessions are free for
                  eligible entrepreneurs
                </div>
              )}
            </div>

            <div className={styles.card}>
              <div className={styles.cardTitle}>MENTORSHIP AREAS</div>
              <div className={styles.areas}>
                {mentor.mentorship_areas?.map((a) => (
                  <span key={a} className={styles.areaTag}>
                    {a}
                  </span>
                ))}
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardTitle}>MENTOR DETAILS</div>
              {[
                { label: "Industry", value: mentor.industry },
                { label: "Experience", value: `${mentor.years_experience}+ years` },
                {
                  label: "Session duration",
                  value: `${mentor.session_duration_minutes} minutes`,
                },
                { label: "Sessions per month", value: mentor.sessions_per_month },
                { label: "Languages", value: mentor.languages?.join(", ") },
                {
                  label: "Preferred stages",
                  value: mentor.preferred_stages?.join(", "),
                },
              ]
                .filter((d) => d.value)
                .map((d) => (
                  <div key={d.label} className={styles.detailRow}>
                    <span className={styles.detailLabel}>{d.label}</span>
                    <span className={styles.detailValue}>{d.value}</span>
                  </div>
                ))}
            </div>
          </div>

          <div className={styles.right}>
            {booked ? (
              <div className={styles.booked}>
                <div className={styles.bookedIcon}>✅</div>
                <div className={styles.bookedTitle}>Session Booked!</div>
                <div className={styles.bookedDesc}>
                  A Huawei Meeting link has been added to your messages.
                </div>
                <div className={styles.bookedECS}>+25 ECS on completion</div>
                <Link to="/mentors/sessions" className={styles.bookedLink}>
                  View my sessions →
                </Link>
              </div>
            ) : (
              <div className={styles.card}>
                <div className={styles.cardTitle}>BOOK A SESSION</div>
                <div className={styles.cardDesc}>
                  {mentor.is_available
                    ? "✓ Available now"
                    : "Currently at capacity"}
                </div>
                <label className={styles.label}>Select date & time</label>
                <input
                  type="datetime-local"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className={styles.datetimeInput}
                />
                <button
                  onClick={handleBook}
                  disabled={!bookingDate || !mentor.is_available || booking}
                  className={styles.bookButton}
                >
                  {booking ? "Booking..." : "Confirm Session +25 ECS →"}
                </button>
              </div>
            )}

            <div className={styles.card}>
              <div className={styles.cardTitle}>AVAILABILITY</div>
              <div
                className={styles.availabilityStatus}
                style={{ color: mentor.is_available ? "#4ECDC4" : "#888" }}
              >
                {mentor.is_available
                  ? "● Available for bookings"
                  : "○ Currently at capacity"}
              </div>
              <div className={styles.availabilityDays}>
                {mentor.available_days?.map((d) => (
                  <span key={d} className={styles.dayTag}>
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const MOCK_MENTOR = {
  id: "m1",
  mentor_name: "Thandi Mokoena",
  current_title: "CEO",
  current_company: "Vodacom Enterprise",
  industry: "Telecommunications",
  years_experience: 18,
  bio: "Serial entrepreneur and corporate executive with 18 years experience across SA's tech and entrepreneurship ecosystem. Passionate about empowering young African women in business.",
  mentorship_areas: [
    "Fundraising",
    "Pitch Coaching",
    "Strategy",
    "Financial Planning",
    "Market Entry",
  ],
  preferred_stages: ["early", "growth"],
  preferred_sectors: ["Technology", "Fashion", "Retail"],
  languages: ["English", "isiZulu", "Sesotho"],
  average_rating: 4.9,
  total_sessions: 48,
  total_mentees: 23,
  is_bbee_linked: true,
  ed_rate_per_session: 1500,
  session_duration_minutes: 60,
  sessions_per_month: 8,
  is_available: true,
  available_days: ["monday", "wednesday", "friday"],
};