import { Link } from "react-router-dom";
import { formatZAR } from "../../utils/formatters";
export default function ProjectCard({ project, matchScore=null }) {
  const catColor = { design:"#4ECDC4", development:"#FF6B35", writing:"#FFD93D", photography:"#A8E6CF" }[project.category] || "#888";
  return (
    <Link to={`/freelance/${project.id}`} style={{ display:"block", textDecoration:"none" }}>
      <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:18, transition:"all 0.2s" }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
          <span style={{ fontSize:9, background:`${catColor}15`, border:`1px solid ${catColor}30`, borderRadius:12, padding:"2px 8px", color:catColor, fontWeight:700, fontFamily:"DM Mono,monospace", textTransform:"uppercase" }}>{project.category}</span>
          {matchScore!=null && <span style={{ fontSize:13, fontWeight:800, color:matchScore>=80?"#4ECDC4":matchScore>=60?"#FFD93D":"#FF6B35" }}>{matchScore}% match</span>}
        </div>
        <div style={{ fontWeight:700, fontSize:14, marginBottom:4, color:"#E8E8F0" }}>{project.title}</div>
        <div style={{ fontSize:12, color:"#888", marginBottom:10, lineHeight:1.5 }}>{project.description?.slice(0,80)}…</div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ fontSize:15, fontWeight:800, color:"#FFD93D" }}>{formatZAR(project.budget_min)} – {formatZAR(project.budget_max)}</div>
          <div style={{ fontSize:11, color:"#666" }}>⏱ {project.deadline_days}d deadline</div>
        </div>
        {project.required_skills?.length > 0 && (
          <div style={{ display:"flex", gap:5, marginTop:8, flexWrap:"wrap" }}>
            {project.required_skills.slice(0,3).map(s => <span key={s} style={{ fontSize:10, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, padding:"2px 6px", color:"#888" }}>{s}</span>)}
          </div>
        )}
      </div>
    </Link>
  );
}