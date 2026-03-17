export default function ProgressBar({ value=0, max=100, color="#FF6B35", height=6, showLabel=false, label=null, style={} }) {
  const pct = Math.min(100, Math.max(0, (value/max)*100));
  const barColor = color === "auto"
    ? (pct >= 80 ? "#4ECDC4" : pct >= 60 ? "#FFD93D" : pct >= 40 ? "#FF6B35" : "#666")
    : color;
  return (
    <div style={{ width:"100%", ...style }}>
      {(showLabel || label) && (
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
          {label && <span style={{ fontSize:11, color:"#888" }}>{label}</span>}
          {showLabel && <span style={{ fontSize:11, fontWeight:700, color:barColor, fontFamily:"DM Mono,monospace" }}>{Math.round(pct)}%</span>}
        </div>
      )}
      <div style={{ height, background:"rgba(255,255,255,0.06)", borderRadius:height/2, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${pct}%`, background:barColor, borderRadius:height/2, transition:"width 0.8s ease" }} />
      </div>
    </div>
  );
}