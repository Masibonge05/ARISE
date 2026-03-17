export default function FilterPanel({ filters=[], activeFilters={}, onChange, style={} }) {
  return (
    <div style={{ display:"flex", flexWrap:"wrap", gap:8, ...style }}>
      {filters.map(filter => (
        <div key={filter.key} style={{ display:"flex", flexDirection:"column", gap:4 }}>
          {filter.label && <div style={{ fontSize:10, color:"#555", fontFamily:"DM Mono,monospace", fontWeight:700 }}>{filter.label.toUpperCase()}</div>}
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {filter.options.map(opt => {
              const active = activeFilters[filter.key] === opt.value;
              return (
                <button key={opt.value} onClick={() => onChange(filter.key, active ? null : opt.value)}
                  style={{ background:active?"rgba(255,107,53,0.15)":"rgba(255,255,255,0.04)", border:`1px solid ${active?"rgba(255,107,53,0.35)":"rgba(255,255,255,0.08)"}`, color:active?"#FF6B35":"#888", borderRadius:20, padding:"6px 12px", fontSize:11, fontWeight:active?700:400, cursor:"pointer", fontFamily:"Sora,sans-serif" }}>
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}