import { Link } from "react-router-dom";
import { ECS_EVENTS } from "../../utils/ecsCalculator";
export default function ECSRecommendations({ earnedEvents=[], limit=5 }) {
  const available = Object.entries(ECS_EVENTS)
    .filter(([k])=>!earnedEvents.includes(k))
    .sort((a,b)=>b[1].points-a[1].points)
    .slice(0,limit);
  const ACTION_LINKS = {
    email_verified:"settings", id_document_verified:"onboarding/identity",
    profile_photo_added:"profile", skill_assessed:"skills",
    qualification_verified:"profile", business_registered:"launchpad",
    work_experience_added:"profile", mentor_session:"mentors",
  };
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      {available.map(([key,evt])=>(
        <Link key={key} to={`/${ACTION_LINKS[key]||"profile"}`}
          style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 14px", background:"rgba(255,107,53,0.05)", border:"1px solid rgba(255,107,53,0.12)", borderRadius:10, textDecoration:"none" }}>
          <div style={{ fontSize:13, color:"#CCC" }}>{evt.label}</div>
          <span style={{ fontSize:13, fontWeight:800, color:"#FF6B35" }}>+{evt.points}</span>
        </Link>
      ))}
    </div>
  );
}