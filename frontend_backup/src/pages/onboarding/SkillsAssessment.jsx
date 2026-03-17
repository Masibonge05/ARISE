import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const STEPS = ["persona","identity","qualifications","skills","goals","complete"];

const SKILLS_BY_CATEGORY = {
  Technical:  ["Python","JavaScript","React","Node.js","SQL","Arduino","Electronics","Flutter","Data Analysis","Machine Learning"],
  Design:     ["Figma","Adobe XD","Photoshop","Illustrator","UI Design","Graphic Design","Video Editing","Photography"],
  Soft:       ["Leadership","Communication","Problem Solving","Teamwork","Time Management","Critical Thinking"],
  Language:   ["English","isiZulu","Afrikaans","Sesotho","Xhosa","Sepedi","Setswana","Tshivenda"],
  Business:   ["Financial Planning","Marketing","Sales","Project Management","Customer Service","Pitching"],
  Tools:      ["Microsoft Office","Google Workspace","Git","Docker","AutoCAD","MATLAB"],
};

export default function SkillsAssessment() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Technical");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const toggle = (name) => setSelected(s => s.includes(name) ? s.filter(x => x !== name) : [...s, name]);

  const allSkillsFiltered = search
    ? Object.values(SKILLS_BY_CATEGORY).flat().filter(s => s.toLowerCase().includes(search.toLowerCase()))
    : SKILLS_BY_CATEGORY[activeCategory] || [];

  const handleContinue = async () => {
    setSaving(true);
    try {
      await Promise.all(selected.map(name => {
        const category = Object.entries(SKILLS_BY_CATEGORY).find(([, skills]) => skills.includes(name))?.[0] || "Other";
        return api.post("/users/me/skills", { skill_name:name, category, level:"intermediate" });
      }));
    } catch {}
    setSaving(false);
    navigate("/onboarding/goals");
  };

  return (
    <div style={S.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap'); *{box-sizing:border-box} @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Progress */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", marginBottom:48 }}>
        {STEPS.map((s,i) => (
          <div key={s} style={{ display:"flex", alignItems:"center" }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:i<=3?"#FF6B35":"rgba(255,255,255,0.1)", transition:"background 0.3s" }} />
            {i < STEPS.length-1 && <div style={{ width:28, height:1, background:i<3?"#FF6B35":"rgba(255,255,255,0.08)" }} />}
          </div>
        ))}
      </div>

      <div style={S.inner}>
        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:32, animation:"fadeUp 0.4s ease forwards" }}>
          <div style={{ fontSize:48, marginBottom:14 }}>⚡</div>
          <div style={{ fontSize:11, color:"#FF6B35", fontFamily:"DM Mono,monospace", letterSpacing:3, marginBottom:12 }}>STEP 4 OF 5</div>
          <h1 style={{ fontSize:"clamp(22px,4vw,32px)", fontWeight:800, marginBottom:10 }}>What are your skills?</h1>
          <p style={{ fontSize:14, color:"#888", lineHeight:1.7 }}>Select all that apply. You can verify and add more later from the Skills Centre.</p>
        </div>

        {/* Selected count */}
        {selected.length > 0 && (
          <div style={{ background:"rgba(255,107,53,0.08)", border:"1px solid rgba(255,107,53,0.2)", borderRadius:10, padding:"10px 16px", textAlign:"center", animation:"fadeUp 0.3s ease" }}>
            <span style={{ fontSize:14, fontWeight:700, color:"#FF6B35" }}>✓ {selected.length} skill{selected.length > 1 ? "s" : ""} selected</span>
            <span style={{ fontSize:12, color:"#888", marginLeft:10 }}>— each adds to your TrustID</span>
          </div>
        )}

        {/* Search */}
        <div style={{ position:"relative" }}>
          <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"#555", fontSize:15 }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search all skills…"
            style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"11px 14px 11px 40px", color:"#E8E8F0", fontFamily:"Sora,sans-serif", fontSize:14, outline:"none" }}
          />
        </div>

        {/* Category tabs */}
        {!search && (
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {Object.keys(SKILLS_BY_CATEGORY).map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                style={{ background:activeCategory===cat?"rgba(255,107,53,0.15)":"rgba(255,255,255,0.04)", border:`1px solid ${activeCategory===cat?"rgba(255,107,53,0.35)":"rgba(255,255,255,0.08)"}`, color:activeCategory===cat?"#FF6B35":"#888", borderRadius:20, padding:"7px 16px", fontSize:12, fontWeight:activeCategory===cat?700:400, cursor:"pointer", fontFamily:"Sora,sans-serif" }}>
                {cat} <span style={{ fontSize:10, opacity:0.7 }}>({SKILLS_BY_CATEGORY[cat].filter(s => selected.includes(s)).length || ""})</span>
              </button>
            ))}
          </div>
        )}

        {/* Skills grid */}
        <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
          {allSkillsFiltered.map(skill => {
            const isSelected = selected.includes(skill);
            return (
              <div key={skill} onClick={() => toggle(skill)}
                style={{ padding:"9px 18px", borderRadius:20, border:`1px solid ${isSelected?"rgba(255,107,53,0.5)":"rgba(255,255,255,0.1)"}`, background:isSelected?"rgba(255,107,53,0.1)":"rgba(255,255,255,0.03)", cursor:"pointer", fontSize:13, fontWeight:isSelected?700:400, color:isSelected?"#FF6B35":"#AAA", transition:"all 0.15s", userSelect:"none" }}>
                {isSelected ? "✓ " : ""}{skill}
              </div>
            );
          })}
          {allSkillsFiltered.length === 0 && (
            <div style={{ width:"100%", textAlign:"center", padding:32, color:"#555", fontSize:13 }}>No skills match "{search}"</div>
          )}
        </div>

        {/* Selected chips */}
        {selected.length > 0 && (
          <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:10, padding:16 }}>
            <div style={{ fontSize:11, color:"#555", fontFamily:"DM Mono,monospace", marginBottom:10 }}>SELECTED ({selected.length})</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {selected.map(s => (
                <span key={s} onClick={() => toggle(s)} style={{ background:"rgba(255,107,53,0.12)", border:"1px solid rgba(255,107,53,0.25)", borderRadius:20, padding:"4px 12px", fontSize:12, color:"#FF6B35", cursor:"pointer", display:"flex", gap:6, alignItems:"center" }}>
                  {s} <span style={{ opacity:0.6 }}>×</span>
                </span>
              ))}
            </div>
          </div>
        )}

        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <button onClick={handleContinue} disabled={saving}
            style={{ width:"100%", background:"#FF6B35", color:"#fff", border:"none", padding:14, borderRadius:8, fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", opacity:saving?0.6:1 }}>
            {saving ? "Saving skills…" : selected.length > 0 ? `Continue with ${selected.length} skill${selected.length>1?"s":""} →` : "Skip for now →"}
          </button>
          <button onClick={() => navigate("/onboarding/goals")} style={{ background:"none", border:"none", color:"#666", fontSize:13, cursor:"pointer", fontFamily:"Sora,sans-serif" }}>
            Skip this step
          </button>
        </div>
      </div>
    </div>
  );
}

const S = {
  page: { fontFamily:"'Sora',sans-serif", background:"#0A0A0F", color:"#E8E8F0", minHeight:"100vh", padding:"40px 24px" },
  inner: { maxWidth:580, margin:"0 auto", display:"flex", flexDirection:"column", gap:16 },
};