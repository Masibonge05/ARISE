import { Link } from "react-router-dom";
import { formatZAR, timeAgo } from "../../utils/formatters";

export default function JobCard({ job, matchScore=null, style={} }) {
  const typeColors = { full_time:"#4ECDC4", contract:"#FFD93D", part_time:"#FF6B35", internship:"#A8E6CF" };
  const tc = typeColors[job.job_type] || "#888";
  return (
    <Link to={`/jobs/${job.id}`} style={{ display:"block", textDecoration:"none", ...style }}>
      <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:18, transition:"all 0.2s", cursor:"pointer" }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
          <span style={{ fontSize:9, background:`${tc}15`, border:`1px solid ${tc}30`, borderRadius:12, padding:"2px 8px", color:tc, fontWeight:700, fontFamily:"DM Mono,monospace", textTransform:"uppercase" }}>{job.job_type?.replace("_"," ")}</span>
          {matchScore != null && <span style={{ fontSize:13, fontWeight:800, color:matchScore>=80?"#4ECDC4":matchScore>=60?"#FFD93D":"#FF6B35" }}>{matchScore}% match</span>}
        </div>
        <div style={{ fontWeight:700, fontSize:15, marginBottom:4, color:"#E8E8F0" }}>{job.title}</div>
        <div style={{ fontSize:12, color:"#888", marginBottom:10 }}>{job.employer?.company_name} · {job.city}, {job.province}</div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ fontSize:14, fontWeight:700, color:"#FFD93D" }}>
            {job.salary_min ? `${formatZAR(job.salary_min)}${job.salary_max?` – ${formatZAR(job.salary_max)}`:"+"}` : "Salary TBD"}
          </div>
          <div style={{ display:"flex", gap:8 }}>
            {job.work_style === "remote" && <span style={{ fontSize:10, color:"#4ECDC4" }}>🌐 Remote</span>}
            {job.work_style === "hybrid" && <span style={{ fontSize:10, color:"#FFD93D" }}>🔀 Hybrid</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}