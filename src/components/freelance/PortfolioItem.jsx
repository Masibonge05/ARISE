export default function PortfolioItem({ item, selected=false, onToggle=null, compact=false }) {
  const cats = { design:"🎨", development:"💻", photography:"📸", writing:"✍️", branding:"⭐", video:"🎬" };
  return (
    <div onClick={()=>onToggle?.(item.id)}
      style={{ background:selected?"rgba(78,205,196,0.06)":"rgba(255,255,255,0.02)", border:`1px solid ${selected?"rgba(78,205,196,0.4)":"rgba(255,255,255,0.07)"}`, borderRadius:10, padding:compact?"10px 12px":"14px 16px", cursor:onToggle?"pointer":"default", transition:"all 0.15s", display:"flex", gap:10, alignItems:"center" }}>
      <div style={{ fontSize:compact?18:22 }}>{cats[item.category]||"📁"}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontWeight:700, fontSize:compact?12:14, color:"#E8E8F0", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.title}</div>
        {!compact && item.client_name && <div style={{ fontSize:11, color:"#666" }}>Client: {item.client_name}</div>}
      </div>
      {item.is_client_verified && <span style={{ fontSize:9, background:"rgba(78,205,196,0.1)", border:"1px solid rgba(78,205,196,0.2)", borderRadius:10, padding:"2px 6px", color:"#4ECDC4", fontWeight:700 }}>✓ Verified</span>}
      {selected && <span style={{ color:"#4ECDC4", fontSize:16 }}>✓</span>}
    </div>
  );
}