import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import api from "../../services/api";

export default function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [proposing, setProposing] = useState(false);
  const [form, setForm] = useState({ cover_message: "", proposed_rate: "", estimated_days: 7 });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/freelance/${projectId}`);
        setProject(res.data);
        setSubmitted(res.data.already_proposed);
      } catch { setProject(MOCK_PROJECT); }
      finally { setLoading(false); }
    };
    fetch();
  }, [projectId]);

  const handlePropose = async () => {
    if (!form.cover_message || !form.proposed_rate) return;
    setProposing(true);
    try {
      await api.post(`/freelance/${projectId}/propose`, { ...form, proposed_rate: parseFloat(form.proposed_rate), estimated_days: parseInt(form.estimated_days) });
      setSubmitted(true);
    } catch (e) {
      if (e.response?.status === 409) setSubmitted(true);
    } finally { setProposing(false); }
  };

  if (loading) return <div style={dStyles.loading}>🔍 Loading project...</div>;
  if (!project) return <div style={dStyles.loading}>Project not found.</div>;

  return (
    <div style={dStyles.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap'); * { box-sizing:border-box; } @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>
      <div style={dStyles.inner}>
        <Link to="/freelance" style={{ fontSize: 13, color: "#666", textDecoration: "none", marginBottom: 20, display: "block" }}>← Back to Projects</Link>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, animation: "fadeUp 0.4s ease forwards" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={dStyles.card}>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 10, background: "rgba(78,205,196,0.1)", border: "1px solid rgba(78,205,196,0.2)", borderRadius: 12, padding: "2px 8px", color: "#4ECDC4", fontWeight: 700, fontFamily: "DM Mono, monospace" }}>{project.category?.toUpperCase()}</span>
                {project.is_remote && <span style={{ fontSize: 10, color: "#666" }}>🌐 Remote</span>}
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>{project.title}</h1>
              <div style={{ fontSize: 13, color: "#888", marginBottom: 16 }}>Posted by {project.client_name} · Client trust: {project.client_trust_score}/5</div>
              <p style={{ fontSize: 14, color: "#BBB", lineHeight: 1.7 }}>{project.description}</p>
            </div>

            {project.required_skills?.length > 0 && (
              <div style={dStyles.card}>
                <div style={dStyles.cardTitle}>REQUIRED SKILLS</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {project.required_skills.map((s) => <span key={s} style={{ background: "rgba(255,107,53,0.08)", border: "1px solid rgba(255,107,53,0.15)", borderRadius: 12, padding: "5px 12px", fontSize: 13, color: "#FF6B35" }}>{s}</span>)}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={dStyles.card}>
              <div style={dStyles.cardTitle}>PROJECT DETAILS</div>
              {[
                { label: "Budget", value: `R${project.budget_min?.toLocaleString()} – R${project.budget_max?.toLocaleString()}`, color: "#FFD93D" },
                { label: "Deadline", value: `${project.deadline_days} days` },
                { label: "Proposals", value: project.proposal_count || 0 },
                { label: "Match Score", value: `${project.match_score || 0}%`, color: "#4ECDC4" },
              ].map((d) => (
                <div key={d.label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ fontSize: 12, color: "#666" }}>{d.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: d.color || "#E8E8F0" }}>{d.value}</span>
                </div>
              ))}
            </div>

            {submitted ? (
              <div style={{ background: "rgba(78,205,196,0.06)", border: "1px solid rgba(78,205,196,0.2)", borderRadius: 12, padding: 20, textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
                <div style={{ fontWeight: 700, color: "#4ECDC4" }}>Proposal Submitted</div>
                <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>The client will review your TrustID profile</div>
              </div>
            ) : (
              <div style={dStyles.card}>
                <div style={dStyles.cardTitle}>SUBMIT A PROPOSAL</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <label style={dStyles.label}>Your rate (ZAR) *</label>
                    <input value={form.proposed_rate} onChange={(e) => setForm({ ...form, proposed_rate: e.target.value })} placeholder={`${project.budget_min}–${project.budget_max}`} type="number" style={dStyles.input} />
                  </div>
                  <div>
                    <label style={dStyles.label}>Delivery time (days)</label>
                    <input value={form.estimated_days} onChange={(e) => setForm({ ...form, estimated_days: e.target.value })} type="number" style={dStyles.input} />
                  </div>
                  <div>
                    <label style={dStyles.label}>Cover message *</label>
                    <textarea value={form.cover_message} onChange={(e) => setForm({ ...form, cover_message: e.target.value })} placeholder="Why are you the right person for this?" rows={3} style={{ ...dStyles.input, resize: "vertical" }} />
                  </div>
                  <button onClick={handlePropose} disabled={proposing || !form.cover_message || !form.proposed_rate} style={{ background: "#4ECDC4", color: "#0A0A0F", border: "none", padding: 13, borderRadius: 8, fontWeight: 800, cursor: "pointer", fontFamily: "Sora, sans-serif", opacity: (!form.cover_message || !form.proposed_rate) ? 0.5 : 1 }}>
                    {proposing ? "Submitting..." : "Submit Proposal →"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const MOCK_PROJECT = { id: "p1", title: "Logo & brand identity for fintech startup", description: "We need a complete brand identity for our new mobile payment app targeting township entrepreneurs.", category: "design", budget_min: 3500, budget_max: 7000, deadline_days: 10, required_skills: ["Logo Design", "Figma", "Brand Identity"], is_remote: true, match_score: 94, proposal_count: 3, client_name: "Thabo Mokoena", client_trust_score: 4.8, already_proposed: false };

const dStyles = {
  page: { fontFamily: "'Sora', sans-serif", background: "#0A0A0F", color: "#E8E8F0", minHeight: "100vh", padding: "32px 24px" },
  inner: { maxWidth: 960, margin: "0 auto" },
  loading: { display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "Sora, sans-serif", color: "#4ECDC4", background: "#0A0A0F" },
  card: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 22 },
  cardTitle: { fontSize: 11, color: "#555", fontFamily: "DM Mono, monospace", fontWeight: 700, letterSpacing: 2, marginBottom: 14 },
  label: { display: "block", fontSize: 12, color: "#888", marginBottom: 6 },
  input: { width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 14px", color: "#E8E8F0", fontFamily: "Sora, sans-serif", fontSize: 13, outline: "none" },
};