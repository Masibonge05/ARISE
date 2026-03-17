import { Link } from "react-router-dom";
import { timeAgo } from "../../utils/formatters";

const STATUS_COLORS = {
  submitted:            { color:"#888",    label:"Submitted",     icon:"📤" },
  viewed:               { color:"#FFD93D", label:"Viewed",        icon:"👁" },
  shortlisted:          { color:"#4ECDC4", label:"Shortlisted",   icon:"🎯" },
  interview_scheduled:  { color:"#A8E6CF", label:"Interview",     icon:"📅" },
  offered:              { color:"#4ECDC4", label:"Offered! 🎉",   icon:"🎊" },
  rejected:             { color:"#555",    label:"Not Selected",  icon:"❌" },
};

export default function ApplicationCard({ app }) {
  const s = STATUS_COLORS[app.status] || STATUS_COLORS.submitted;
  return (
    <div style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${s.color}20`, borderRadius:12, padding:"14px 18px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
        <div>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:3 }}>{app.job_title || "Job Application"}</div>
          <div style={{ fontSize:12, color:"#888" }}>{app.company_name}</div>
        </div>
        <span style={{ fontSize:9, background:`${s.color}15`, border:`1px solid ${s.color}30`, borderRadius:12, padding:"3px 8px", color:s.color, fontWeight:700, fontFamily:"DM Mono,monospace", flexShrink:0 }}>
          {s.icon} {s.label.toUpperCase()}
        </span>
      </div>
      <div style={{ fontSize:10, color:"#555", marginTop:8, fontFamily:"DM Mono,monospace" }}>Applied {timeAgo(app.applied_at)}</div>
    </div>
  );
}