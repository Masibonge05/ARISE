const BADGES = {
  verified:   { icon:"✓", label:"Verified",    color:"#4ECDC4", bg:"rgba(78,205,196,0.1)"  },
  identity:   { icon:"🪪", label:"ID Verified", color:"#4ECDC4", bg:"rgba(78,205,196,0.1)"  },
  email:      { icon:"✉️", label:"Email",       color:"#4ECDC4", bg:"rgba(78,205,196,0.1)"  },
  education:  { icon:"🎓", label:"Education",   color:"#FFD93D", bg:"rgba(255,215,61,0.1)"  },
  work:       { icon:"💼", label:"Work",        color:"#FF6B35", bg:"rgba(255,107,53,0.1)"  },
  skill:      { icon:"⚡", label:"Assessed",    color:"#FF6B35", bg:"rgba(255,107,53,0.1)"  },
  cipc:       { icon:"🏢", label:"CIPC",        color:"#4ECDC4", bg:"rgba(78,205,196,0.1)"  },
  bbee:       { icon:"🤝", label:"B-BBEE ED",   color:"#A8E6CF", bg:"rgba(168,230,207,0.1)" },
  unverified: { icon:"○",  label:"Unverified",  color:"#555",    bg:"rgba(255,255,255,0.04)" },
};
export default function TrustBadge({ type="verified", size="md" }) {
  const b = BADGES[type] || BADGES.unverified;
  const pad = size==="sm"?"2px 8px":"4px 12px";
  const fs  = size==="sm"?10:12;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, background:b.bg, border:`1px solid ${b.color}40`, borderRadius:20, padding:pad, fontSize:fs, fontWeight:700, color:b.color }}>
      <span style={{ fontSize:fs+1 }}>{b.icon}</span>{b.label}
    </span>
  );
}