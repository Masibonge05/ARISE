import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

const CATEGORIES = ["design","development","writing","photography","translation","tutoring","marketing","video"];

function ProjectCard({ project }) {
  const matchColor = project.match_score >= 80 ? "#4ECDC4" : project.match_score >= 60 ? "#FFD93D" : "#888";
  const daysAgo = Math.floor((Date.now() - new Date(project.created_at)) / 86400000);
  return (
    <Link to={`/freelance/${project.id}`} style={{ textDecoration: "none" }}>
      <div style={styles.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div>
            <span style={{ fontSize: 10, background: "rgba(78,205,196,0.1)", border: "1px solid rgba(78,205,196,0.2)", borderRadius: 12, padding: "2px 8px", color: "#4ECDC4", fontWeight: 700, fontFamily: "DM Mono, monospace", textTransform: "uppercase" }}>{project.category}</span>
            {project.is_remote && <span style={{ fontSize: 10, marginLeft: 6, color: "#666" }}>🌐 Remote</span>}
          </div>
          <div style={{ fontSize: 12, color: matchColor, fontWeight: 700, fontFamily: "DM Mono, monospace" }}>{project.match_score}% match</div>
        </div>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, color: "#E8E8F0" }}>{project.title}</div>
        <div style={{ fontSize: 13, color: "#888", marginBottom: 10, lineHeight: 1.5 }}>{project.description?.slice(0, 100)}...</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
          {project.required_skills?.slice(0, 4).map((s) => (
            <span key={s} style={{ fontSize: 11, background: "rgba(255,107,53,0.08)", border: "1px solid rgba(255,107,53,0.15)", borderRadius: 12, padding: "3px 8px", color: "#FF6B35" }}>{s}</span>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div>
            <span style={{ fontSize: 15, fontWeight: 800, color: "#FFD93D" }}>R{project.budget_min?.toLocaleString()} – R{project.budget_max?.toLocaleString()}</span>
            <span style={{ fontSize: 11, color: "#555", marginLeft: 6 }}>· {project.deadline_days}d deadline</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: project.status === "open" ? "#4ECDC4" : "#666" }} />
            <span style={{ fontSize: 11, color: "#555", fontFamily: "DM Mono, monospace" }}>{daysAgo === 0 ? "Today" : `${daysAgo}d ago`}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function FreelanceFeed() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ category: "", is_remote: null });
  const [showPost, setShowPost] = useState(false);
  const [postForm, setPostForm] = useState({ title: "", description: "", category: "design", budget_min: "", budget_max: "", deadline_days: 7, required_skills: "", is_remote: true });
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const params = new URLSearchParams();
        if (filter.category) params.append("category", filter.category);
        if (filter.is_remote !== null) params.append("is_remote", filter.is_remote);
        const res = await api.get(`/freelance/?${params}`);
        setProjects(res.data.projects?.length ? res.data.projects : MOCK_PROJECTS);
      } catch { setProjects(MOCK_PROJECTS); }
      finally { setLoading(false); }
    };
    fetch();
  }, [filter]);

  const handlePost = async () => {
    setPosting(true);
    try {
      const body = { ...postForm, required_skills: postForm.required_skills.split(",").map((s) => s.trim()).filter(Boolean), budget_min: parseFloat(postForm.budget_min), budget_max: parseFloat(postForm.budget_max) };
      await api.post("/freelance/", body);
      setShowPost(false);
      setProjects((p) => [{ ...body, id: Date.now().toString(), status: "open", match_score: 90, created_at: new Date().toISOString() }, ...p]);
    } catch { alert("Could not post project."); }
    finally { setPosting(false); }
  };

  return (
    <div style={styles.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap'); * { box-sizing:border-box; } .proj-card:hover { border-color:rgba(78,205,196,0.3) !important; transform:translateY(-2px); } @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>
      <div style={styles.inner}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={styles.title}>Freelance Projects</h1>
            <p style={{ fontSize: 14, color: "#888" }}>{projects.length} projects · Ranked by skill match · Escrow-protected payments</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Link to="/freelance/active" style={styles.ghostBtn}>My Active Projects</Link>
            <button onClick={() => setShowPost(true)} style={styles.primaryBtn}>+ Post a Project</button>
          </div>
        </div>

        {/* Category filters */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={() => setFilter({ ...filter, category: "" })} style={{ ...styles.filterChip, ...(filter.category === "" ? styles.filterActive : {}) }}>All</button>
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setFilter({ ...filter, category: c })} style={{ ...styles.filterChip, ...(filter.category === c ? styles.filterActive : {}) }}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>

        {/* Escrow banner */}
        <div style={{ background: "rgba(255,215,61,0.05)", border: "1px solid rgba(255,215,61,0.15)", borderRadius: 10, padding: "12px 16px", display: "flex", gap: 10, alignItems: "center" }}>
          <span>🔒</span>
          <span style={{ fontSize: 13, color: "#AAA" }}>
            <strong style={{ color: "#FFD93D" }}>Escrow Protected:</strong> Client payment is held securely when you accept a project. Released automatically on delivery confirmation.
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#666" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🎨</div>
            <div style={{ fontFamily: "DM Mono, monospace", fontSize: 13 }}>Finding matching projects...</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
            {projects.map((p, i) => (
              <div key={p.id} className="proj-card" style={{ animation: `fadeUp 0.4s ${i * 0.05}s ease both` }}>
                <ProjectCard project={p} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Post project modal */}
      {showPost && (
        <div style={styles.overlay} onClick={() => setShowPost(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontWeight: 800, marginBottom: 20 }}>Post a Project Brief</h3>
            {[
              { label: "Project Title *", key: "title", placeholder: "e.g. Logo design for my startup" },
              { label: "Description *", key: "description", placeholder: "What do you need done?", type: "textarea" },
              { label: "Required Skills (comma separated)", key: "required_skills", placeholder: "Figma, Illustrator, Branding" },
              { label: "Budget Min (ZAR) *", key: "budget_min", placeholder: "1500", type: "number" },
              { label: "Budget Max (ZAR) *", key: "budget_max", placeholder: "3000", type: "number" },
              { label: "Deadline (days) *", key: "deadline_days", placeholder: "7", type: "number" },
            ].map((f) => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12, color: "#888", marginBottom: 6 }}>{f.label}</label>
                {f.type === "textarea" ? (
                  <textarea value={postForm[f.key]} onChange={(e) => setPostForm({ ...postForm, [f.key]: e.target.value })} placeholder={f.placeholder} rows={3} style={styles.modalInput} />
                ) : (
                  <input type={f.type || "text"} value={postForm[f.key]} onChange={(e) => setPostForm({ ...postForm, [f.key]: e.target.value })} placeholder={f.placeholder} style={styles.modalInput} />
                )}
              </div>
            ))}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, color: "#888", marginBottom: 6 }}>Category</label>
              <select value={postForm.category} onChange={(e) => setPostForm({ ...postForm, category: e.target.value })} style={styles.modalInput}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <button onClick={handlePost} disabled={posting || !postForm.title || !postForm.budget_min} style={{ width: "100%", background: "#4ECDC4", color: "#0A0A0F", border: "none", padding: 14, borderRadius: 8, fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "Sora, sans-serif" }}>
              {posting ? "Posting..." : "Post Project →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const MOCK_PROJECTS = [
  { id: "p1", title: "Logo & brand identity for fintech startup", description: "We need a complete brand identity package for our new mobile payment app targeting township communities.", category: "design", budget_min: 3500, budget_max: 7000, deadline_days: 10, required_skills: ["Logo Design", "Figma", "Brand Identity"], is_remote: true, match_score: 94, status: "open", created_at: new Date().toISOString() },
  { id: "p2", title: "React developer for 3-page website", description: "Build a simple 3-page responsive website for our NGO. Must look professional and work on mobile.", category: "development", budget_min: 5000, budget_max: 12000, deadline_days: 14, required_skills: ["React", "CSS", "Responsive Design"], is_remote: true, match_score: 87, status: "open", created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: "p3", title: "isiZulu translation of training materials", description: "Translate 20 pages of business training content from English to isiZulu. Must be natural and culturally appropriate.", category: "translation", budget_min: 1500, budget_max: 3000, deadline_days: 5, required_skills: ["isiZulu", "English", "Translation"], is_remote: true, match_score: 72, status: "open", created_at: new Date(Date.now() - 172800000).toISOString() },
];

const styles = {
  page: { fontFamily: "'Sora', sans-serif", background: "#0A0A0F", color: "#E8E8F0", minHeight: "100vh", padding: "32px 24px" },
  inner: { maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 },
  title: { fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 800, marginBottom: 4 },
  card: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 18, transition: "all 0.2s" },
  filterChip: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#888", borderRadius: 20, padding: "7px 14px", cursor: "pointer", fontSize: 12, fontWeight: 500, fontFamily: "Sora, sans-serif", transition: "all 0.2s" },
  filterActive: { background: "rgba(78,205,196,0.12)", borderColor: "rgba(78,205,196,0.3)", color: "#4ECDC4", fontWeight: 700 },
  primaryBtn: { background: "#4ECDC4", color: "#0A0A0F", border: "none", padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "Sora, sans-serif" },
  ghostBtn: { background: "transparent", color: "#888", border: "1px solid rgba(255,255,255,0.1)", padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none", fontFamily: "Sora, sans-serif", display: "flex", alignItems: "center" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 },
  modal: { background: "#141420", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 28, maxWidth: 460, width: "90%", maxHeight: "90vh", overflowY: "auto" },
  modalInput: { width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 14px", color: "#E8E8F0", fontFamily: "Sora, sans-serif", fontSize: 13, outline: "none", resize: "vertical" },
};