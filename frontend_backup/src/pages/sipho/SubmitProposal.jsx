import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { TrustBadge, ErrorBanner, Spinner, MatchScore } from "../../components/ui";
import api from "../../services/api";

export default function SubmitProposal() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]       = useState(null);
  const [portfolio, setPortfolio]   = useState([]);

  const [form, setForm] = useState({
    cover_message: "",
    proposed_rate: "",
    estimated_days: 7,
    portfolio_item_ids: [],
  });

  const set = (key, val) => { setError(null); setForm((f) => ({ ...f, [key]: val })); };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, userRes] = await Promise.all([
          api.get(`/freelance/${projectId}`),
          api.get("/users/me"),
        ]);
        if (projRes.data.already_proposed) { navigate(`/freelance/${projectId}`); return; }
        setProject(projRes.data);
        setPortfolio(userRes.data.portfolio_items || []);
        // Pre-fill rate at project midpoint
        if (projRes.data.budget_min && projRes.data.budget_max) {
          set("proposed_rate", Math.round((projRes.data.budget_min + projRes.data.budget_max) / 2).toString());
        }
      } catch { setProject(MOCK_PROJECT); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [projectId]);

  const handleSubmit = async () => {
    if (!form.cover_message.trim() || !form.proposed_rate) {
      setError("Please fill in your rate and cover message."); return;
    }
    setSubmitting(true); setError(null);
    try {
      await api.post(`/freelance/${projectId}/propose`, {
        cover_message: form.cover_message,
        proposed_rate: parseFloat(form.proposed_rate),
        estimated_days: parseInt(form.estimated_days),
        portfolio_item_ids: form.portfolio_item_ids,
      });
      setSubmitted(true);
    } catch (e) {
      if (e.response?.status === 409) setSubmitted(true);
      else setError(e.response?.data?.detail || "Submission failed. Please try again.");
    } finally { setSubmitting(false); }
  };

  const togglePortfolio = (id) =>
    set("portfolio_item_ids", form.portfolio_item_ids.includes(id)
      ? form.portfolio_item_ids.filter((x) => x !== id)
      : [...form.portfolio_item_ids, id]);

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"60vh", gap:12, fontFamily:"DM Mono,monospace", color:"#4ECDC4", background:"#0A0A0F" }}>
      <Spinner color="#4ECDC4" /> Loading project...
    </div>
  );

  if (submitted) return (
    <div style={S.page}>
      <div style={{ maxWidth:480, margin:"80px auto", textAlign:"center", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(78,205,196,0.2)", borderRadius:18, padding:48 }}>
        <div style={{ fontSize:56, marginBottom:16 }}>🎉</div>
        <h2 style={{ fontSize:26, fontWeight:800, marginBottom:8 }}>Proposal Submitted!</h2>
        <p style={{ fontSize:14, color:"#888", marginBottom:24, lineHeight:1.7 }}>
          Your TrustID profile and proposal have been sent to the client. You'll be notified when they respond.
        </p>
        <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
          <button onClick={() => navigate("/freelance/active")} style={S.primaryBtn}>View Active Projects →</button>
          <button onClick={() => navigate("/freelance")} style={S.ghostBtn}>Browse More</button>
        </div>
      </div>
    </div>
  );

  const budget_midpoint = project?.budget_min && project?.budget_max
    ? Math.round((project.budget_min + project.budget_max) / 2)
    : null;

  return (
    <div style={S.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap'); *{box-sizing:border-box} @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={S.inner}>
        <Link to={`/freelance/${projectId}`} style={{ fontSize:13, color:"#666", textDecoration:"none", display:"block", marginBottom:24 }}>← Back to Project</Link>

        {/* Project header */}
        <div style={{ ...S.card, marginBottom:0, animation:"fadeUp 0.4s ease forwards" }}>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:8 }}>
            <span style={{ fontSize:10, background:"rgba(78,205,196,0.1)", border:"1px solid rgba(78,205,196,0.2)", borderRadius:12, padding:"2px 8px", color:"#4ECDC4", fontWeight:700, fontFamily:"DM Mono,monospace" }}>{project?.category?.toUpperCase()}</span>
            {project?.is_remote && <span style={{ fontSize:10, color:"#666" }}>🌐 Remote</span>}
          </div>
          <h1 style={{ fontSize:20, fontWeight:800, marginBottom:6 }}>{project?.title}</h1>
          <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
            <span style={{ fontSize:15, fontWeight:800, color:"#FFD93D" }}>R{project?.budget_min?.toLocaleString()} – R{project?.budget_max?.toLocaleString()}</span>
            <span style={{ fontSize:13, color:"#888" }}>⏱ {project?.deadline_days} day deadline</span>
            <span style={{ fontSize:13, color:"#888" }}>👤 {project?.proposal_count || 0} proposals so far</span>
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:20, animation:"fadeUp 0.4s 0.05s ease both" }}>
          {/* Left: Form */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

            {/* Rate */}
            <div style={S.card}>
              <div style={S.cardTitle}>YOUR PROPOSED RATE (ZAR) *</div>
              <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                <div style={{ position:"relative", flex:1 }}>
                  <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"#888", fontSize:15, fontWeight:700 }}>R</span>
                  <input
                    type="number"
                    value={form.proposed_rate}
                    onChange={(e) => set("proposed_rate", e.target.value)}
                    placeholder={budget_midpoint?.toString() || "5000"}
                    style={{ ...S.input, paddingLeft:28 }}
                  />
                </div>
                {budget_midpoint && (
                  <button onClick={() => set("proposed_rate", budget_midpoint.toString())}
                    style={{ background:"rgba(255,215,61,0.1)", border:"1px solid rgba(255,215,61,0.25)", color:"#FFD93D", borderRadius:8, padding:"10px 14px", fontSize:12, cursor:"pointer", fontFamily:"Sora,sans-serif", whiteSpace:"nowrap" }}>
                    Use midpoint R{budget_midpoint.toLocaleString()}
                  </button>
                )}
              </div>
              <div style={{ fontSize:11, color:"#555", marginTop:6, fontFamily:"DM Mono,monospace" }}>
                Client budget: R{project?.budget_min?.toLocaleString()} – R{project?.budget_max?.toLocaleString()}
              </div>
            </div>

            {/* Timeline */}
            <div style={S.card}>
              <div style={S.cardTitle}>ESTIMATED DELIVERY (DAYS) *</div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {[3,5,7,10,14,21,30].map((d) => (
                  <button key={d} onClick={() => set("estimated_days", d)}
                    style={{ background: form.estimated_days === d ? "rgba(78,205,196,0.15)" : "rgba(255,255,255,0.04)", border:`1px solid ${form.estimated_days === d ? "rgba(78,205,196,0.4)" : "rgba(255,255,255,0.08)"}`, color: form.estimated_days === d ? "#4ECDC4" : "#888", borderRadius:8, padding:"8px 16px", fontSize:13, fontWeight: form.estimated_days === d ? 700 : 400, cursor:"pointer", fontFamily:"Sora,sans-serif", transition:"all 0.15s" }}>
                    {d}d
                  </button>
                ))}
              </div>
              {project?.deadline_days && form.estimated_days > project.deadline_days && (
                <div style={{ fontSize:11, color:"#FFD93D", marginTop:8 }}>⚠ Exceeds client deadline of {project.deadline_days} days</div>
              )}
            </div>

            {/* Cover message */}
            <div style={S.card}>
              <div style={S.cardTitle}>COVER MESSAGE *</div>
              <textarea
                value={form.cover_message}
                onChange={(e) => set("cover_message", e.target.value)}
                placeholder={`Hi! I'd love to work on this project. Here's why I'm the right person:\n\n- My experience with ${project?.required_skills?.[0] || "your required skills"}\n- My approach to this type of work\n- Why I'm excited about this specific brief`}
                rows={6}
                style={{ ...S.input, resize:"vertical" }}
              />
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:6, fontSize:11, color:"#555", fontFamily:"DM Mono,monospace" }}>
                <span>{form.cover_message.length}/500 characters</span>
                {form.cover_message.length > 400 && <span style={{ color:"#FFD93D" }}>Getting long — keep it focused</span>}
              </div>
            </div>

            {/* Portfolio */}
            {portfolio.length > 0 && (
              <div style={S.card}>
                <div style={S.cardTitle}>ATTACH PORTFOLIO ITEMS (OPTIONAL)</div>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {portfolio.slice(0, 4).map((item) => (
                    <div key={item.id} onClick={() => togglePortfolio(item.id)}
                      style={{ display:"flex", gap:12, alignItems:"center", padding:"10px 14px", borderRadius:8, border:`1px solid ${form.portfolio_item_ids.includes(item.id) ? "rgba(78,205,196,0.4)" : "rgba(255,255,255,0.07)"}`, background: form.portfolio_item_ids.includes(item.id) ? "rgba(78,205,196,0.06)" : "rgba(255,255,255,0.02)", cursor:"pointer", transition:"all 0.15s" }}>
                      <div style={{ fontSize:20 }}>{{ design:"🎨", development:"💻", branding:"⭐", photography:"📸" }[item.category] || "📁"}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:600 }}>{item.title}</div>
                        {item.client_name && <div style={{ fontSize:11, color:"#666" }}>Client: {item.client_name}</div>}
                      </div>
                      {item.is_client_verified && <TrustBadge type="verified" size="sm" />}
                      {form.portfolio_item_ids.includes(item.id) && <span style={{ color:"#4ECDC4", fontSize:16 }}>✓</span>}
                    </div>
                  ))}
                </div>
                <Link to="/portfolio" style={{ display:"block", marginTop:10, fontSize:12, color:"#4ECDC4", textDecoration:"none" }}>Manage portfolio →</Link>
              </div>
            )}

            <ErrorBanner message={error} onDismiss={() => setError(null)} />

            <button onClick={handleSubmit} disabled={submitting || !form.cover_message.trim() || !form.proposed_rate}
              style={{ ...S.primaryBtn, opacity: (!form.cover_message.trim() || !form.proposed_rate || submitting) ? 0.5 : 1 }}>
              {submitting ? <><Spinner size={18} color="#0A0A0F" /> Submitting...</> : "Submit Proposal →"}
            </button>
          </div>

          {/* Right: TrustID preview */}
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div style={S.card}>
              <div style={S.cardTitle}>YOUR TRUSTID</div>
              <div style={{ fontSize:13, color:"#AAA", marginBottom:12, lineHeight:1.5 }}>The client will see your verified skills and work history alongside your proposal.</div>
              {project?.match_score && (
                <div style={{ marginBottom:14, textAlign:"center" }}>
                  <MatchScore score={project.match_score} size="lg" />
                  <div style={{ fontSize:11, color:"#555", fontFamily:"DM Mono,monospace", marginTop:4 }}>YOUR SKILL MATCH</div>
                </div>
              )}
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                {user?.is_identity_verified && <TrustBadge type="identity" size="sm" />}
                {(user?.skills || []).filter(s => s.verification_source !== "self_claimed").slice(0,3).map(s => (
                  <span key={s.skill_name} style={{ fontSize:10, background:"rgba(255,107,53,0.08)", border:"1px solid rgba(255,107,53,0.15)", borderRadius:12, padding:"2px 8px", color:"#FF6B35" }}>{s.skill_name}</span>
                ))}
              </div>
              <div style={{ marginTop:10, fontSize:12, color:"#FF6B35", fontFamily:"DM Mono,monospace" }}>ECS {user?.ecs_score || 0}</div>
            </div>

            <div style={{ background:"rgba(255,215,61,0.05)", border:"1px solid rgba(255,215,61,0.2)", borderRadius:12, padding:16 }}>
              <div style={{ fontWeight:700, color:"#FFD93D", fontSize:13, marginBottom:8 }}>💡 Tips for winning</div>
              {["Be specific about your relevant experience","Reference the client's actual brief","Propose a fair rate — not the lowest","Keep it under 200 words"].map(tip => (
                <div key={tip} style={{ fontSize:12, color:"#888", marginBottom:5, display:"flex", gap:6 }}>
                  <span style={{ color:"#FFD93D", flexShrink:0 }}>→</span><span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const MOCK_PROJECT = { id:"p1", title:"Logo & brand identity for fintech startup", category:"design", budget_min:3500, budget_max:7000, deadline_days:10, required_skills:["Logo Design","Figma"], is_remote:true, match_score:94, proposal_count:3, already_proposed:false };

const S = {
  page: { fontFamily:"'Sora',sans-serif", background:"#0A0A0F", color:"#E8E8F0", minHeight:"100vh", padding:"32px 24px" },
  inner: { maxWidth:960, margin:"0 auto" },
  card: { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:22 },
  cardTitle: { fontSize:11, color:"#555", fontFamily:"DM Mono,monospace", fontWeight:700, letterSpacing:2, marginBottom:14 },
  input: { width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"12px 14px", color:"#E8E8F0", fontFamily:"Sora,sans-serif", fontSize:14, outline:"none", transition:"border-color 0.2s" },
  primaryBtn: { display:"flex", alignItems:"center", justifyContent:"center", gap:8, width:"100%", background:"#4ECDC4", color:"#0A0A0F", border:"none", padding:"15px", borderRadius:8, fontSize:15, fontWeight:800, cursor:"pointer", fontFamily:"Sora,sans-serif" },
  ghostBtn: { background:"transparent", color:"#888", border:"1px solid rgba(255,255,255,0.1)", padding:"12px 24px", borderRadius:8, fontSize:14, cursor:"pointer", fontFamily:"Sora,sans-serif" },
};