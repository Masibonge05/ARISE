import { getInitials } from "../../utils/formatters";

export default function Avatar({ firstName, lastName, photoUrl, size=36, badge=null, style={} }) {
  const initials = getInitials(firstName, lastName);
  const colors = ["#FF6B35","#4ECDC4","#FFD93D","#A8E6CF","#FF69B4","#7B68EE"];
  const colorIdx = (firstName?.charCodeAt(0) || 0) % colors.length;

  return (
    <div style={{ position:"relative", display:"inline-flex", flexShrink:0, ...style }}>
      <div style={{ width:size, height:size, borderRadius:"50%", background:photoUrl?"transparent":`linear-gradient(135deg,${colors[colorIdx]},${colors[colorIdx]}88)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*0.38, fontWeight:800, color:"#fff", overflow:"hidden", flexShrink:0 }}>
        {photoUrl ? <img src={photoUrl} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} /> : initials}
      </div>
      {badge && <div style={{ position:"absolute", bottom:0, right:0, background:badge.bg||"#4ECDC4", border:"2px solid #0A0A0F", borderRadius:"50%", width:size*0.38, height:size*0.38, display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*0.2 }}>{badge.icon}</div>}
    </div>
  );
}