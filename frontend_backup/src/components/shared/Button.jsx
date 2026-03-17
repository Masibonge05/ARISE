import { Spinner } from "../ui/index";

export default function Button({ children, variant="primary", size="md", loading=false, disabled=false, onClick, type="button", fullWidth=false, icon=null, style={} }) {
  const variants = {
    primary: { background:"#FF6B35", color:"#fff", border:"none" },
    teal:    { background:"#4ECDC4", color:"#0A0A0F", border:"none" },
    yellow:  { background:"#FFD93D", color:"#0A0A0F", border:"none" },
    ghost:   { background:"transparent", color:"#888", border:"1px solid rgba(255,255,255,0.12)" },
    danger:  { background:"rgba(255,68,68,0.12)", color:"#FF6666", border:"1px solid rgba(255,68,68,0.25)" },
    link:    { background:"transparent", color:"#FF6B35", border:"none", padding:0 },
  };
  const sizes = {
    sm: { padding:"7px 14px", fontSize:12, borderRadius:7 },
    md: { padding:"11px 22px", fontSize:14, borderRadius:8 },
    lg: { padding:"14px 28px", fontSize:16, borderRadius:10 },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading}
      style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", gap:8, fontFamily:"Sora,sans-serif", fontWeight:700, cursor:(disabled||loading)?"not-allowed":"pointer", opacity:(disabled||loading)?0.55:1, transition:"all 0.2s", width:fullWidth?"100%":"auto", ...variants[variant], ...sizes[size], ...style }}>
      {loading ? <Spinner size={size==="sm"?14:size==="lg"?20:16} color={variants[variant].color} /> : icon}
      {children}
    </button>
  );
}