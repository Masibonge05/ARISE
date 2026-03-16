import { useState } from "react";
import { useToast } from "../../hooks/useToast";
import api from "../../services/api";

const FLAG_REASONS = [
  { value:"scam",            label:"Suspected scam" },
  { value:"trafficking",     label:"Possible trafficking" },
  { value:"fake_company",    label:"Fake company" },
  { value:"misleading",      label:"Misleading info" },
  { value:"inappropriate",   label:"Inappropriate content" },
];

export default function SafetyFlag({ targetId, targetType="job", compact=false }) {
  const toast = useToast();
  const [open, setOpen]     = useState(false);
  const [reason, setReason] = useState("");
  const [desc, setDesc]     = useState("");
  const [sending, setSending] = useState(false);

  const submit = async () => {
    if (!reason) return;
    setSending(true);
    try {
      await api.post("/safety/report", { target_type:targetType, target_id:targetId, reason, description:desc, is_anonymous:true });
      toast.success("Report submitted. Thank you for keeping ARISE safe.");
      setOpen(false); setReason(""); setDesc("");
    } catch { toast.error("Could not submit report."); }
    finally { setSending(false); }
  };

  return (
    <>
      <button onClick={() => setOpen(!open)} title="Report this listing"
        style={{ background:"rgba(255,68,68,0.08)", border:"1px solid rgba(255,68,68,0.2)", color:"#FF8888", borderRadius:8, padding:compact?"6px 10px":"7px 14px", fontSize:compact?10:11, cursor:"pointer", fontFamily:"Sora,sans-serif", display:"flex", alignItems:"center", gap:4 }}>
        🚩{!compact && " Report"}
      </button>
      {open && (
        <div style={{ marginTop:8, background:"rgba(255,68,68,0.06)", border:"1px solid rgba(255,68,68,0.2)", borderRadius:10, padding:14 }}>
          <div style={{ fontSize:11, color:"#FF8888", fontWeight:700, marginBottom:8 }}>Report this {targetType}</div>
          <select value={reason} onChange={e => setReason(e.target.value)} style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:6, padding:"8px 10px", color:reason?"#E8E8F0":"#555", fontSize:12, marginBottom:8, outline:"none" }}>
            <option value="">Select reason…</option>
            {FLAG_REASONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Additional details (optional)" rows={2} style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:6, padding:"8px 10px", color:"#E8E8F0", fontSize:12, resize:"none", outline:"none", fontFamily:"Sora,sans-serif", boxSizing:"border-box" }} />
          <div style={{ display:"flex", gap:8, marginTop:8 }}>
            <button onClick={() => setOpen(false)} style={{ flex:1, background:"transparent", border:"1px solid rgba(255,255,255,0.1)", color:"#888", borderRadius:6, padding:"8px", fontSize:11, cursor:"pointer" }}>Cancel</button>
            <button onClick={submit} disabled={!reason||sending} style={{ flex:2, background:"rgba(255,68,68,0.2)", border:"1px solid rgba(255,68,68,0.3)", color:"#FF8888", borderRadius:6, padding:"8px", fontSize:11, fontWeight:700, cursor:"pointer", opacity:!reason||sending?0.5:1 }}>{sending?"Submitting…":"Submit Report"}</button>
          </div>
        </div>
      )}
    </>
  );
}