import { Link } from "react-router-dom";
import { formatZAR } from "../../utils/formatters";
export default function GrantCard({ grant }) {
  const scoreColor = grant.eligibility_score>=80?"#4ECDC4":grant.eligibility_score>=60?"#FFD93D":"#FF6B35";
  const typeColor = { grant:"#4ECDC4", loan:"#FFD93D", loan_grant_hybrid:"#FF6B35" }[grant.type]||"#888";
  return (
    <Link to={`/fundmatch/${grant.id}`} style={{ display:"block", textDecoration:"none" }}>
      <div style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${grant.is_eligible?"rgba(78,205,196,0.2)":"rgba(255,255,255,0.07)"}`, borderRadius:14, padding:18 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
          <span style={{ fontSize:9, background:`${typeColor}15`, border:`1px solid ${typeColor}30`, borderRadius:12, padding:"2px 8px", color:typeColor, fontWeight:700, fontFamily:"DM Mono,monospace" }}>{grant.type?.replace("_"," ").toUpperCase()}</span>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:20, fontWeight:900, color:scoreColor, lineHeight:1 }}>{grant.eligibility_score}%</div>
            <div style={{ fontSize:8, color:scoreColor, fontFamily:"DM Mono,monospace" }}>MATCH</div>
          </div>
        </div>
        <div style={{ fontWeight:700, fontSize:14, marginBottom:4, color:"#E8E8F0" }}>{grant.name}</div>
        <div style={{ fontSize:12, color:"#888", marginBottom:8 }}>{grant.funder}</div>
        <div style={{ fontSize:16, fontWeight:800, color:"#FFD93D" }}>Up to {formatZAR(grant.max_amount)}</div>
        {grant.is_eligible && <div style={{ fontSize:10, color:"#4ECDC4", marginTop:4, fontWeight:700 }}>✓ You appear eligible</div>}
      </div>
    </Link>
  );
}