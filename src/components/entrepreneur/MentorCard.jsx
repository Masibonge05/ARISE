import { Link } from "react-router-dom";
export default function MentorCard({ mentor, onBook=null }) {
  const stars = Math.round(mentor.average_rating||0);
  return (
    <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:18 }}>
      <div style={{ display:"flex", gap:10, marginBottom:10 }}>
        <div style={{ width:40, height:40, borderRadius:"50%", background:"linear-gradient(135deg,#4ECDC4,#2EA39B)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:800, color:"#fff", flexShrink:0 }}>
          {mentor.mentor_name?.[0]||"M"}
        </div>
        <div>
          <div style={{ fontWeight:700, fontSize:14 }}>{mentor.mentor_name}</div>
          <div style={{ fontSize:11, color:"#888" }}>{mentor.current_title}</div>
          <div style={{ fontSize:11, color:"#FFD93D" }}>{"★".repeat(stars)}{"☆".repeat(5-stars)} {mentor.average_rating?.toFixed(1)}</div>
        </div>
        {mentor.is_bbee_linked && <span style={{ marginLeft:"auto", fontSize:9, background:"rgba(168,230,207,0.1)", border:"1px solid rgba(168,230,207,0.2)", borderRadius:10, padding:"2px 6px", color:"#A8E6CF", fontWeight:700, flexShrink:0 }}>B-BBEE</span>}
      </div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:12 }}>
        {mentor.mentorship_areas?.slice(0,3).map(a=><span key={a} style={{ fontSize:10, background:"rgba(78,205,196,0.08)", border:"1px solid rgba(78,205,196,0.2)", borderRadius:10, padding:"2px 8px", color:"#4ECDC4" }}>{a}</span>)}
      </div>
      <div style={{ display:"flex", gap:8 }}>
        <Link to={`/mentors/${mentor.id}`} style={{ flex:1, textAlign:"center", background:"rgba(78,205,196,0.1)", border:"1px solid rgba(78,205,196,0.25)", color:"#4ECDC4", borderRadius:8, padding:"8px", fontSize:12, fontWeight:700, textDecoration:"none" }}>View Profile</Link>
        {onBook && <button onClick={()=>onBook(mentor)} style={{ flex:1, background:"#4ECDC4", color:"#0A0A0F", border:"none", borderRadius:8, padding:"8px", fontSize:12, fontWeight:800, cursor:"pointer" }}>Book Session</button>}
      </div>
    </div>
  );
}