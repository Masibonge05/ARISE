import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../services/api";

export default function EmployerProfile() {
  const { id } = useParams();
  const [employer, setEmployer] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data — real endpoint pulls from employer_profiles table
    setEmployer(MOCK_EMPLOYER);
    setJobs(MOCK_JOBS);
    setLoading(false);
  }, [id]);

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "Sora, sans-serif", color: "#FF6B35", background: "#0A0A0F" }}>🏢 Loading employer...</div>;
  if (!employer) return null;

  const verifiedColor = employer.verification_status === "verified" ? "#4ECDC4" : "#FFD93D";
  const stars = Math.round(employer.trust_score || 0);

  return (
    <div style={styles.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap'); * { box-sizing:border-box; } @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>
      <div style={styles.inner}>
        <Link to="/jobs" style={{ fontSize: 13, color: "#666", textDecoration: "none", display: "block", marginBottom: 24 }}>← Back to Jobs</Link>

        {/* Employer header */}
        <div style={{ ...styles.card, animation: "fadeUp 0.4s ease forwards" }}>
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ width: 64, height: 64, borderRadius: 14, background: "rgba(255,107,53,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, flexShrink: 0 }}>
              {employer.logo_url ? <img src={employer.logo_url} alt="" style={{ width: "100%", borderRadius: 14 }} /> : "🏢"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800 }}>{employer.company_name}</h1>
                <span style={{ fontSize: 10, background: `${verifiedColor}15`, border: `1px solid ${verifiedColor}30`, borderRadius: 12, padding: "3px 10px", color: verifiedColor, fontWeight: 700 }}>
                  {employer.verification_status === "verified" ? "✓ CIPC VERIFIED" : "⚠ UNVERIFIED"}
                </span>
              </div>
              <div style={{ fontSize: 14, color: "#888", marginBottom: 8 }}>
                {employer.industry} · {employer.company_size} employees · {employer.city}, {employer.province}
              </div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#FFD93D" }}>{"★".repeat(stars)}{"☆".repeat(5 - stars)} {employer.trust_score?.toFixed(1)}</div>
                  <div style={{ fontSize: 11, color: "#555", fontFamily: "DM Mono, monospace" }}>TRUST SCORE</div>
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>{employer.total_hires}</div>
                  <div style={{ fontSize: 11, color: "#555", fontFamily: "DM Mono, monospace" }}>TOTAL HIRES</div>
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#4ECDC4" }}>{employer.total_jobs_posted}</div>
                  <div style={{ fontSize: 11, color: "#555", fontFamily: "DM Mono, monospace" }}>JOBS POSTED</div>
                </div>
              </div>
            </div>
            {employer.website && (
              <a href={employer.website} target="_blank" rel="noreferrer" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#888", borderRadius: 8, padding: "10px 16px", textDecoration: "none", fontSize: 13, fontFamily: "Sora, sans-serif" }}>
                Visit Website ↗
              </a>
            )}
          </div>
          {employer.description && (
            <p style={{ fontSize: 14, color: "#BBB", lineHeight: 1.7, marginTop: 20, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              {employer.description}
            </p>
          )}
        </div>

        {/* Safety notice for unverified */}
        {employer.verification_status !== "verified" && (
          <div style={{ background: "rgba(255,200,0,0.06)", border: "1px solid rgba(255,200,0,0.2)", borderRadius: 10, padding: "14px 18px", display: "flex", gap: 10 }}>
            <span>⚠️</span>
            <div style={{ fontSize: 13, color: "#AAA" }}>
              <strong style={{ color: "#FFD93D" }}>Unverified employer.</strong> This company has not completed CIPC verification on ARISE. Proceed with caution. Never pay any upfront fees.
              <Link to="/safety" style={{ color: "#FF6B35", textDecoration: "none", marginLeft: 6 }}>Safety tips →</Link>
            </div>
          </div>
        )}

        {/* Active jobs */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>ACTIVE JOB OPENINGS ({jobs.length})</div>
          {jobs.length === 0 ? (
            <div style={{ fontSize: 13, color: "#555", textAlign: "center", padding: 24 }}>No active openings at the moment.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {jobs.map((job) => (
                <Link key={job.id} to={`/jobs/${job.id}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", textDecoration: "none" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#E8E8F0", marginBottom: 4 }}>{job.title}</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <span style={{ fontSize: 11, color: "#888" }}>{job.job_type?.replace("_", " ")}</span>
                      <span style={{ fontSize: 11, color: "#888" }}>·</span>
                      <span style={{ fontSize: 11, color: "#888" }}>{job.work_style?.replace("_", " ")}</span>
                      {job.salary_min && <><span style={{ fontSize: 11, color: "#888" }}>·</span><span style={{ fontSize: 11, color: "#FFD93D" }}>R{job.salary_min?.toLocaleString()}+</span></>}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    {job.match_score && <span style={{ fontSize: 12, color: "#4ECDC4", fontWeight: 700 }}>{job.match_score}% match</span>}
                    <span style={{ fontSize: 18, color: "#555" }}>→</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const MOCK_EMPLOYER = { id: "e1", company_name: "Tech4Africa", industry: "Technology", company_size: "11-50", province: "Gauteng", city: "Johannesburg", verification_status: "verified", trust_score: 4.5, total_hires: 8, total_jobs_posted: 12, website: "https://tech4africa.co.za", description: "Tech4Africa is a Johannesburg-based technology company building digital solutions for African businesses. We believe in developing local talent and giving young South Africans their first break in tech.", avg_response_time_hours: 24 };

const MOCK_JOBS = [
  { id: "1", title: "Junior UI/UX Designer", job_type: "full_time", work_style: "hybrid", salary_min: 18000, salary_max: 25000, match_score: 94 },
  { id: "5", title: "Frontend Developer (React)", job_type: "contract", work_style: "remote", salary_min: 25000, salary_max: 40000, match_score: 78 },
];

const styles = {
  page: { fontFamily: "'Sora', sans-serif", background: "#0A0A0F", color: "#E8E8F0", minHeight: "100vh", padding: "32px 24px" },
  inner: { maxWidth: 860, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 },
  card: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 24 },
  cardTitle: { fontSize: 11, color: "#555", fontFamily: "DM Mono, monospace", fontWeight: 700, letterSpacing: 2, marginBottom: 16 },
};