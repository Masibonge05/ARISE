import Avatar from "../shared/Avatar";
import TrustBadge from "./TrustBadge";
import { formatZAR } from "../../utils/formatters";

export default function ProfileCard({ user, compact=false }) {
  if (!user) return null;
  return (
    <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:compact?14:20 }}>
      <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
        <Avatar firstName={user.first_name} lastName={user.last_name} photoUrl={user.profile_photo_url} size={compact?36:48} />
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontWeight:800, fontSize:compact?14:16 }}>{user.first_name} {user.last_name}</div>
          {user.bio && !compact && <div style={{ fontSize:12, color:"#888", marginTop:2, lineHeight:1.5 }}>{user.bio}</div>}
          <div style={{ display:"flex", gap:6, marginTop:6, flexWrap:"wrap" }}>
            {user.is_email_verified && <TrustBadge type="email" size="sm" />}
            {user.is_identity_verified && <TrustBadge type="identity" size="sm" />}
          </div>
        </div>
        {!compact && <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:20, fontWeight:900, color:"#FF6B35" }}>{user.ecs_score||0}</div>
          <div style={{ fontSize:9, color:"#555", fontFamily:"DM Mono,monospace" }}>ECS</div>
        </div>}
      </div>
    </div>
  );
}