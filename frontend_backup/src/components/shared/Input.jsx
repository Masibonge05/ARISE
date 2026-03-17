export default function Input({ label, error, hint, icon, type="text", placeholder, value, onChange, disabled=false, required=false, style={}, ...props }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6, ...style }}>
      {label && <label style={{ fontSize:12, fontWeight:600, color:"#AAA", fontFamily:"Sora,sans-serif" }}>{label}{required && <span style={{ color:"#FF6B35", marginLeft:3 }}>*</span>}</label>}
      <div style={{ position:"relative" }}>
        {icon && <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:15 }}>{icon}</span>}
        <input type={type} placeholder={placeholder} value={value} onChange={onChange} disabled={disabled} required={required}
          style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:`1px solid ${error?"rgba(255,68,68,0.5)":"rgba(255,255,255,0.1)"}`, borderRadius:8, padding:icon?"11px 14px 11px 38px":"11px 14px", color:"#E8E8F0", fontFamily:"Sora,sans-serif", fontSize:14, outline:"none", opacity:disabled?0.5:1, boxSizing:"border-box" }}
          {...props} />
      </div>
      {error && <div style={{ fontSize:11, color:"#FF6666" }}>⚠ {error}</div>}
      {hint && !error && <div style={{ fontSize:11, color:"#555" }}>{hint}</div>}
    </div>
  );
}