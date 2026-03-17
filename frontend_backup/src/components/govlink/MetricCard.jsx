export default function MetricCard({ label, value, icon, color="#E8E8F0", trend=null, style={} }) {
  return (
    <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:"18px 20px", ...style }}>
      <div style={{ fontSize:22, marginBottom:8 }}>{icon}</div>
      <div style={{ fontSize:26, fontWeight:900, color, lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:10, color:"#555", fontFamily:"DM Mono,monospace", marginTop:4 }}>{label.toUpperCase()}</div>
      {trend != null && <div style={{ fontSize:11, color:trend>0?"#4ECDC4":trend<0?"#FF6666":"#888", marginTop:4, fontWeight:700 }}>{trend>0?"↑":trend<0?"↓":"—"} {Math.abs(trend)}% vs last month</div>}
    </div>
  );
}