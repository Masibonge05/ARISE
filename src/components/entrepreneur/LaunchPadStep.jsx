export default function LaunchPadStep({ step, active=false, done=false, onClick=null }) {
  const statusColor = done?"#4ECDC4":active?"#FF6B35":"#555";
  return (
    <div onClick={onClick} style={{ display:"flex", gap:14, alignItems:"flex-start", padding:"14px 18px", background:active?"rgba(255,107,53,0.06)":done?"rgba(78,205,196,0.04)":"rgba(255,255,255,0.02)", border:`1px solid ${statusColor}20`, borderRadius:12, cursor:onClick?"pointer":"default" }}>
      <div style={{ width:36, height:36, borderRadius:"50%", background:done?"#4ECDC4":active?"rgba(255,107,53,0.2)":"rgba(255,255,255,0.05)", border:`2px solid ${statusColor}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:done?14:16, flexShrink:0, color:done?"#0A0A0F":active?"#FF6B35":"#555", fontWeight:800 }}>
        {done?"✓":step.step}
      </div>
      <div style={{ flex:1 }}>
        <div style={{ fontWeight:700, fontSize:14, color:done?"#4ECDC4":active?"#E8E8F0":"#888" }}>{step.title}</div>
        <div style={{ fontSize:12, color:"#666", marginTop:2 }}>{step.description}</div>
      </div>
      {step.ecs > 0 && <div style={{ fontSize:12, fontWeight:700, color:"#FF6B35", fontFamily:"DM Mono,monospace" }}>+{step.ecs}</div>}
    </div>
  );
}