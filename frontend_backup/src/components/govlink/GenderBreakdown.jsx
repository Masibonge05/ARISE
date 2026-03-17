export default function GenderBreakdown({ female=0, male=0, unspecified=0 }) {
  const total = female+male+unspecified;
  const bars = [
    { label:"Female",      value:female,      color:"#FF6B35" },
    { label:"Male",        value:male,        color:"#4ECDC4" },
    { label:"Unspecified", value:unspecified, color:"#555" },
  ];
  return (
    <div>
      {bars.map(b => (
        <div key={b.label} style={{ marginBottom:10 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
            <span style={{ fontSize:12, color:"#888" }}>{b.label}</span>
            <span style={{ fontSize:12, fontWeight:700, color:b.color }}>{b.value?.toLocaleString()} ({total?Math.round(b.value/total*100):0}%)</span>
          </div>
          <div style={{ height:4, background:"rgba(255,255,255,0.05)", borderRadius:2 }}>
            <div style={{ height:"100%", width:total?`${(b.value/total)*100}%`:"0%", background:b.color, borderRadius:2, transition:"width 0.8s ease" }} />
          </div>
        </div>
      ))}
    </div>
  );
}