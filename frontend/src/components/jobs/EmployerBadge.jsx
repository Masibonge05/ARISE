import { Link } from "react-router-dom";
export default function EmployerBadge({ employer, showDetails=false }) {
  if (!employer) return null;
  const verified = employer.verification_status === "verified";
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      <div style={{ width:36, height:36, borderRadius:8, background:"rgba(255,107,53,0.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>🏢</div>
      <div>
        <div style={{ fontWeight:700, fontSize:13 }}>{employer.company_name}</div>
        {showDetails && <div style={{ fontSize:11, color:"#888" }}>{employer.industry} · {employer.city}</div>}
        <span style={{ fontSize:9, background:verified?"rgba(78,205,196,0.1)":"rgba(255,215,61,0.08)", border:`1px solid ${verified?"rgba(78,205,196,0.3)":"rgba(255,215,61,0.2)"}`, borderRadius:10, padding:"1px 6px", color:verified?"#4ECDC4":"#FFD93D", fontWeight:700 }}>
          {verified?"✓ Verified":"⚠ Unverified"}
        </span>
      </div>
    </div>
  );
}