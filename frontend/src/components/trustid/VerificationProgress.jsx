export default function VerificationProgress({ score=0, checklistItems=[] }) {
  const pct = Math.round(score);
  const color = pct>=80?"#4ECDC4":pct>=60?"#FFD93D":"#FF6B35";
  const completed = checklistItems.filter(i => i.completed).length;
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
        <div style={{ fontSize:11, color:"#555", fontFamily:"DM Mono,monospace" }}>TRUSTID COMPLETE</div>
        <div style={{ fontSize:11, fontWeight:700, color, fontFamily:"DM Mono,monospace" }}>{pct}%</div>
      </div>
      <div style={{ height:6, background:"rgba(255,255,255,0.06)", borderRadius:3 }}>
        <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg,${color},${color}cc)`, borderRadius:3, transition:"width 1s ease" }} />
      </div>
      {checklistItems.length > 0 && (
        <div style={{ fontSize:11, color:"#555", marginTop:4 }}>{completed}/{checklistItems.length} items verified</div>
      )}
    </div>
  );
}