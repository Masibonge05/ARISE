import { Link } from "react-router-dom";
export default function VerificationCard({ step, done=false }) {
  return (
    <div style={{ display:"flex", gap:14, alignItems:"center", padding:"14px 18px", background:done?"rgba(78,205,196,0.04)":"rgba(255,255,255,0.03)", border:`1px solid ${done?"rgba(78,205,196,0.2)":"rgba(255,255,255,0.07)"}`, borderRadius:12, transition:"all 0.2s" }}>
      <div style={{ width:40, height:40, borderRadius:"50%", background:done?"rgba(78,205,196,0.15)":"rgba(255,255,255,0.05)", border:`1px solid ${done?"rgba(78,205,196,0.3)":"rgba(255,255,255,0.1)"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:done?14:18, flexShrink:0, color:done?"#4ECDC4":"#888" }}>
        {done?"✓":step.icon}
      </div>
      <div style={{ flex:1 }}>
        <div style={{ fontWeight:700, fontSize:14, color:done?"#4ECDC4":"#E8E8F0" }}>{step.label}</div>
        <div style={{ fontSize:11, color:"#666", marginTop:2 }}>{step.desc}</div>
      </div>
      <div style={{ fontSize:13, fontWeight:800, color:done?"#4ECDC4":"#FF6B35", fontFamily:"DM Mono,monospace", minWidth:45, textAlign:"center" }}>{done?"✓":`+${step.ecs}`}</div>
      {!done && <Link to={step.action} style={{ background:"rgba(255,107,53,0.1)", border:"1px solid rgba(255,107,53,0.25)", color:"#FF6B35", borderRadius:7, padding:"7px 12px", textDecoration:"none", fontSize:11, fontWeight:700, flexShrink:0 }}>{step.actionLabel||"Go →"}</Link>}
    </div>
  );
}