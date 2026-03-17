export default function SessionNote({ note, expanded=false, onToggle=null }) {
  if (!note) return null;
  return (
    <div style={{ background:"rgba(78,205,196,0.04)", border:"1px solid rgba(78,205,196,0.15)", borderRadius:10, padding:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
        <div style={{ fontSize:10, color:"#4ECDC4", fontFamily:"DM Mono,monospace", fontWeight:700 }}>AI NOTES · HUAWEI NLP</div>
        {onToggle && <button onClick={onToggle} style={{ background:"none", border:"none", color:"#4ECDC4", cursor:"pointer", fontSize:11, fontWeight:700 }}>{expanded?"Hide":"Show"}</button>}
      </div>
      {(!onToggle||expanded) && (
        <>
          <div style={{ fontSize:13, color:"#AAA", lineHeight:1.6, marginBottom:note.action_items?.length?12:0 }}>{note.summary}</div>
          {note.action_items?.length > 0 && (
            <>
              <div style={{ fontSize:10, color:"#555", fontFamily:"DM Mono,monospace", marginBottom:6 }}>ACTION ITEMS</div>
              {note.action_items.map((a,i)=><div key={i} style={{ fontSize:12, color:"#CCC", marginBottom:4 }}>→ {a}</div>)}
            </>
          )}
        </>
      )}
    </div>
  );
}