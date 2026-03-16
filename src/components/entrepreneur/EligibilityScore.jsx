export default function EligibilityScore({ score=0, reasons=[], disqualifiers=[] }) {
  const color = score>=80?"#4ECDC4":score>=60?"#FFD93D":score>=40?"#FF6B35":"#666";
  return (
    <div>
      <div style={{ textAlign:"center", marginBottom:12 }}>
        <div style={{ fontSize:40, fontWeight:900, color, lineHeight:1 }}>{score}%</div>
        <div style={{ fontSize:10, color, fontFamily:"DM Mono,monospace" }}>ELIGIBILITY SCORE</div>
      </div>
      {reasons.map(r=><div key={r} style={{ fontSize:12, color:"#4ECDC4", marginBottom:4 }}>✓ {r}</div>)}
      {disqualifiers.map(d=><div key={d} style={{ fontSize:12, color:"#FF8888", marginBottom:4 }}>✗ {d}</div>)}
    </div>
  );
}