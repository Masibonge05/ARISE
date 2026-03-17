export default function SkillTag({ skill, onRemove=null, verified=false, size="md" }) {
  const name = typeof skill === "string" ? skill : skill?.skill_name;
  const isVerified = verified || skill?.verification_source !== "self_claimed";
  const fs = size==="sm"?10:12;
  const pad = size==="sm"?"2px 8px":"4px 12px";
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, background:isVerified?"rgba(255,107,53,0.08)":"rgba(255,255,255,0.05)", border:`1px solid ${isVerified?"rgba(255,107,53,0.2)":"rgba(255,255,255,0.1)"}`, borderRadius:20, padding:pad, fontSize:fs, color:isVerified?"#FF6B35":"#AAA", fontWeight:isVerified?700:400 }}>
      {isVerified && <span style={{ fontSize:fs-1, color:"#FF6B35" }}>⚡</span>}
      {name}
      {onRemove && <button onClick={() => onRemove(name)} style={{ background:"none", border:"none", color:"#888", cursor:"pointer", padding:"0 2px", fontSize:fs+2, lineHeight:1 }}>×</button>}
    </span>
  );
}