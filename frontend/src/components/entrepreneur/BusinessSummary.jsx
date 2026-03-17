import { formatZAR } from "../../utils/formatters";
export default function BusinessSummary({ business, compact=false }) {
  if (!business) return null;
  return (
    <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:compact?14:20 }}>
      <div style={{ fontWeight:800, fontSize:compact?15:18, marginBottom:4 }}>{business.business_name}</div>
      <div style={{ fontSize:12, color:"#888", marginBottom:8 }}>{business.sector} · {business.province}</div>
      {!compact && business.tagline && <div style={{ fontSize:13, color:"#BBB", marginBottom:10, lineHeight:1.5 }}>{business.tagline}</div>}
      <div style={{ display:"flex", gap:14 }}>
        {[{l:"Stage",v:business.stage?.replace("_"," ")},{l:"Employees",v:business.employee_count||1},{l:"Founded",v:business.year_founded||"—"}].map(m=>(
          <div key={m.l}><div style={{ fontSize:14, fontWeight:700 }}>{m.v}</div><div style={{ fontSize:9, color:"#555", fontFamily:"DM Mono,monospace" }}>{m.l.toUpperCase()}</div></div>
        ))}
      </div>
    </div>
  );
}