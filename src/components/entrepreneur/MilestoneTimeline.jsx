import { formatDate } from "../../utils/formatters";
export default function MilestoneTimeline({ milestones=[] }) {
  return (
    <div style={{ position:"relative", paddingLeft:24 }}>
      <div style={{ position:"absolute", left:10, top:0, bottom:0, width:2, background:"rgba(255,255,255,0.06)" }} />
      {milestones.map((m,i)=>(
        <div key={i} style={{ position:"relative", marginBottom:16 }}>
          <div style={{ position:"absolute", left:-18, top:4, width:10, height:10, borderRadius:"50%", background:m.completed?"#4ECDC4":"rgba(255,255,255,0.1)", border:`2px solid ${m.completed?"#4ECDC4":"rgba(255,255,255,0.15)"}` }} />
          <div style={{ fontWeight:700, fontSize:13, color:m.completed?"#4ECDC4":"#E8E8F0" }}>{m.title}</div>
          {m.description && <div style={{ fontSize:11, color:"#888", marginTop:2 }}>{m.description}</div>}
          {m.date && <div style={{ fontSize:10, color:"#555", fontFamily:"DM Mono,monospace", marginTop:3 }}>{formatDate(m.date)}</div>}
        </div>
      ))}
    </div>
  );
}