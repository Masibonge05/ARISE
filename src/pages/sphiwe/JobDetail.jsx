import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../services/api";

export default function JobDetail() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverNote, setCoverNote] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/jobs/${jobId}`);
        setJob(res.data);
        setApplied(res.data.already_applied);
      } catch { setJob(MOCK_JOB); }
      finally { setLoading(false); }
    };
    fetch();
  }, [jobId]);

  const handleApply = async () => {
    setApplying(true);
    try {
      await api.post(`/jobs/${jobId}/apply`, { cover_note: coverNote });
      setApplied(true);
      setShowApplyModal(false);
    } catch (e) {
      if (e.response?.status === 409) setApplied(true);
    } finally { setApplying(false); }
  };

  if (loading) return <div style={styles.loading}>💼 Loading job...</div>;
  if (!job) return <div style={styles.loading}>Job not found.</div>;

  const matchColor = job.match_score >= 80 ? "#4ECDC4" : job.match_score >= 60 ? "#FFD93D" : "#FF6B35";
  const isVerified = job.employer?.verification_status === "verified";

  return (
    <div style={styles.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap'); * { box-sizing:border-box; } @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>
      <div style={styles.inner}>
        <Link to="/jobs" style={{ fontSize: 13, color: "#666", textDecoration: "none", display: "flex", alignItems: "center", gap: 6, marginBottom: 24 }}>← Back to Jobs</Link>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, animation: "fadeUp 0.4s ease forwards" }}>
          {/* Main content */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Job header */}
            <div style={styles.card}>
              <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                <div style={{ width: 56, height: 56, borderRadius: 10, background: "rgba(255,107,53,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
                  {job.employer?.logo_url ? <img src={job.employer.logo_url} alt="" style={{ width: "100%", borderRadius: 10 }} /> : "🏢"}
                </div>
                <div>
                  <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{job.title}</h1>
                  <div style={{ fontSize: 14, color: "#888" }}>{job.employer?.company_name} · {job.city} {job.province}</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                    <span style={styles.tag}>{job.job_type?.replace("_", " ")}</span>
                    <span style={styles.tag}>{job.work_style?.replace("_", " ")}</span>
                    {job.show_salary && job.salary_min && <span style={styles.tag}>R{job.salary_min?.toLocaleString()} – R{job.salary_max?.toLocaleString()}/mo</span>}
                    {isVerified ? <span style={styles.verifiedTag}>✓ Verified Employer</span> : <span style={styles.unverifiedTag}>⚠ Unverified</span>}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ textAlign: "center", flex: 1 }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: matchColor }}>{job.match_score}%</div>
                  <div style={{ fontSize: 11, color: "#666", fontFamily: "DM Mono, monospace" }}>YOUR MATCH</div>
                </div>
                <div style={{ textAlign: "center", flex: 1 }}>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>{job.application_count || 0}</div>
                  <div style={{ fontSize: 11, color: "#666", fontFamily: "DM Mono, monospace" }}>APPLICANTS</div>
                </div>
                <div style={{ textAlign: "center", flex: 1 }}>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>{job.required_experience_years || 0}+</div>
                  <div style={{ fontSize: 11, color: "#666", fontFamily: "DM Mono, monospace" }}>YEARS EXP.</div>
                </div>
              </div>
            </div>

            {/* Match breakdown */}
            {job.match_breakdown && (
              <div style={styles.card}>
                <div style={styles.cardTitle}>WHY THIS IS A {job.match_score}% MATCH FOR YOU</div>
                {Object.entries(job.match_breakdown).map(([key, val]) => (
                  <div key={key} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 13, color: "#AAA", textTransform: "capitalize" }}>{key.replace("_", " ")}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: val.score > 15 ? "#4ECDC4" : "#888" }}>{val.score}/{val.max}</span>
                    </div>
                    <div style={{ height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 2 }}>
                      <div style={{ height: "100%", width: `${(val.score / val.max) * 100}%`, background: val.score > 15 ? "#4ECDC4" : "#666", borderRadius: 2, transition: "width 1s ease" }} />
                    </div>
                    {val.matched?.length > 0 && <div style={{ fontSize: 11, color: "#4ECDC4", marginTop: 4 }}>✓ Matched: {val.matched.join(", ")}</div>}
                  </div>
                ))}
              </div>
            )}

            {/* Description */}
            <div style={styles.card}>
              <div style={styles.cardTitle}>JOB DESCRIPTION</div>
              <p style={{ fontSize: 14, color: "#BBB", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{job.description}</p>
            </div>

            {job.requirements && (
              <div style={styles.card}>
                <div style={styles.cardTitle}>REQUIREMENTS</div>
                <p style={{ fontSize: 14, color: "#BBB", lineHeight: 1.8 }}>{job.requirements}</p>
              </div>
            )}

            {/* Required skills */}
            {job.required_skills?.length > 0 && (
              <div style={styles.card}>
                <div style={styles.cardTitle}>REQUIRED SKILLS</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {job.required_skills.map((s) => (
                    <span key={s} style={{ background: "rgba(255,107,53,0.08)", border: "1px solid rgba(255,107,53,0.15)", borderRadius: 12, padding: "5px 12px", fontSize: 13, color: "#FF6B35" }}>{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Apply card */}
            <div style={{ ...styles.card, border: applied ? "1px solid rgba(78,205,196,0.3)" : "1px solid rgba(255,107,53,0.3)", background: applied ? "rgba(78,205,196,0.04)" : "rgba(255,107,53,0.04)" }}>
              {applied ? (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                  <div style={{ fontWeight: 800, color: "#4ECDC4", marginBottom: 4 }}>Application Submitted</div>
                  <div style={{ fontSize: 12, color: "#888" }}>Status: {job.application_status?.replace("_", " ") || "Submitted"}</div>
                  <Link to="/applications" style={{ display: "block", marginTop: 12, fontSize: 12, color: "#4ECDC4", textDecoration: "none" }}>View my applications →</Link>
                </div>
              ) : (
                <div>
                  <div style={styles.cardTitle}>APPLY WITH TRUSTID</div>
                  <p style={{ fontSize: 13, color: "#888", marginBottom: 16, lineHeight: 1.6 }}>No CV needed. Your verified TrustID profile is your application. One tap.</p>
                  <button onClick={() => setShowApplyModal(true)} style={styles.applyBtn}>Apply Now →</button>
                  {!isVerified && <div style={{ fontSize: 11, color: "#FFD93D", marginTop: 10, textAlign: "center" }}>⚠ This employer is not yet verified. Proceed with caution.</div>}
                </div>
              )}
            </div>

            {/* Employer card */}
            <div style={styles.card}>
              <div style={styles.cardTitle}>ABOUT THE EMPLOYER</div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{job.employer?.company_name}</div>
              <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>{job.employer?.industry} · {job.employer?.company_size}</div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#666" }}>
                <span>Trust score</span>
                <span style={{ color: "#4ECDC4", fontWeight: 700 }}>{job.employer?.trust_score?.toFixed(1) || "—"}/5</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#666", marginTop: 6 }}>
                <span>Total hires</span>
                <span style={{ fontWeight: 700 }}>{job.employer?.total_hires || 0}</span>
              </div>
            </div>

            {/* Safety */}
            <div style={{ background: "rgba(78,205,196,0.04)", border: "1px solid rgba(78,205,196,0.15)", borderRadius: 10, padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#4ECDC4", marginBottom: 6 }}>🛡️ ARISE Safety</div>
              <div style={{ fontSize: 12, color: "#666", lineHeight: 1.6 }}>
                {job.safety_scan_passed ? "✓ Passed safety scan" : "Safety scan pending"}<br />
                All communication is via ARISE until you agree to share contacts.
              </div>
              <button onClick={() => api.post(`/jobs/${jobId}/flag`, { reason: "scam" }).then(() => alert("Reported. Thank you."))} style={{ background: "none", border: "none", color: "#FF6B35", fontSize: 12, cursor: "pointer", marginTop: 8, fontFamily: "Sora, sans-serif" }}>🚩 Report this job</button>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div style={styles.overlay} onClick={() => setShowApplyModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontWeight: 800, marginBottom: 4 }}>Apply with TrustID</h3>
            <p style={{ fontSize: 13, color: "#888", marginBottom: 16 }}>for <strong style={{ color: "#E8E8F0" }}>{job.title}</strong> at {job.employer?.company_name}</p>
            <div style={{ background: "rgba(78,205,196,0.06)", border: "1px solid rgba(78,205,196,0.2)", borderRadius: 8, padding: 14, marginBottom: 16, fontSize: 13, color: "#4ECDC4" }}>
              ✓ Your TrustID profile will be shared as your application. No CV required.
            </div>
            <label style={{ display: "block", fontSize: 13, color: "#AAA", marginBottom: 8 }}>Personal note (optional)</label>
            <textarea value={coverNote} onChange={(e) => setCoverNote(e.target.value)} placeholder="Add a short personal message to the employer..." style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: 12, color: "#E8E8F0", fontFamily: "Sora, sans-serif", fontSize: 14, resize: "vertical", outline: "none", marginBottom: 16 }} rows={3} />
            <button onClick={handleApply} disabled={applying} style={{ width: "100%", background: "#FF6B35", color: "#fff", border: "none", padding: 14, borderRadius: 8, fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "Sora, sans-serif" }}>
              {applying ? "Submitting..." : "Submit Application →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const MOCK_JOB = { id: "1", title: "Junior UI/UX Designer", description: "We are looking for a passionate junior UI/UX designer to join our growing team.\n\nYou will work closely with our product team to design intuitive, user-centred interfaces for our web and mobile applications.", requirements: "• Portfolio showing UI/UX projects\n• Proficiency in Figma\n• Understanding of user research principles\n• Ability to present and explain design decisions", required_skills: ["Figma", "Adobe XD", "User Research", "Wireframing"], job_type: "full_time", work_style: "hybrid", salary_min: 18000, salary_max: 25000, show_salary: true, salary_is_negotiable: false, required_experience_years: 1, application_count: 12, match_score: 94, match_breakdown: { skills: { score: 35, max: 40, matched: ["Figma"] }, location: { score: 20, max: 20 }, experience: { score: 20, max: 20 }, preferences: { score: 15, max: 20 } }, safety_scan_passed: true, already_applied: false, employer: { company_name: "Tech4Africa", industry: "Technology", company_size: "11-50", verification_status: "verified", trust_score: 4.5, total_hires: 8 }, province: "Gauteng", city: "Johannesburg" };

const styles = {
  page: { fontFamily: "'Sora', sans-serif", background: "#0A0A0F", color: "#E8E8F0", minHeight: "100vh", padding: "32px 24px" },
  inner: { maxWidth: 1000, margin: "0 auto" },
  loading: { display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "Sora, sans-serif", color: "#FF6B35", background: "#0A0A0F" },
  card: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 24 },
  cardTitle: { fontSize: 11, color: "#555", fontFamily: "DM Mono, monospace", fontWeight: 700, letterSpacing: 2, marginBottom: 16 },
  tag: { display: "inline-block", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "3px 10px", fontSize: 11, color: "#AAA" },
  verifiedTag: { display: "inline-block", background: "rgba(78,205,196,0.1)", border: "1px solid rgba(78,205,196,0.25)", borderRadius: 12, padding: "3px 10px", fontSize: 11, color: "#4ECDC4", fontWeight: 700 },
  unverifiedTag: { display: "inline-block", background: "rgba(255,200,0,0.08)", border: "1px solid rgba(255,200,0,0.2)", borderRadius: 12, padding: "3px 10px", fontSize: 11, color: "#FFD93D", fontWeight: 700 },
  applyBtn: { width: "100%", background: "#FF6B35", color: "#fff", border: "none", padding: "14px", borderRadius: 8, fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "Sora, sans-serif", transition: "all 0.2s" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 },
  modal: { background: "#141420", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 32, maxWidth: 420, width: "90%" },
};