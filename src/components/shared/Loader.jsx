export default function Loader({ message="Loading...", size="full" }) {
  const isInline = size === "inline";
  const isSm = size === "sm";
  return (
    <div style={{ display:"flex", flexDirection:isInline?"row":"column", alignItems:"center", justifyContent:"center", gap:12, height:isInline||isSm?"auto":"100%", minHeight:isInline||isSm?"auto":"200px", padding:isSm?8:24 }}>
      <div style={{ width:isSm?20:isInline?18:36, height:isSm?20:isInline?18:36, borderRadius:"50%", border:`${isSm?2:3}px solid rgba(255,255,255,0.08)`, borderTopColor:"#FF6B35", animation:"spin 0.8s linear infinite", flexShrink:0 }} />
      {message && !isInline && <div style={{ fontSize:12, color:"#FF6B35", fontFamily:"DM Mono,monospace" }}>{message}</div>}
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}