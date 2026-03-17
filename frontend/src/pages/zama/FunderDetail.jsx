import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { TrustBadge, EmptyState, Spinner } from "../../components/ui";
import api from "../../services/api";

export default function FunderDetail() {
  const { funderId } = useParams();
  const navigate = useNavigate();
  const [funder, setFunder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/fundmatch/${funderId}`)
      .then((r) => setFunder(r.data))
      .catch(() => setFunder(MOCK))
      .finally(() => setLoading(false));
  }, [funderId]);

  const handleApply = async () => {
    setSubmitting(true); setError(null);
    try {
      await api.post("/fundmatch/apply", { grant_program_id: funderId, grant_program_name: funder?.name, funder_name: funder?.funder });
      setSubmitted(true);
    } catch (e) {
      setError(e.response?.data?.detail || "Submission failed. Please try again.");
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", gap: 12, fontFamily: "DM Mono,monospace", color: "#FFD93D", background: "#0A0A0F" }}>
      <Spinner color="#FFD93D" /> Loading funder...
    </div>
  );
  if (!funder) return null;

  const scoreColor = funder.eligibility_score >= 80 ? "#4ECDC4" : funder.eligibility_score >= 60 ? "#FFD93D" : "#FF6B35";
  const typeColors = { grant: "#4ECDC4", loan: "#FFD93D", loan_grant_hybrid: "#FF6B35" };

  return (
    <div style={S.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap'); * { box-sizing:border-box; } @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={S.inner}>
        <Link to="/fundmatch" style={{ fontSize: 13, color: "#666", textDecoration: "none", display: "block", marginBottom: 24 }}>← Back to FundMatch</Link>

        {/* Header card */}
        <div style={{ ...S.card, borderColor: `${scoreColor}25`, animation: "fadeUp 0.4s ease forwards" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 16 }}>
            <div>
              <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 10, background: `${typeColors[funder.type] || "#888"}15`, border: `1px solid ${typeColors[funder.type] || "#888"}30`, borderRadius: 12, padding: "2px 8px", color: typeColors[funder.type] || "#888", fontWeight: 700, fontFamily: "DM Mono,monospace" }}>
                  {funder.type?.replace("_", " ").toUpperCase()}
                </span>
                {funder.is_eligible && <TrustBadge type="verified" size="sm" />}
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>{funder.name}</h1>
              <div style={{ fontSize: 15, color: "#888" }}>{funder.funder}</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#FFD93D", marginTop: 10 }}>
                Up to R{funder.max_amount?.toLocaleString()}
              </div>
            </div>
            <div style={{ textAlign: "center", background: `${scoreColor}10`, border: `1px solid ${scoreColor}25`, borderRadius: 14, padding: "20px 28px", flexShrink: 0 }}>
              <div style={{ fontSize: 44, fontWeight: 900, color: scoreColor, lineHeight: 1 }}>{funder.eligibility_score}%</div>
              <div style={{ fontSize: 11, color: scoreColor, fontFamily: "DM Mono,monospace", marginTop: 4 }}>YOUR MATCH</div>
              {funder.is_eligible && <div style={{ fontSize: 10, color: "#4ECDC4", marginTop: 4, fontWeight: 700 }}>✓ YOU QUALIFY</div>}
            </div>
          </div>
          {funder.description && (
            <p style={{ fontSize: 14, color: "#BBB", lineHeight: 1.7, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)" }}>{funder.description}</p>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Why you match */}
          <div style={{ ...S.card, animation: "fadeUp 0.4s 0.05s ease both" }}>
            <div style={S.cardTitle}>WHY YOU MATCH</div>
            {funder.eligibility_reasons?.map((r, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 13, color: "#4ECDC4" }}>
                <span style={{ flexShrink: 0 }}>✓</span><span>{r}</span>
              </div>
            ))}
            {funder.disqualifiers?.map((d, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 13, color: "#FF8888" }}>
                <span style={{ flexShrink: 0 }}>✗</span><span>{d}</span>
              </div>
            ))}
          </div>

          {/* Requirements */}
          <div style={{ ...S.card, animation: "fadeUp 0.4s 0.1s ease both" }}>
            <div style={S.cardTitle}>REQUIREMENTS</div>
            {(funder.criteria || []).map((c, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 13, color: "#AAA" }}>
                <span style={{ color: "#FFD93D", flexShrink: 0 }}>→</span><span>{c}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pre-filled application */}
        {funder.application_draft && (
          <div style={{ ...S.card, animation: "fadeUp 0.4s 0.15s ease both" }}>
            <div style={S.cardTitle}>PRE-FILLED APPLICATION DRAFT</div>
            <div style={{ background: "rgba(255,215,61,0.05)", border: "1px solid rgba(255,215,61,0.15)", borderRadius: 8, padding: "10px 14px", marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}>
              <span>✨</span>
              <span style={{ fontSize: 12, color: "#FFD93D" }}>
                ARISE auto-filled <strong>{funder.application_draft.completion_percentage}%</strong> of this application from your TrustID profile
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: 10 }}>
              {Object.entries(funder.application_draft)
                .filter(([k]) => k !== "completion_percentage")
                .map(([key, value]) => (
                  <div key={key} style={{ background: "rgba(255,255,255,0.02)", borderRadius: 8, padding: "10px 14px" }}>
                    <div style={{ fontSize: 10, color: "#555", fontFamily: "DM Mono,monospace", marginBottom: 3 }}>{key.replace(/_/g, " ").toUpperCase()}</div>
                    <div style={{ fontSize: 13, color: String(value).startsWith("[") ? "#444" : "#E8E8F0", fontStyle: String(value).startsWith("[") ? "italic" : "normal" }}>{value}</div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {error && (
          <div style={{ background: "rgba(255,68,68,0.08)", border: "1px solid rgba(255,68,68,0.2)", borderRadius: 8, padding: "12px 16px", fontSize: 13, color: "#FF8888" }}>⚠ {error}</div>
        )}

        {submitted ? (
          <div style={{ background: "rgba(78,205,196,0.06)", border: "1px solid rgba(78,205,196,0.2)", borderRadius: 12, padding: 24, textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>✅</div>
            <div style={{ fontWeight: 800, color: "#4ECDC4", fontSize: 16, marginBottom: 6 }}>Application Submitted!</div>
            <div style={{ fontSize: 13, color: "#888", marginBottom: 16 }}>We'll track the status in your FundMatch dashboard.</div>
            <button onClick={() => navigate("/fundmatch")} style={S.primaryBtn}>Back to FundMatch →</button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={handleApply} disabled={submitting} style={{ ...S.primaryBtn, flex: 2, background: funder.is_eligible ? "#FFD93D" : "rgba(255,255,255,0.06)", color: funder.is_eligible ? "#0A0A0F" : "#888", opacity: submitting ? 0.6 : 1 }}>
              {submitting ? <Spinner size={16} color={funder.is_eligible ? "#0A0A0F" : "#888"} /> : null}
              {submitting ? "Submitting..." : funder.is_eligible ? "Submit Application →" : "View Official Page →"}
            </button>
            {funder.application_url && (
              <a href={funder.application_url} target="_blank" rel="noreferrer"
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#888", borderRadius: 8, textDecoration: "none", fontSize: 13, fontFamily: "Sora,sans-serif" }}>
                Official Site ↗
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const MOCK = { id: "nyda-001", name: "NYDA Youth Fund", funder: "National Youth Development Agency", type: "grant", max_amount: 100000, description: "Supports South African youth entrepreneurs aged 18-35 with business funding.", eligibility_score: 87, is_eligible: true, eligibility_reasons: ["Age meets requirement (18-35)", "SA citizenship confirmed", "All sectors eligible"], disqualifiers: [], criteria: ["SA citizen or permanent resident aged 18-35", "Viable business plan required", "No prior NYDA funding within 3 years"], application_url: "https://www.nyda.gov.za", application_draft: { applicant_name: "Zama Mokoena", email: "zama@arise.co.za", province: "Gauteng", business_name: "Zama Fashion Studio", cipc_number: "2024/234567/07", sector: "Fashion", amount_requested: "R100,000", purpose: "[Describe how you will use the funds]", completion_percentage: 75 } };

const S = {
  page: { fontFamily: "'Sora',sans-serif", background: "#0A0A0F", color: "#E8E8F0", minHeight: "100vh", padding: "32px 24px" },
  inner: { maxWidth: 860, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 },
  card: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 24 },
  cardTitle: { fontSize: 11, color: "#555", fontFamily: "DM Mono,monospace", fontWeight: 700, letterSpacing: 2, marginBottom: 14 },
  primaryBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#FFD93D", color: "#0A0A0F", border: "none", padding: "14px 24px", borderRadius: 8, fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "Sora,sans-serif" },
};