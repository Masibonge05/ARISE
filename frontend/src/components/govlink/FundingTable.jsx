import { formatZAR } from "../../utils/formatters";
export default function FundingTable({ programs=[], sortBy="applications", onSort=null }) {
  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr repeat(4,auto)", gap:0, marginBottom:4 }}>
        {["Programme","Views","Applied","Approved","Avg Match"].map((h,i) => (
          <div key={h} style={{ fontSize:9, color:"#555", fontFamily:"DM Mono,monospace", fontWeight:700, padding:"4px 8px", textAlign:i>0?"right":"left" }}>{h.toUpperCase()}</div>
        ))}
      </div>
      {programs.map(p => (
        <div key={p.name} style={{ display:"grid", gridTemplateColumns:"1fr repeat(4,auto)", gap:0, borderTop:"1px solid rgba(255,255,255,0.04)", padding:"10px 0" }}>
          <div>
            <div style={{ fontSize:12, fontWeight:700 }}>{p.name}</div>
            <div style={{ fontSize:10, color:"#666" }}>{p.funder}</div>
          </div>
          {[p.views,p.applications,p.approved,`${p.avg_eligibility}%`].map((v,i) => (
            <div key={i} style={{ fontSize:12, fontWeight:700, textAlign:"right", padding:"0 8px", color:i===2?"#4ECDC4":i===3?"#FFD93D":"#E8E8F0", alignSelf:"center" }}>{typeof v==="number"?v?.toLocaleString():v}</div>
          ))}
        </div>
      ))}
    </div>
  );
}