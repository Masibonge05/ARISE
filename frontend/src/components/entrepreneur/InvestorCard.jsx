import { Link } from "react-router-dom";
import { formatZAR } from "../../utils/formatters";
export default function InvestorCard({ investor, onInterest=null }) {
  const typeColor = { angel:"#FFD93D", vc:"#FF6B35", corporate:"#4ECDC4", dfi:"#A8E6CF" }[investor.investor_type]||"#888";
  return (
    <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:18 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
        <span style={{ fontSize:9, background:`${typeColor}15`, border:`1px solid ${typeColor}30`, borderRadius:12, padding:"2px 8px", color:typeColor, fontWeight:700, fontFamily:"DM Mono,monospace" }}>{investor.investor_type?.toUpperCase()}</span>
        {investor.is_bbee_mandate && <span style={{ fontSize:9, color:"#A8E6CF" }}>B-BBEE Mandate</span>}
      </div>
      <div style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>{investor.organization}</div>
      <div style={{ fontSize:13, fontWeight:700, color:"#FFD93D", marginBottom:8 }}>
        {formatZAR(investor.min_ticket_size||50000)} – {formatZAR(investor.max_ticket_size||2000000)}
      </div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:12 }}>
        {investor.focus_sectors?.slice(0,3).map(s=><span key={s} style={{ fontSize:10, background:"rgba(255,107,53,0.08)", border:"1px solid rgba(255,107,53,0.15)", borderRadius:10, padding:"2px 8px", color:"#FF6B35" }}>{s}</span>)}
      </div>
      {onInterest && <button onClick={()=>onInterest(investor)} style={{ width:"100%", background:"#FFD93D", color:"#0A0A0F", border:"none", borderRadius:8, padding:"9px", fontSize:12, fontWeight:800, cursor:"pointer" }}>Express Interest 🔒</button>}
    </div>
  );
}