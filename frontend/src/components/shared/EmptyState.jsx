export default function EmptyState({ icon="📭", title="Nothing here yet", desc="", action=null, style={} }) {
  return (
    <div style={{ textAlign:"center", padding:"60px 24px", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:14, color:"#666", ...style }}>
      <div style={{ fontSize:48, marginBottom:14 }}>{icon}</div>
      <div style={{ fontSize:16, fontWeight:700, color:"#888", marginBottom:6 }}>{title}</div>
      {desc && <div style={{ fontSize:13, marginBottom:20, lineHeight:1.6, maxWidth:320, margin:"0 auto 20px" }}>{desc}</div>}
      {action && <div style={{ marginTop:16 }}>{action}</div>}
    </div>
  );
}