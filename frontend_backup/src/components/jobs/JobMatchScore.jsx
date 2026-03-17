export default function JobMatchScore({ score=0, size="md", breakdown=null }) {
  const color = score>=80?"#4ECDC4":score>=60?"#FFD93D":score>=40?"#FF6B35":"#666";
  const label = score>=80?"High Match":score>=60?"Good Match":score>=40?"Partial Match":"Low Match";
  const fs = size==="lg"?36:size==="sm"?16:24;
  return (
    <div style={{ textAlign:"center" }}>
      <div style={{ fontSize:fs, fontWeight:900, color, lineHeight:1 }}>{score}%</div>
      <div style={{ fontSize:9, color, fontFamily:"DM Mono,monospace", marginTop:2, fontWeight:700 }}>{label.toUpperCase()}</div>
      {breakdown && Object.entries(breakdown).length > 0 && (
        <div style={{ marginTop:8, textAlign:"left" }}>
          {Object.entries(breakdown).map(([k,v]) => (
            <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"#666", padding:"2px 0" }}>
              <span>{k.replace(/_/g," ")}</span>
              <span style={{ color, fontWeight:700 }}>{v}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}