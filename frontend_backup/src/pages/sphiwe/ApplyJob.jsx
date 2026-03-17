import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { TrustBadge, ErrorBanner, Spinner } from "../../components/ui";
import api from "../../services/api";

export default function ApplyJob() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [coverNote, setCoverNote] = useState("");
  const [selectedPortfolio, setSelectedPortfolio] = useState([]);
  const [portfolio, setPortfolio] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobRes, userRes] = await Promise.all([
          api.get(`/jobs/${jobId}`),
          api.get("/users/me"),
        ]);
        if (jobRes.data.already_applied) { navigate(`/jobs/${jobId}`); return; }
        setJob(jobRes.data);
        setPortfolio(userRes.data.portfolio_items || []);
      } catch { setJob(MOCK_JOB); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [jobId]);

  const handleSubmit = async () => {
    setSubmitting(true); setError(null);
    try {
      await api.post(`/jobs/${jobId}/apply`, {
        cover_note: coverNote,
        portfolio_item_ids: selectedPortfolio,
      });
      setSubmitted(true);
    } catch (e) {
      if (e.response?.status === 409) setSubmitted(true);
      else setError(e.response?.data?.detail || "Submission failed. Please try again.");
    } finally { setSubmitting(false); }
  };

  const togglePortfolio = (id) =>
    setSelectedPortfolio((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);

  if (loading) return (
    <div style={S.loading}><Spinner size={32} /><span style={{ color: "#FF6B35", fontFamily: "DM Mono,monospace" }}>Loading application...</span></div>
  );

  if (submitted) return (
    <div style={S.page}>
      <div style={S.successCard}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Application Submitted!</h2>
        <p style={{ fontSize: 14, color: "#888", marginBottom: 24, lineHeight: 1.7 }}>
          Your TrustID profile has been sent to <strong style={{ color: "#E8E8F0" }}>{job?.employer?.company_name}</strong>. You'll be notified of any updates.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <button onClick={() => navigate("/applications")} style={S.primaryBtn}>Track Application →</button>
          <button onClick={() => navigate("/jobs")} style={S.ghostBtn}>Browse More Jobs</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={S.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap'); * { box-sizing:border-box; } @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div style={S.inner}>
        <Link to={`/jobs/${jobId}`} style={{ fontSize: 13, color: "#666", textDecoration: "none", display: "block", marginBottom: 24 }}>← Back to Job</Link>

        {/* Job header */}
        <div style={{ ...S.card, marginBottom: 20, animation: "fadeUp 0.4s ease forwards" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ width: 48, height: 48, borderRadius: 10, background: "rgba(255,107,53,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>🏢</div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{job?.title}</h1>
              <div style={{ fontSize: 13, color: "#888" }}>{job?.employer?.company_name} · {job?.city}, {job?.province}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                <span style={S.tag}>{job?.job_type?.replace("_", " ")}</span>
                <span style={S.tag}>{job?.work_style?.replace("_", " ")}</span>
                {job?.salary_min && <span style={S.tag}>R{job.salary_min?.toLocaleString()}+/mo</span>}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
          {/* Left: Application form */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* TrustID summary */}
            <div style={{ ...S.card, border: "1px solid rgba(78,205,196,0.2)", background: "rgba(78,205,196,0.04)", animation: "fadeUp 0.4s 0.05s ease both" }}>
              <div style={S.cardTitle}>YOUR TRUSTID APPLICATION</div>
              <p style={{ fontSize: 13, color: "#AAA", marginBottom: 14, lineHeight: 1.6 }}>
                Your verified TrustID profile is your CV on ARISE. The employer will see your verified skills, qualifications, and ECS score.
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {user?.is_identity_verified && <TrustBadge type="identity" size="sm" />}
                {user?.is_email_verified && <TrustBadge type="email" size="sm" />}
                {(user?.skills || []).filter((s) => s.verification_source !== "self_claimed").length > 0 && <TrustBadge type="skill" size="sm" />}
                {(user?.qualifications || []).length > 0 && <TrustBadge type="education" size="sm" />}
              </div>
              <div style={{ marginTop: 12, fontSize: 12, color: "#FF6B35", fontFamily: "DM Mono,monospace" }}>
                ECS Score: {user?.ecs_score || 0} · TrustID: {Math.round(user?.trust_completion_score || 0)}% complete
              </div>
            </div>

            {/* Cover note */}
            <div style={{ ...S.card, animation: "fadeUp 0.4s 0.1s ease both" }}>
              <div style={S.cardTitle}>PERSONAL NOTE (OPTIONAL)</div>
              <textarea
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
                placeholder="Add a short personal message to the employer. Tell them why you're excited about this role..."
                rows={4}
                style={S.textarea}
              />
              <div style={{ fontSize: 11, color: "#555", marginTop: 6, fontFamily: "DM Mono,monospace" }}>
                {coverNote.length}/500 characters
              </div>
            </div>

            {/* Portfolio items */}
            {portfolio.length > 0 && (
              <div style={{ ...S.card, animation: "fadeUp 0.4s 0.15s ease both" }}>
                <div style={S.cardTitle}>ATTACH PORTFOLIO ITEMS (OPTIONAL)</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {portfolio.map((item) => (
                    <div key={item.id} onClick={() => togglePortfolio(item.id)}
                      style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 14px",
                        borderRadius: 8, border: `1px solid ${selectedPortfolio.includes(item.id) ? "rgba(78,205,196,0.4)" : "rgba(255,255,255,0.07)"}`,
                        background: selectedPortfolio.includes(item.id) ? "rgba(78,205,196,0.06)" : "rgba(255,255,255,0.02)",
                        cursor: "pointer", transition: "all 0.15s" }}>
                      <div style={{ fontSize: 20 }}>
                        {{ design: "🎨", development: "💻", photography: "📸", writing: "✍️", branding: "⭐" }[item.category] || "📁"}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{item.title}</div>
                        {item.client_name && <div style={{ fontSize: 11, color: "#666" }}>{item.client_name}</div>}
                      </div>
                      {item.is_client_verified && <TrustBadge type="verified" size="sm" />}
                      {selectedPortfolio.includes(item.id) && <span style={{ fontSize: 16, color: "#4ECDC4" }}>✓</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <ErrorBanner message={error} onDismiss={() => setError(null)} />

            <button onClick={handleSubmit} disabled={submitting} style={{ ...S.primaryBtn, padding: "16px", fontSize: 16, opacity: submitting ? 0.6 : 1 }}>
              {submitting ? <><Spinner size={18} color="#fff" /> Submitting...</> : "Submit Application →"}
            </button>
          </div>

          {/* Right: Safety & info */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={S.card}>
              <div style={S.cardTitle}>WHAT HAPPENS NEXT</div>
              {[
                { step: 1, text: "Your TrustID is sent to the employer" },
                { step: 2, text: "Employer reviews and shortlists" },
                { step: 3, text: "You're notified of any update" },
                { step: 4, text: "Interview via ARISE messages first" },
              ].map((s) => (
                <div key={s.step} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(255,107,53,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#FF6B35", flexShrink: 0 }}>{s.step}</div>
                  <span style={{ fontSize: 13, color: "#AAA", lineHeight: 1.5 }}>{s.text}</span>
                </div>
              ))}
            </div>

            <div style={{ background: "rgba(78,205,196,0.05)", border: "1px solid rgba(78,205,196,0.15)", borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#4ECDC4", marginBottom: 8 }}>🛡️ ARISE Safety</div>
              <div style={{ fontSize: 12, color: "#888", lineHeight: 1.6 }}>
                Contact details are never shared until you agree. Never pay any fees. All communication starts inside ARISE.
              </div>
            </div>

            {!user?.is_identity_verified && (
              <div style={{ background: "rgba(255,215,61,0.06)", border: "1px solid rgba(255,215,61,0.2)", borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#FFD93D", marginBottom: 6 }}>⚠ Boost your application</div>
                <div style={{ fontSize: 12, color: "#AAA", marginBottom: 10 }}>Verify your identity to stand out. Employers prefer verified applicants.</div>
                <Link to="/onboarding/identity" style={{ fontSize: 12, color: "#FFD93D", textDecoration: "none", fontWeight: 700 }}>Verify now +50 ECS →</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const MOCK_JOB = { id: "1", title: "Junior UI/UX Designer", employer: { company_name: "Tech4Africa" }, city: "Johannesburg", province: "Gauteng", job_type: "full_time", work_style: "hybrid", salary_min: 18000, already_applied: false };

const S = {
  page: { fontFamily: "'Sora',sans-serif", background: "#0A0A0F", color: "#E8E8F0", minHeight: "100vh", padding: "32px 24px" },
  inner: { maxWidth: 900, margin: "0 auto" },
  loading: { display: "flex", alignItems: "center", justifyContent: "center", gap: 12, height: "100vh", background: "#0A0A0F" },
  card: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 22 },
  cardTitle: { fontSize: 11, color: "#555", fontFamily: "DM Mono,monospace", fontWeight: 700, letterSpacing: 2, marginBottom: 14 },
  tag: { display: "inline-block", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "3px 10px", fontSize: 11, color: "#AAA" },
  textarea: { width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "12px 14px", color: "#E8E8F0", fontFamily: "Sora,sans-serif", fontSize: 14, outline: "none", resize: "vertical", transition: "border-color 0.2s" },
  primaryBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", background: "#FF6B35", color: "#fff", border: "none", padding: "14px", borderRadius: 8, fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "Sora,sans-serif" },
  ghostBtn: { background: "transparent", color: "#888", border: "1px solid rgba(255,255,255,0.1)", padding: "12px 24px", borderRadius: 8, fontSize: 14, cursor: "pointer", fontFamily: "Sora,sans-serif" },
  successCard: { maxWidth: 480, margin: "80px auto", textAlign: "center", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: 48 },
};