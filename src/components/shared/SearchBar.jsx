import { useState } from "react";

export default function SearchBar({ placeholder="Search…", onSearch, onClear, value, onChange, style={} }) {
  const [focused, setFocused] = useState(false);
  const handleChange = (e) => {
    onChange?.(e.target.value);
    onSearch?.(e.target.value);
  };
  return (
    <div style={{ position:"relative", ...style }}>
      <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:15, color:"#555" }}>🔍</span>
      <input value={value} onChange={handleChange} placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:`1px solid ${focused?"rgba(255,107,53,0.4)":"rgba(255,255,255,0.1)"}`, borderRadius:8, padding:"10px 36px 10px 36px", color:"#E8E8F0", fontFamily:"Sora,sans-serif", fontSize:14, outline:"none", boxSizing:"border-box" }} />
      {value && <button onClick={() => { onChange?.(""); onClear?.(); }}
        style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"#555", cursor:"pointer", fontSize:16, padding:"0 4px" }}>×</button>}
    </div>
  );
}