import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useToast } from "../../hooks/useToast";
import { Spinner, TrustBadge } from "../../components/ui";
import api from "../../services/api";

export default function InvestorProfile() {
  const { investorId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [investor, setInvestor] = useState(null);
  const [interest, setInterest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const r = await api.get(`/investors/interests/${investorId}`);
        setInterest(r.data);
        if (r.data.status === "accepted") {
          const p = await api.get(`/investors/${investorId}/profile`);
          setInvestor(p.data);
        }
      } catch { setInvestor(null); setInterest(null); }
      finally { setLoading(false); }
    };
    if (investorId) fetchData(); else setLoading(false);
  }, [investorId]);

  const handleAccept = async () => {
    setResponding(true);
    try {
      await api.post(`/investors/interests/${interest?.id}/respond`, { accept: true });
      toast.success("Connection accepted! Investor contact details now visible.");
      const p = await api.get(`/investors/${investorId}/profile`);
      setInvestor(p.data);
      setInterest(i => ({ ...i, status:"accepted" }));
    } catch { toast.error("Could not accept at this time."); }
    finally { setResponding(false); }
  };

  const handleDecline = async () => {
    setResponding(true);
    try {
      await api.post(`/investors/interests/${interest?.id}/respond`, { accept: false });
      toast.info("Interest declined.");
      navigate("/investors");
    } catch { toast.error("Could not decline at this time."); }
    finally { setResponding(false); }
  };

  if (loading) return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:"60vh",gap:12,fontFamily:"DM Mono,monospace",color:"#FFD93D",background:"#0A0A0F" }}>
      <Spinner color="#FFD93D" /> Loading investor…
    </div>
  );

  // Pending interest — show accept/decline
  if (interest?.status === "pending") return (
    <div style={S.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap'); *{box-sizing:border-box} @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={S.inner}>
        <Link to="/investors" style={{ fontSize:13, color:"#666", textDecoration:"none", display:"block", marginBottom:24 }}>← Back to Investors</Link>
        <div style={{ ...S.card, border:"1px solid rgba(255,215,61,0.25)", background:"rgba(255,215,61,0.04)", animation:"fadeUp 0.4s ease forwards" }}>
          <div style={{ fontSize:48, marginBottom:16, textAlign:"center" }}>📈</div>
          <h2 style={{ fontSize:22, fontWeight:800, marginBottom:8, textAlign:"center" }}>An investor wants to connect</h2>
          <p style={{ fontSize:14, color:"#888", lineHeight:1.7, textAlign:"center", maxWidth:440, margin:"0 auto 20px" }}>
            <strong style={{ color:"#E8E8F0" }}>{interest.investor_organization || "A verified investor"}</strong> has expressed interest in your business.
          </p>
          {interest.investor_message && (
            <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, padding:16, marginBottom:20 }}>
              <div style={S.cardTitle}>THEIR MESSAGE</div>
              <p style={{ fontSize:14, color:"#BBB", lineHeight:1.7 }}>{interest.investor_message}</p>
            </div>
          )}
          {interest.investment_amount_proposed && (
            <div style={{ textAlign:"center", marginBottom:20 }}>
              <div style={{ fontSize:28, fontWeight:900, color:"#FFD93D" }}>R{Number(interest.investment_amount_proposed).toLocaleString()}</div>
              <div style={{ fontSize:11, color:"#555", fontFamily:"DM Mono,monospace" }}>PROPOSED INVESTMENT</div>
            </div>
          )}
          <div style={{ background:"rgba(78,205,196,0.05)", border:"1px solid rgba(78,205,196,0.15)", borderRadius:8, padding:"12px 16px", marginBottom:20 }}>
            {["Contact shared only after acceptance","You can decline — no explanation needed","You can withdraw at any time"].map(p => (
              <div key={p} style={{ fontSize:12, color:"#4ECDC4", marginBottom:5 }}>✓ {p}</div>
            ))}
          </div>
          <div style={{ display:"flex", gap:12 }}>
            <button onClick={handleDecline} disabled={responding} style={{ flex:1, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"#888", borderRadius:8, padding:13, fontSize:14, cursor:"pointer", fontFamily:"Sora,sans-serif" }}>Decline</button>
            <button onClick={handleAccept} disabled={responding} style={{ flex:2, background:"#FFD93D", color:"#0A0A0F", border:"none", borderRadius:8, padding:13, fontSize:14, fontWeight:800, cursor:"pointer", fontFamily:"Sora,sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:8, opacity:responding?0.6:1 }}>
              {responding ? <Spinner size={16} color="#0A0A0F" /> : null}
              {responding ? "Processing…" : "Accept & View Profile →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // No interest or accepted but no data — privacy wall
  if (!investor) return (
    <div style={S.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap'); *{box-sizing:border-box} @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={S.inner}>
        <Link to="/investors" style={{ fontSize:13, color:"#666", textDecoration:"none", display:"block", marginBottom:24 }}>← Back to Investors</Link>
        <div style={{ ...S.card, border:"1px solid rgba(255,215,61,0.2)", background:"rgba(255,215,61,0.04)", textAlign:"center", padding:48, animation:"fadeUp 0.4s ease forwards" }}>
          <div style={{ fontSize:52, marginBottom:16 }}>🔒</div>
          <h2 style={{ fontSize:24, fontWeight:800, marginBottom:10 }}>Investor Profile Protected</h2>
          <p style={{ fontSize:14, color:"#888", lineHeight:1.7, maxWidth:440, margin:"0 auto 24px" }}>Investor profiles are only visible after mutual consent. Make sure your business profile is complete and visible to investors.</p>
          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <Link to="/investors" style={S.primaryBtn}>View Investor Interests →</Link>
            <Link to="/business-profile" style={S.ghostBtn}>Update Business Profile</Link>
          </div>
        </div>
      </div>
    </div>
  );

  // Full accepted profile
  const typeColor = { angel:"#FFD93D", vc:"#FF6B35", corporate:"#4ECDC4", dfi:"#A8E6CF" }[investor.investor_type] || "#888";
  return (
    <div style={S.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap'); *{box-sizing:border-box} @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={S.inner}>
        <Link to="/investors" style={{ fontSize:13, color:"#666", textDecoration:"none", display:"block", marginBottom:24 }}>← Back to Investors</Link>
        <div style={{ background:"rgba(78,205,196,0.05)", border:"1px solid rgba(78,205,196,0.2)", borderRadius:10, padding:"12px 16px", display:"flex", gap:8, marginBottom:20, animation:"fadeUp 0.4s ease forwards" }}>
          <span>🤝</span><span style={{ fontSize:13, color:"#4ECDC4" }}>Connection accepted — contact details are visible to you.</span>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:20, animation:"fadeUp 0.4s 0.05s ease both" }}>
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={S.card}>
              <div style={{ display:"flex", gap:12, marginBottom:14 }}>
                <div style={{ width:52, height:52, borderRadius:12, background:`${typeColor}20`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>📈</div>
                <div>
                  <div style={{ display:"flex", gap:6, marginBottom:6, flexWrap:"wrap" }}>
                    <span style={{ fontSize:10, background:`${typeColor}15`, border:`1px solid ${typeColor}30`, borderRadius:12, padding:"2px 8px", color:typeColor, fontWeight:700, fontFamily:"DM Mono,monospace" }}>{investor.investor_type?.toUpperCase()}</span>
                    {investor.is_verified && <TrustBadge type="verified" size="sm" />}
                  </div>
                  <h1 style={{ fontSize:20, fontWeight:800 }}>{investor.organization}</h1>
                </div>
              </div>
              {investor.investment_thesis && <p style={{ fontSize:14, color:"#BBB", lineHeight:1.7, borderTop:"1px solid rgba(255,255,255,0.06)", paddingTop:14 }}>{investor.investment_thesis}</p>}
            </div>
            <div style={S.card}>
              <div style={S.cardTitle}>INVESTMENT FOCUS</div>
              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:11, color:"#555", fontFamily:"DM Mono,monospace", marginBottom:8 }}>SECTORS</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {(investor.focus_sectors||["Technology"]).map(s => <span key={s} style={{ fontSize:12, background:"rgba(255,107,53,0.08)", border:"1px solid rgba(255,107,53,0.15)", borderRadius:12, padding:"3px 10px", color:"#FF6B35" }}>{s}</span>)}
                </div>
              </div>
              <div>
                <div style={{ fontSize:11, color:"#555", fontFamily:"DM Mono,monospace", marginBottom:8 }}>STAGES</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {(investor.focus_stages||["early"]).map(s => <span key={s} style={{ fontSize:12, background:"rgba(78,205,196,0.08)", border:"1px solid rgba(78,205,196,0.15)", borderRadius:12, padding:"3px 10px", color:"#4ECDC4", textTransform:"capitalize" }}>{s}</span>)}
                </div>
              </div>
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div style={S.card}>
              <div style={S.cardTitle}>TICKET SIZE</div>
              <div style={{ fontSize:20, fontWeight:800, color:"#FFD93D" }}>R{(investor.min_ticket_size||50000).toLocaleString()} – R{(investor.max_ticket_size||2000000).toLocaleString()}</div>
            </div>
            <div style={S.card}>
              <div style={S.cardTitle}>CONTACT</div>
              {investor.contact_email && <a href={`mailto:${investor.contact_email}`} style={{ fontSize:13, color:"#4ECDC4", textDecoration:"none", display:"block", marginBottom:8 }}>{investor.contact_email}</a>}
              {investor.contact_phone && <div style={{ fontSize:13, color:"#E8E8F0" }}>{investor.contact_phone}</div>}
              <Link to="/messages" style={{ display:"flex", alignItems:"center", justifyContent:"center", background:"#FFD93D", color:"#0A0A0F", textDecoration:"none", padding:"11px", borderRadius:8, fontSize:13, fontWeight:800, marginTop:14, fontFamily:"Sora,sans-serif" }}>💬 Message via ARISE</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const S = {
  page: { fontFamily:"'Sora',sans-serif", background:"#0A0A0F", color:"#E8E8F0", minHeight:"100vh", padding:"32px 24px" },
  inner: { maxWidth:860, margin:"0 auto" },
  card: { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:24 },
  cardTitle: { fontSize:11, color:"#555", fontFamily:"DM Mono,monospace", fontWeight:700, letterSpacing:2, marginBottom:14 },
  primaryBtn: { display:"inline-flex", alignItems:"center", background:"#FFD93D", color:"#0A0A0F", textDecoration:"none", padding:"11px 22px", borderRadius:8, fontSize:14, fontWeight:800, fontFamily:"Sora,sans-serif" },
  ghostBtn: { display:"inline-flex", alignItems:"center", background:"transparent", color:"#888", border:"1px solid rgba(255,255,255,0.1)", textDecoration:"none", padding:"11px 22px", borderRadius:8, fontSize:14, fontFamily:"Sora,sans-serif" },
};