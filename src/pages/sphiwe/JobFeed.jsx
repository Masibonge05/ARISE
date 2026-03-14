import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

const JOB_TYPES = ["full_time","part_time","contract","internship","learnership"];
const WORK_STYLES = ["remote","hybrid","on_site"];
const PROVINCES = ["Gauteng","Western Cape","KwaZulu-Natal","Eastern Cape","Limpopo","Mpumalanga","North West","Free State","Northern Cape"];

function MatchBadge({ score }) {
  const color = score >= 80 ? "#4ECDC4" : score >= 60 ? "#FFD93D" : "#FF6B35";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, background: `${color}15`, border: `1px solid ${color}30`, borderRadius: 20, padding: "3px 10px" }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
      <span style={{ fontSize: 11, fontWeight: 700, color, fontFamily: "DM Mono, monospace" }}>{score}% match</span>
    </div>
  );
}

function VerificationBadge({ status }) {
  if (status === "verified") return (
    <span style={{ fontSize: 10, background: "rgba(78,205,196,0.1)", border: "1px solid rgba(78,205,196,0.25)", borderRadius: 10, padding: "2px 7px", color: "#4ECDC4", fontWeight: 700 }}>✓ VERIFIED EMPLOYER</span>
  );
  return (
    <span style={{ fontSize: 10, background: "rgba(255,200,0,0.08)", border: "1px solid rgba(255,200,0,0.2)", borderRadius: 10, padding: "2px 7px", color: "#FFD93D", fontWeight: 700 }}>⚠ UNVERIFIED</span>
  );
}

function JobCard({ job, onFlag }) {
  const navigate = useNavigate();
  const daysAgo = Math.floor((Date.now() - new Date(job.created_at)) / 86400000);

  return (
    <div style={styles.jobCard} onClick={() => navigate(`/jobs/${job.id}`)}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ display: "flex", gap: 14, flex: 1 }}>
          {/* Company logo */}
          <div style={styles.companyLogo}>
            {job.employer?.logo_url
              ? <img src={job.employer.logo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }} />
              : <span style={{ fontSize: 18 }}>{job.employer?.company_name?.[0] || "?"}</span>
            }
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 3 }}>{job.title}</div>
            <div style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>
              {job.employer?.company_name} · {job.city || ""} {job.province || ""}
              {job.work_style === "remote" && " · 🌐 Remote"}
              {job.work_style === "hybrid" && " · 🏠 Hybrid"}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
              <VerificationBadge status={job.employer?.verification_status} />
              <span style={styles.tag}>{job.job_type?.replace("_", " ")}</span>
              {job.show_salary && job.salary_min && (
                <span style={styles.tag}>R{job.salary_min?.toLocaleString()} – R{job.salary_max?.toLocaleString()}/mo</span>
              )}
              {job.salary_is_negotiable && <span style={styles.tag}>Negotiable</span>}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
          <MatchBadge score={job.match_score} />
          <div style={{ fontSize: 11, color: "#555", fontFamily: "DM Mono, monospace" }}>
            {daysAgo === 0 ? "Today" : `${daysAgo}d ago`}
          </div>
        </div>
      </div>

      {/* Required skills */}
      {job.required_skills?.length > 0 && (
        <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 5 }}>
          {job.required_skills.slice(0, 5).map((skill) => (
            <span key={skill} style={styles.skillChip}>{skill}</span>
          ))}
          {job.required_skills.length > 5 && <span style={styles.skillChip}>+{job.required_skills.length - 5}</span>}
        </div>
      )}

      {/* Match explanation */}
      {job.match_breakdown?.skills?.matched?.length > 0 && (
        <div style={{ marginTop: 10, fontSize: 12, color: "#4ECDC4" }}>
          ✓ Matched: {job.match_breakdown.skills.matched.join(", ")}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <span style={{ fontSize: 12, color: "#555" }}>{job.application_count || 0} applicants</span>
        <div style={{ display: "flex", gap: 8 }} onClick={(e) => e.stopPropagation()}>
          <button onClick={() => onFlag(job.id)} style={styles.flagBtn} title="Report suspicious job">🚩</button>
          <Link to={`/jobs/${job.id}`} style={styles.viewBtn}>View & Apply →</Link>
        </div>
      </div>
    </div>
  );
}

export default function JobFeed() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ sector: "", province: "", job_type: "", work_style: "", verified_only: false });
  const [showFilters, setShowFilters] = useState(false);
  const [flagModal, setFlagModal] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      Object.entries(filters).forEach(([k, v]) => v && params.append(k, v));
      const res = await api.get(`/jobs/?${params}`);
      setJobs(res.data.jobs || []);
      setTotal(res.data.total || 0);
    } catch (e) {
      // Show mock data if API not ready
      setJobs(MOCK_JOBS);
      setTotal(MOCK_JOBS.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, [filters, page]);

  const handleFlag = async (jobId) => {
    setFlagModal(jobId);
  };

  const submitFlag = async (reason) => {
    try {
      await api.post(`/jobs/${flagModal}/flag`, { reason });
      alert("Thank you. This report has been recorded.");
    } catch (e) { console.error(e); }
    setFlagModal(null);
  };

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        .job-card-hover:hover { border-color: rgba(255,107,53,0.3) !important; background: rgba(255,107,53,0.02) !important; transform: translateY(-1px); }
        .arise-select { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 9px 14px; color: #E8E8F0; font-family: 'Sora', sans-serif; font-size: 13px; outline: none; cursor: pointer; }
        .arise-select:focus { border-color: #FF6B35; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <div style={styles.inner}>
        {/* ── Header ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={styles.title}>Job Opportunities</h1>
            <p style={{ fontSize: 14, color: "#888" }}>
              {total} jobs ranked by your TrustID match score · <span style={{ color: "#4ECDC4" }}>Verified employers only shown by default</span>
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setShowFilters(!showFilters)} style={styles.filterBtn}>
              ⚙ Filters {showFilters ? "▲" : "▼"}
            </button>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: filters.verified_only ? "#4ECDC4" : "#888" }}>
              <input type="checkbox" checked={filters.verified_only} onChange={(e) => setFilters({ ...filters, verified_only: e.target.checked })} style={{ accentColor: "#4ECDC4" }} />
              Verified employers only
            </label>
          </div>
        </div>

        {/* ── Filters ── */}
        {showFilters && (
          <div style={styles.filtersBar}>
            {[
              { key: "province", label: "Province", options: PROVINCES },
              { key: "job_type", label: "Job Type", options: JOB_TYPES },
              { key: "work_style", label: "Work Style", options: WORK_STYLES },
            ].map(({ key, label, options }) => (
              <select key={key} className="arise-select" value={filters[key]} onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}>
                <option value="">All {label}s</option>
                {options.map((o) => <option key={o} value={o}>{o.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}</option>)}
              </select>
            ))}
            <button onClick={() => setFilters({ sector: "", province: "", job_type: "", work_style: "", verified_only: false })} style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", color: "#888", borderRadius: 8, padding: "9px 14px", cursor: "pointer", fontSize: 13, fontFamily: "Sora, sans-serif" }}>
              Clear filters
            </button>
          </div>
        )}

        {/* ── Safety Banner ── */}
        <div style={styles.safetyBanner}>
          <span style={{ fontSize: 16 }}>🛡️</span>
          <span style={{ fontSize: 13, color: "#AAA" }}>
            <strong style={{ color: "#E8E8F0" }}>ARISE Safety:</strong> All job postings are scanned for trafficking and scam red flags before going live.
            Never pay upfront fees for a job. <Link to="/safety" style={{ color: "#FF6B35", textDecoration: "none" }}>Learn more →</Link>
          </span>
        </div>

        {/* ── Job List ── */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#666" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>💼</div>
            <div style={{ fontFamily: "DM Mono, monospace", fontSize: 13 }}>Finding your matches...</div>
          </div>
        ) : jobs.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "#666" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>No jobs found</div>
            <div style={{ fontSize: 13 }}>Try adjusting your filters or <Link to="/skills" style={{ color: "#FF6B35" }}>add more skills</Link> to improve your matches.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {jobs.map((job, i) => (
              <div key={job.id} style={{ animation: `fadeUp 0.4s ${i * 0.05}s ease both` }}>
                <JobCard job={job} onFlag={handleFlag} />
              </div>
            ))}
          </div>
        )}

        {/* ── Pagination ── */}
        {total > 20 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 8 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={styles.pageBtn}>← Prev</button>
            <span style={{ display: "flex", alignItems: "center", fontSize: 13, color: "#888", padding: "0 12px" }}>Page {page}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={jobs.length < 20} style={styles.pageBtn}>Next →</button>
          </div>
        )}
      </div>

      {/* ── Flag Modal ── */}
      {flagModal && (
        <div style={styles.modalOverlay} onClick={() => setFlagModal(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontWeight: 800, marginBottom: 8 }}>Report this job posting</h3>
            <p style={{ fontSize: 13, color: "#888", marginBottom: 20 }}>Select the reason for your report. All reports are anonymous.</p>
            {["scam", "trafficking", "fake_company", "harassment", "other"].map((reason) => (
              <button key={reason} onClick={() => submitFlag(reason)} style={styles.flagOption}>
                {reason.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}
              </button>
            ))}
            <button onClick={() => setFlagModal(null)} style={{ ...styles.flagOption, background: "none", color: "#666", marginTop: 8 }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Mock data for when API is not yet seeded
const MOCK_JOBS = [
  { id: "1", title: "Junior UI/UX Designer", employer: { company_name: "Tech4Africa", verification_status: "verified", trust_score: 4.5 }, province: "Gauteng", city: "Johannesburg", job_type: "full_time", work_style: "hybrid", salary_min: 18000, salary_max: 25000, show_salary: true, salary_is_negotiable: false, required_skills: ["Figma", "Adobe XD", "User Research"], match_score: 94, match_breakdown: { skills: { matched: ["Figma"] } }, application_count: 12, created_at: new Date().toISOString() },
  { id: "2", title: "React Developer", employer: { company_name: "StartupSA", verification_status: "verified", trust_score: 4.2 }, province: "Western Cape", city: "Cape Town", job_type: "contract", work_style: "remote", salary_min: 30000, salary_max: 45000, show_salary: true, salary_is_negotiable: true, required_skills: ["React", "JavaScript", "Node.js"], match_score: 82, match_breakdown: { skills: { matched: ["React", "JavaScript"] } }, application_count: 28, created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: "3", title: "Marketing Coordinator", employer: { company_name: "Mzansi Media", verification_status: "unverified" }, province: "Gauteng", city: "Pretoria", job_type: "full_time", work_style: "on_site", salary_min: 15000, salary_max: 20000, show_salary: true, salary_is_negotiable: false, required_skills: ["Social Media", "Copywriting", "Analytics"], match_score: 67, match_breakdown: { skills: { matched: [] } }, application_count: 45, created_at: new Date(Date.now() - 172800000).toISOString() },
];

const styles = {
  page: { fontFamily: "'Sora', sans-serif", background: "#0A0A0F", color: "#E8E8F0", minHeight: "100vh", padding: "32px 24px" },
  inner: { maxWidth: 860, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 },
  title: { fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 800, marginBottom: 4 },
  filtersBar: { display: "flex", gap: 10, flexWrap: "wrap", padding: 16, background: "rgba(255,255,255,0.02)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)" },
  safetyBanner: { display: "flex", alignItems: "center", gap: 12, background: "rgba(78,205,196,0.05)", border: "1px solid rgba(78,205,196,0.15)", borderRadius: 10, padding: "12px 16px" },
  jobCard: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 20, cursor: "pointer", transition: "all 0.2s" },
  companyLogo: { width: 44, height: 44, borderRadius: 8, background: "rgba(255,107,53,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 },
  tag: { display: "inline-block", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "2px 8px", fontSize: 11, color: "#AAA" },
  skillChip: { display: "inline-block", background: "rgba(255,107,53,0.08)", border: "1px solid rgba(255,107,53,0.15)", borderRadius: 12, padding: "3px 10px", fontSize: 11, color: "#FF6B35" },
  filterBtn: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#E8E8F0", borderRadius: 8, padding: "9px 16px", cursor: "pointer", fontSize: 13, fontFamily: "Sora, sans-serif", fontWeight: 600 },
  flagBtn: { background: "none", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "5px 10px", cursor: "pointer", fontSize: 13 },
  viewBtn: { background: "#FF6B35", color: "#fff", borderRadius: 6, padding: "7px 14px", textDecoration: "none", fontSize: 12, fontWeight: 700, fontFamily: "Sora, sans-serif" },
  pageBtn: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#E8E8F0", borderRadius: 8, padding: "9px 20px", cursor: "pointer", fontSize: 13, fontFamily: "Sora, sans-serif" },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 },
  modal: { background: "#141414", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 32, maxWidth: 380, width: "90%", display: "flex", flexDirection: "column", gap: 4 },
  flagOption: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#E8E8F0", borderRadius: 8, padding: "12px 16px", cursor: "pointer", fontSize: 13, fontFamily: "Sora, sans-serif", textAlign: "left", transition: "all 0.15s" },
};