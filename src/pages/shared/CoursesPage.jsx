import { useState } from "react";
import { Link } from "react-router-dom";

// ─── COURSES PAGE ─────────────────────────────────────────────────────────────
const COURSES = [
  { id: "c1", title: "UI/UX Design Fundamentals", provider: "Google Career Certificates", duration: "6 weeks", level: "Beginner", skill: "UI Design", ecs: 20, free: true, url: "https://grow.google/certificates/" },
  { id: "c2", title: "Python Programming Essentials", provider: "Huawei ICT Academy", duration: "4 weeks", level: "Beginner", skill: "Python", ecs: 20, free: true, url: "https://e.huawei.com/en/talent/" },
  { id: "c3", title: "Business Registration & CIPC", provider: "SEDA e-Learning", duration: "2 hours", level: "Beginner", skill: "Business Formalization", ecs: 15, free: true, url: "https://www.seda.org.za" },
  { id: "c4", title: "Social Media Marketing for SMEs", provider: "Meta Blueprint", duration: "3 weeks", level: "Beginner", skill: "Social Media Marketing", ecs: 15, free: true, url: "https://www.facebook.com/business/learn" },
  { id: "c5", title: "Financial Management for Entrepreneurs", provider: "NYDA Business Hub", duration: "5 weeks", level: "Intermediate", skill: "Financial Planning", ecs: 20, free: true, url: "https://www.nyda.gov.za" },
  { id: "c6", title: "Figma for UI Designers", provider: "Figma Academy", duration: "3 weeks", level: "Intermediate", skill: "Figma", ecs: 20, free: true, url: "https://www.figma.com/resources/learn-design/" },
  { id: "c7", title: "Flutter Mobile Development", provider: "Huawei Developer Academy", duration: "8 weeks", level: "Intermediate", skill: "Flutter", ecs: 25, free: false, url: "https://developer.huawei.com/consumer/en/training/" },
  { id: "c8", title: "Pitch Deck Masterclass", provider: "Founders Institute SA", duration: "4 hours", level: "Intermediate", skill: "Pitching", ecs: 15, free: false, url: "#" },
];

export function CoursesPage() {
  const [filter, setFilter] = useState("all");
  const [enrolled, setEnrolled] = useState([]);

  const filtered = filter === "free" ? COURSES.filter(c => c.free) : filter === "enrolled" ? COURSES.filter(c => enrolled.includes(c.id)) : COURSES;

  return (
    <div style={styles.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap'); * { box-sizing:border-box; } .course-card:hover { border-color:rgba(255,107,53,0.3) !important; transform:translateY(-2px); } @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>
      <div style={styles.inner}>
        <div style={{ animation: "fadeUp 0.4s ease forwards" }}>
          <h1 style={styles.title}>Courses & Learning</h1>
          <p style={{ fontSize: 14, color: "#888" }}>Complete courses to add verified skills to your TrustID · Each completion awards ECS points</p>
        </div>

        <div style={{ background: "rgba(255,107,53,0.05)", border: "1px solid rgba(255,107,53,0.15)", borderRadius: 10, padding: "12px 16px", display: "flex", gap: 10 }}>
          <span>⭐</span>
          <span style={{ fontSize: 13, color: "#AAA" }}>
            Completing a course on ARISE adds a <strong style={{ color: "#FF6B35" }}>verified skill badge</strong> to your TrustID profile and awards ECS points toward your score.
          </span>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {["all", "free", "enrolled"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ background: filter === f ? "rgba(255,107,53,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${filter === f ? "rgba(255,107,53,0.35)" : "rgba(255,255,255,0.08)"}`, color: filter === f ? "#FF6B35" : "#888", borderRadius: 20, padding: "7px 16px", fontSize: 13, fontWeight: filter === f ? 700 : 500, cursor: "pointer", fontFamily: "Sora, sans-serif", transition: "all 0.2s" }}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {filtered.map((course, i) => (
            <div key={course.id} className="course-card" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 20, transition: "all 0.2s", animation: `fadeUp 0.4s ${i * 0.05}s ease both` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 10, background: course.free ? "rgba(78,205,196,0.1)" : "rgba(255,215,61,0.1)", border: `1px solid ${course.free ? "rgba(78,205,196,0.2)" : "rgba(255,215,61,0.2)"}`, borderRadius: 12, padding: "2px 8px", color: course.free ? "#4ECDC4" : "#FFD93D", fontWeight: 700, fontFamily: "DM Mono, monospace" }}>
                  {course.free ? "FREE" : "PAID"}
                </span>
                <span style={{ fontSize: 11, color: "#FF6B35", fontFamily: "DM Mono, monospace", fontWeight: 700 }}>+{course.ecs} ECS</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{course.title}</div>
              <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>{course.provider}</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 11, color: "#666" }}>⏱ {course.duration}</span>
                <span style={{ fontSize: 11, color: "#666" }}>· {course.level}</span>
              </div>
              <div style={{ fontSize: 12, color: "#4ECDC4", marginBottom: 14 }}>Skill unlocked: {course.skill}</div>
              <div style={{ display: "flex", gap: 8 }}>
                {enrolled.includes(course.id) ? (
                  <div style={{ flex: 1, background: "rgba(78,205,196,0.1)", border: "1px solid rgba(78,205,196,0.2)", borderRadius: 8, padding: "9px", textAlign: "center", fontSize: 12, color: "#4ECDC4", fontWeight: 700 }}>✓ Enrolled</div>
                ) : (
                  <button onClick={() => setEnrolled(e => [...e, course.id])} style={{ flex: 1, background: "rgba(255,107,53,0.1)", border: "1px solid rgba(255,107,53,0.2)", color: "#FF6B35", borderRadius: 8, padding: "9px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "Sora, sans-serif" }}>
                    Enroll Now
                  </button>
                )}
                <a href={course.url} target="_blank" rel="noreferrer" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#888", borderRadius: 8, padding: "9px 12px", fontSize: 12, textDecoration: "none" }}>↗</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


// ─── VERIFICATION TRACKER ─────────────────────────────────────────────────────
export function VerificationTracker() {
  const STEPS = [
    { id: "email", label: "Email Verification", desc: "Verify your email address", ecs: 25, icon: "✉️", action: "/settings", actionLabel: "Resend email" },
    { id: "identity", label: "Identity Document", desc: "Upload SA ID, passport, or drivers licence", ecs: 50, icon: "🪪", action: "/onboarding/identity", actionLabel: "Upload ID" },
    { id: "qualification", label: "Qualification", desc: "Upload academic certificate for verification", ecs: 25, icon: "🎓", action: "/profile", actionLabel: "Add qualification" },
    { id: "skill", label: "Skills Assessment", desc: "Pass a skills assessment to verify a claimed skill", ecs: 15, icon: "⚡", action: "/skills", actionLabel: "Assess a skill" },
    { id: "work", label: "Work Experience", desc: "Get a work experience entry confirmed by employer", ecs: 20, icon: "💼", action: "/profile", actionLabel: "Add experience" },
    { id: "business", label: "Business Registration", desc: "Complete LaunchPad to register your business", ecs: 100, icon: "🚀", action: "/launchpad", actionLabel: "Start LaunchPad" },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.inner}>
        <h1 style={styles.title}>Verification Centre</h1>
        <p style={{ fontSize: 14, color: "#888" }}>Each verified item strengthens your TrustID and awards ECS points</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {STEPS.map((step, i) => (
            <div key={step.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "18px 20px", display: "flex", gap: 16, alignItems: "center" }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{step.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{step.label}</div>
                <div style={{ fontSize: 13, color: "#888" }}>{step.desc}</div>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#FF6B35", fontFamily: "DM Mono, monospace" }}>+{step.ecs} ECS</span>
                <Link to={step.action} style={{ background: "rgba(255,107,53,0.1)", border: "1px solid rgba(255,107,53,0.25)", color: "#FF6B35", borderRadius: 7, padding: "7px 14px", textDecoration: "none", fontSize: 12, fontWeight: 700, fontFamily: "Sora, sans-serif" }}>
                  {step.actionLabel} →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { fontFamily: "'Sora', sans-serif", background: "#0A0A0F", color: "#E8E8F0", minHeight: "100vh", padding: "32px 24px" },
  inner: { maxWidth: 1000, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 },
  title: { fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 800, marginBottom: 4 },
};

export default CoursesPage;