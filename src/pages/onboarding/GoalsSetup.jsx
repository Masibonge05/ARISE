import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const GOALS_BY_PERSONA = {
  job_seeker:   ["Get hired full-time","Find a part-time job","Start freelancing","Build my portfolio","Improve my skills"],
  freelancer:   ["Land first client","Earn R10k/month","Build verified portfolio","Rate improvement","Go full-time freelance"],
  entrepreneur: ["Register my business","Get first funding","Find a mentor","Land first client","Scale to 10 employees"],
};

export default function GoalsSetup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [saving, setSaving] = useState(false);

  const persona = user?.persona_type || "job_seeker";
  const options = GOALS_BY_PERSONA[persona] || GOALS_BY_PERSONA.job_seeker;

  const toggle = (g) => setGoals(s => s.includes(g) ? s.filter(x=>x!==g) : [...s,g]);

  const handleContinue = async () => {
    setSaving(true);
    try {
      if (goals.length > 0) await api.patch("/users/me", { goals });
    } catch {}
    setSaving(false);
    navigate("/onboarding/complete");
  };

  return (
    <div style={S.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Mono:wght@400&display=swap'); *{box-sizing:border-box} @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={S.inner}>
        <div style={{ textAlign:"center", marginBottom:32, animation:"fadeUp 0.4s ease" }}>
          <div style={{ fontSize:48, marginBottom:14 }}>🎯</div>
          <div style={{ fontSize:11, color:"#FF6B35", fontFamily:"DM Mono,monospace", letterSpacing:3, marginBottom:12 }}>STEP 5 OF 5</div>
          <h1 style={{ fontSize:"clamp(22px,4vw,32px)", fontWeight:800, marginBottom:10 }}>What are your goals?</h1>
          <p style={{ fontSize:14, color:"#888", lineHeight:1.7 }}>ARISE will personalise your experience based on your goals. Select up to 3.</p>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {options.map(goal => {
            const selected = goals.includes(goal);
            return (
              <div key={goal} onClick={()=>toggle(goal)}
                style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 18px", background:selected?"rgba(255,107,53,0.08)":"rgba(255,255,255,0.03)", border:`1px solid ${selected?"rgba(255,107,53,0.35)":"rgba(255,255,255,0.08)"}`, borderRadius:12, cursor:"pointer", transition:"all 0.15s" }}>
                <span style={{ fontSize:14, fontWeight:selected?700:400, color:selected?"#FF6B35":"#AAA" }}>{goal}</span>
                <div style={{ width:20, height:20, borderRadius:"50%", background:selected?"#FF6B35":"transparent", border:`2px solid ${selected?"#FF6B35":"rgba(255,255,255,0.2)"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:"#fff", flexShrink:0 }}>
                  {selected&&"✓"}
                </div>
              </div>
            );
          })}
        </div>

        <button onClick={handleContinue} disabled={saving}
          style={{ width:"100%", background:"#FF6B35", color:"#fff", border:"none", padding:14, borderRadius:8, fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", opacity:saving?0.6:1, marginTop:8 }}>
          {saving ? "Saving…" : goals.length > 0 ? `Finish with ${goals.length} goal${goals.length>1?"s":""} →` : "Skip & Finish →"}
        </button>
      </div>
    </div>
  );
}

const S = {
  page: { fontFamily:"'Sora',sans-serif", background:"#0A0A0F", color:"#E8E8F0", minHeight:"100vh", padding:"40px 24px" },
  inner: { maxWidth:520, margin:"0 auto", display:"flex", flexDirection:"column", gap:14 },
};