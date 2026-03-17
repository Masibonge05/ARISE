import { useState } from "react";
import { formatZAR } from "../../utils/formatters";
export default function ProposalForm({ project, onSubmit, loading=false }) {
  const [form, setForm] = useState({ cover_message:"", proposed_rate:"", estimated_days:7 });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const mid = project?.budget_min && project?.budget_max ? Math.round((project.budget_min+project.budget_max)/2) : null;
  const valid = form.cover_message.trim() && form.proposed_rate;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div>
        <label style={{ fontSize:12, color:"#AAA", display:"block", marginBottom:6 }}>Your rate (ZAR) *</label>
        <div style={{ display:"flex", gap:8 }}>
          <input type="number" value={form.proposed_rate} onChange={e=>set("proposed_rate",e.target.value)}
            placeholder={mid?.toString()||"5000"}
            style={{ flex:1, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"11px 14px", color:"#E8E8F0", fontFamily:"Sora,sans-serif", fontSize:14, outline:"none" }} />
          {mid && <button onClick={()=>set("proposed_rate",String(mid))} style={{ background:"rgba(255,215,61,0.1)", border:"1px solid rgba(255,215,61,0.25)", color:"#FFD93D", borderRadius:8, padding:"8px 12px", fontSize:11, cursor:"pointer", whiteSpace:"nowrap" }}>Midpoint {formatZAR(mid)}</button>}
        </div>
      </div>
      <div>
        <label style={{ fontSize:12, color:"#AAA", display:"block", marginBottom:6 }}>Delivery (days)</label>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {[3,5,7,10,14,21].map(d => (
            <button key={d} onClick={()=>set("estimated_days",d)} style={{ background:form.estimated_days===d?"rgba(78,205,196,0.15)":"rgba(255,255,255,0.04)", border:`1px solid ${form.estimated_days===d?"rgba(78,205,196,0.4)":"rgba(255,255,255,0.08)"}`, color:form.estimated_days===d?"#4ECDC4":"#888", borderRadius:8, padding:"7px 14px", fontSize:12, fontWeight:form.estimated_days===d?700:400, cursor:"pointer" }}>{d}d</button>
          ))}
        </div>
      </div>
      <div>
        <label style={{ fontSize:12, color:"#AAA", display:"block", marginBottom:6 }}>Cover message *</label>
        <textarea value={form.cover_message} onChange={e=>set("cover_message",e.target.value)} rows={4}
          placeholder="Why are you the right person for this project?"
          style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"11px 14px", color:"#E8E8F0", fontFamily:"Sora,sans-serif", fontSize:13, resize:"vertical", outline:"none", boxSizing:"border-box" }} />
      </div>
      <button onClick={()=>valid&&!loading&&onSubmit(form)} disabled={!valid||loading}
        style={{ background:"#4ECDC4", color:"#0A0A0F", border:"none", padding:"13px", borderRadius:8, fontWeight:800, fontSize:14, cursor:!valid||loading?"not-allowed":"pointer", opacity:!valid||loading?0.5:1 }}>
        {loading?"Submitting…":"Submit Proposal →"}
      </button>
    </div>
  );
}