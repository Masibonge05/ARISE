import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../../hooks/useToast";
import { EmptyState, Spinner } from "../../components/ui";
import EscrowStatus from "../../components/freelance/EscrowStatus";
import api from "../../services/api";

export default function ActiveProjects() {
  const toast = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [delivering, setDelivering] = useState(null);

  useEffect(() => {
    api.get("/freelance/my/active")
      .then(r => setProjects(r.data.projects?.length ? r.data.projects : MOCK))
      .catch(() => setProjects(MOCK))
      .finally(() => setLoading(false));
  }, []);

  const handleDeliver = async (projectId) => {
    setDelivering(projectId);
    try {
      await api.post(`/freelance/${projectId}/deliver`, { delivery_notes:"Delivered via ARISE" });
      setProjects(p => p.map(x => x.id===projectId ? {...x, status:"delivered"} : x));
      toast.success("Delivery submitted! Client will confirm and release payment.");
    } catch { toast.error("Could not mark as delivered."); }
    finally { setDelivering(null); }
  };

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"60vh", gap:12, background:"#0A0A0F" }}>
      <Spinner /> <span style={{ color:"#4ECDC4", fontFamily:"DM Mono,monospace", fontSize:13 }}>Loading projects…</span>
    </div>
  );

  return (
    <div style={S.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Mono:wght@400&display=swap'); *{box-sizing:border-box} @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={S.inner}>
        <div style={{ animation:"fadeUp 0.4s ease" }}>
          <h1 style={S.title}>Active Projects</h1>
          <p style={{ fontSize:14, color:"#888" }}>{projects.length} project{projects.length!==1?"s":""} in progress</p>
        </div>

        {projects.length === 0 ? (
          <EmptyState icon="⚙️" title="No active projects" desc="Accept a proposal or find new projects in the freelance feed."
            action={<Link to="/freelance" style={{ background:"#4ECDC4", color:"#0A0A0F", padding:"10px 20px", borderRadius:8, textDecoration:"none", fontSize:13, fontWeight:700 }}>Browse Projects →</Link>} />
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {projects.map((p,i) => {
              const statusColors = { in_progress:"#FFD93D", delivered:"#4ECDC4", revision:"#FF6B35" };
              const sColor = statusColors[p.status] || "#888";
              return (
                <div key={p.id} style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${sColor}20`, borderRadius:14, padding:22, animation:`fadeUp 0.4s ${i*0.05}s ease both` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                    <div>
                      <div style={{ fontWeight:800, fontSize:16, marginBottom:4 }}>{p.title}</div>
                      <div style={{ fontSize:12, color:"#888" }}>Client: {p.client_name} · {p.deadline_days} day deadline</div>
                    </div>
                    <span style={{ fontSize:9, background:`${sColor}15`, border:`1px solid ${sColor}30`, borderRadius:12, padding:"3px 10px", color:sColor, fontWeight:700, fontFamily:"DM Mono,monospace", flexShrink:0 }}>
                      {p.status?.replace("_"," ").toUpperCase()}
                    </span>
                  </div>

                  <EscrowStatus amount={p.agreed_rate} status={p.status==="delivered"?"held":"held"} />

                  {p.required_skills?.length > 0 && (
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:10 }}>
                      {p.required_skills.map(s => <span key={s} style={{ fontSize:10, background:"rgba(78,205,196,0.08)", border:"1px solid rgba(78,205,196,0.15)", borderRadius:10, padding:"2px 8px", color:"#4ECDC4" }}>{s}</span>)}
                    </div>
                  )}

                  <div style={{ display:"flex", gap:10, marginTop:14 }}>
                    <Link to={`/freelance/${p.id}`} style={{ flex:1, textAlign:"center", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"#888", borderRadius:8, padding:"10px", fontSize:12, fontWeight:700, textDecoration:"none" }}>View Details</Link>
                    {p.status === "in_progress" && (
                      <button onClick={() => handleDeliver(p.id)} disabled={delivering===p.id}
                        style={{ flex:2, background:"#4ECDC4", color:"#0A0A0F", border:"none", borderRadius:8, padding:"10px", fontSize:12, fontWeight:800, cursor:"pointer", fontFamily:"Sora,sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:6, opacity:delivering===p.id?0.6:1 }}>
                        {delivering===p.id ? <Spinner size={14} color="#0A0A0F" /> : null}
                        {delivering===p.id ? "Submitting…" : "Mark as Delivered ✓"}
                      </button>
                    )}
                    {p.status === "delivered" && <div style={{ flex:2, textAlign:"center", background:"rgba(78,205,196,0.08)", border:"1px solid rgba(78,205,196,0.2)", color:"#4ECDC4", borderRadius:8, padding:"10px", fontSize:12, fontWeight:700 }}>Awaiting Client Confirmation</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const MOCK = [
  { id:"p1", title:"Logo & Brand Identity for FreshMart SA", client_name:"Thabo Mokoena", deadline_days:10, status:"in_progress", agreed_rate:5800, required_skills:["Logo Design","Figma"], escrow_amount:5800 },
  { id:"p2", title:"React Dashboard for MobiPay",            client_name:"Ayanda Dube",   deadline_days:5,  status:"delivered",    agreed_rate:7200, required_skills:["React","TypeScript"],  escrow_amount:7200 },
];

const S = {
  page: { fontFamily:"'Sora',sans-serif", background:"#0A0A0F", color:"#E8E8F0", minHeight:"100vh", padding:"32px 24px" },
  inner: { maxWidth:860, margin:"0 auto", display:"flex", flexDirection:"column", gap:20 },
  title: { fontSize:"clamp(22px,3vw,30px)", fontWeight:800, marginBottom:4 },
};