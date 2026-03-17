import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

// ─── PORTFOLIO PAGE ───────────────────────────────────────────────────────────
export function PortfolioPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "design", client_name: "" });
  const [adding, setAdding] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/users/me");
        setItems(res.data.portfolio_items || MOCK_PORTFOLIO);
      } catch { setItems(MOCK_PORTFOLIO); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const addItem = async () => {
    if (!form.title) return;
    setAdding(true);
    try {
      const newItem = { ...form, id: Date.now(), is_client_verified: false };
      setItems((i) => [...i, newItem]);
      setForm({ title: "", description: "", category: "design", client_name: "" });
      setShowAdd(false);
    } finally { setAdding(false); }
  };

  const CATEGORIES = ["design", "development", "photography", "writing", "video", "illustration", "branding", "other"];

  return (
    <div style={styles.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap'); * { box-sizing:border-box; } @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } } .port-card:hover { border-color:rgba(78,205,196,0.3) !important; transform:translateY(-2px); } .p-input { width:100%; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:11px 14px; color:#E8E8F0; font-family:'Sora',sans-serif; font-size:13px; outline:none; } .p-input:focus { border-color:#4ECDC4; }`}</style>

      <div style={styles.inner}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", animation: "fadeUp 0.4s ease forwards" }}>
          <div>
            <h1 style={styles.title}>Portfolio</h1>
            <p style={{ fontSize: 14, color: "#888" }}>{items.length} projects · Client-verified work shown with ✓</p>
          </div>
          <button onClick={() => setShowAdd(true)} style={styles.primaryBtn}>+ Add Work Sample</button>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {[
            { label: "Total Projects", value: items.length, color: "#E8E8F0" },
            { label: "Client Verified", value: items.filter((i) => i.is_client_verified).length, color: "#4ECDC4" },
            { label: "Avg Rating", value: items.filter((i) => i.client_rating).length > 0 ? (items.reduce((s, i) => s + (i.client_rating || 0), 0) / items.filter((i) => i.client_rating).length).toFixed(1) : "—", color: "#FFD93D" },
          ].map((s) => (
            <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "12px 18px" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#555", fontFamily: "DM Mono, monospace" }}>{s.label.toUpperCase()}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#666" }}>Loading portfolio...</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
            {items.map((item, i) => (
              <div key={item.id} className="port-card" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, overflow: "hidden", transition: "all 0.2s", animation: `fadeUp 0.4s ${i * 0.06}s ease both` }}>
                {/* Thumbnail placeholder */}
                <div style={{ height: 140, background: `linear-gradient(135deg, rgba(78,205,196,0.1), rgba(255,107,53,0.1))`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>
                  {item.thumbnail_url ? <img src={item.thumbnail_url} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : {design:"🎨",development:"💻",photography:"📸",writing:"✍️",video:"🎬",branding:"⭐",illustration:"🖼",other:"📁"}[item.category] || "📁"}
                </div>
                <div style={{ padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{item.title}</div>
                    {item.is_client_verified && <span style={{ fontSize: 10, color: "#4ECDC4", fontWeight: 700 }}>✓ VERIFIED</span>}
                  </div>
                  <div style={{ fontSize: 11, color: "#FF6B35", fontFamily: "DM Mono, monospace", marginBottom: 6 }}>{item.category?.toUpperCase()}</div>
                  {item.client_name && <div style={{ fontSize: 12, color: "#666" }}>Client: {item.client_name}</div>}
                  {item.client_rating && (
                    <div style={{ fontSize: 13, color: "#FFD93D", marginTop: 6 }}>{"★".repeat(item.client_rating)}{"☆".repeat(5 - item.client_rating)}</div>
                  )}
                  {item.description && <div style={{ fontSize: 12, color: "#666", marginTop: 6, lineHeight: 1.4 }}>{item.description?.slice(0, 80)}...</div>}
                </div>
              </div>
            ))}

            {/* Add new card */}
            <div onClick={() => setShowAdd(true)} style={{ background: "rgba(255,255,255,0.02)", border: "2px dashed rgba(255,255,255,0.08)", borderRadius: 14, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, cursor: "pointer", transition: "all 0.2s", minHeight: 200 }}>
              <div style={{ fontSize: 32, marginBottom: 8, opacity: 0.4 }}>+</div>
              <div style={{ fontSize: 13, color: "#555" }}>Add work sample</div>
            </div>
          </div>
        )}
      </div>

      {/* Add modal */}
      {showAdd && (
        <div style={styles.overlay} onClick={() => setShowAdd(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontWeight: 800, marginBottom: 20 }}>Add Portfolio Item</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              <div><label style={styles.label}>Title *</label><input className="p-input" placeholder="Logo design for FreshMart SA" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div><label style={styles.label}>Category</label>
                <select className="p-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div><label style={styles.label}>Client name (optional)</label><input className="p-input" placeholder="FreshMart SA" value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} /></div>
              <div><label style={styles.label}>Description</label><textarea className="p-input" rows={3} placeholder="Brief description of the work..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ resize: "vertical" }} /></div>
              <button onClick={addItem} disabled={adding || !form.title} style={{ background: "#4ECDC4", color: "#0A0A0F", border: "none", padding: 13, borderRadius: 8, fontWeight: 800, cursor: "pointer", fontFamily: "Sora, sans-serif" }}>
                {adding ? "Adding..." : "Add to Portfolio →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const MOCK_PORTFOLIO = [
  { id: "1", title: "FreshMart Brand Identity", category: "branding", client_name: "FreshMart SA", is_client_verified: true, client_rating: 5, description: "Complete brand identity including logo, colour palette, and brand guidelines." },
  { id: "2", title: "MobiPay App UI Design", category: "design", client_name: "MobiPay", is_client_verified: true, client_rating: 5, description: "End-to-end UI design for a fintech mobile app targeting township entrepreneurs." },
  { id: "3", title: "Thandi's Bakery Social Media", category: "design", client_name: "Thandi's Bakery", is_client_verified: false, client_rating: 4, description: "Social media graphics and content design for Instagram and Facebook." },
];


// ─── ACTIVE PROJECTS ──────────────────────────────────────────────────────────
export function ActiveProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/freelance/my/active");
        setProjects(res.data.projects?.length ? res.data.projects : MOCK_ACTIVE);
      } catch { setProjects(MOCK_ACTIVE); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const markDelivered = async (projectId) => {
    try {
      await api.post(`/freelance/${projectId}/deliver`);
      setProjects((p) => p.map((proj) => proj.id === projectId ? { ...proj, status: "pending_confirmation" } : proj));
    } catch { setProjects((p) => p.map((proj) => proj.id === projectId ? { ...proj, status: "pending_confirmation" } : proj)); }
  };

  return (
    <div style={styles.page}>
      <div style={styles.inner}>
        <h1 style={styles.title}>Active Projects</h1>
        <p style={{ fontSize: 14, color: "#888", marginBottom: 20 }}>{projects.length} active · Payments held in escrow</p>

        {loading ? <div style={{ textAlign: "center", padding: 60, color: "#666" }}>Loading projects...</div> :
          projects.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60, color: "#666", background: "rgba(255,255,255,0.02)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>⚙️</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>No active projects</div>
              <Link to="/freelance" style={{ color: "#4ECDC4", textDecoration: "none", fontWeight: 600, fontSize: 13 }}>Browse projects →</Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {projects.map((p) => {
                const statusColors = { in_progress: "#FFD93D", pending_confirmation: "#4ECDC4" };
                const color = statusColors[p.status] || "#888";
                return (
                  <div key={p.id} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${color}25`, borderRadius: 14, padding: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{p.title}</div>
                        <div style={{ fontSize: 13, color: "#888" }}>Client: {p.client_name}</div>
                      </div>
                      <div>
                        <span style={{ fontSize: 10, background: `${color}15`, border: `1px solid ${color}30`, borderRadius: 12, padding: "3px 10px", color, fontWeight: 700, fontFamily: "DM Mono, monospace" }}>
                          {p.status === "in_progress" ? "IN PROGRESS" : "AWAITING CONFIRMATION"}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: "#4ECDC4" }}>R{p.escrow_amount?.toLocaleString() || "—"}</div>
                        <div style={{ fontSize: 11, color: "#555", fontFamily: "DM Mono, monospace" }}>🔒 IN ESCROW</div>
                      </div>
                      {p.status === "in_progress" && (
                        <button onClick={() => markDelivered(p.id)} style={{ background: "#4ECDC4", color: "#0A0A0F", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "Sora, sans-serif" }}>
                          Mark as Delivered ✓
                        </button>
                      )}
                      {p.status === "pending_confirmation" && (
                        <div style={{ fontSize: 13, color: "#4ECDC4", fontWeight: 600 }}>⏳ Waiting for client confirmation</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        }
      </div>
    </div>
  );
}

const MOCK_ACTIVE = [
  { id: "a1", title: "Logo design for Nkosi Tech", client_name: "Nkosi Tech", status: "in_progress", escrow_amount: 4500 },
  { id: "a2", title: "Social media kit — Ubuntu Café", client_name: "Ubuntu Café", status: "pending_confirmation", escrow_amount: 2800 },
];

const styles = {
  page: { fontFamily: "'Sora', sans-serif", background: "#0A0A0F", color: "#E8E8F0", minHeight: "100vh", padding: "32px 24px" },
  inner: { maxWidth: 1000, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 },
  title: { fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 800, marginBottom: 4 },
  label: { display: "block", fontSize: 12, color: "#888", marginBottom: 6 },
  primaryBtn: { background: "#4ECDC4", color: "#0A0A0F", border: "none", padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "Sora, sans-serif" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 },
  modal: { background: "#141420", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 28, maxWidth: 420, width: "90%" },
};

export default PortfolioPage;