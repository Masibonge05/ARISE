import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { useToast } from "../../hooks/useToast";

const SKILL_CATEGORIES = ["Technical","Soft","Language","Tool","Industry"];
const PREDEFINED_SKILLS = {
  Technical: ["Python","JavaScript","React","Node.js","SQL","Machine Learning","Data Analysis","Arduino","Electronics","Networking"],
  Soft: ["Leadership","Communication","Problem Solving","Teamwork","Time Management","Critical Thinking","Adaptability"],
  Language: ["English","isiZulu","Afrikaans","Sesotho","Xhosa","Sepedi","Setswana","Tshivenda"],
  Tool: ["Figma","Adobe XD","Microsoft Office","AutoCAD","MATLAB","Git","Docker","AWS"],
  Industry: ["Financial Services","Healthcare","Agriculture","Mining","Retail","Manufacturing","Tourism"],
};

function SkillBadge({ skill, onRemove }) {
  const srcColors = { self_claimed: "#666", platform_assessed: "#FFD93D", education_verified: "#4ECDC4", work_verified: "#FF6B35", accredited: "#A8E6CF" };
  const srcLabels = { self_claimed: "○ Claimed", platform_assessed: "⚡ Assessed", education_verified: "🎓 Education", work_verified: "💼 Work", accredited: "✓ Accredited" };
  const color = srcColors[skill.verification_source] || "#666";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.03)", border: `1px solid ${color}25`, borderRadius: 10, padding: "10px 14px" }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>{skill.skill_name}</div>
        <div style={{ fontSize: 11, color, fontFamily: "DM Mono, monospace", marginTop: 2 }}>{srcLabels[skill.verification_source] || "○ Claimed"}</div>
      </div>
      {skill.verification_source === "self_claimed" && (
        <button style={{ background: `${color}15`, border: `1px solid ${color}30`, color, borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer", fontFamily: "Sora, sans-serif", fontWeight: 700 }}>Assess →</button>
      )}
      {onRemove && (
        <button onClick={() => onRemove(skill.id)} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 16, padding: "0 4px" }}>×</button>
      )}
    </div>
  );
}

function AssessmentModal({ skill, onClose, onComplete }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const questions = [
    { q: `How many years of experience do you have with ${skill}?`, options: ["Less than 1 year", "1–2 years", "3–5 years", "5+ years"] },
    { q: `How would you rate your ${skill} proficiency?`, options: ["Beginner — I know the basics", "Intermediate — I use it regularly", "Advanced — I can mentor others", "Expert — Industry-level"] },
    { q: `Have you used ${skill} in a professional or academic project?`, options: ["No, only self-study", "Yes, in a personal project", "Yes, in academic work", "Yes, in paid professional work"] },
  ];

  const submitAssessment = async () => {
    const score = Object.values(answers).reduce((s, v) => s + v, 0);
    const maxScore = questions.length * 3;
    const pct = Math.round((score / maxScore) * 100);
    const passed = pct >= 50;
    setResult({ score: pct, passed });
    if (passed) {
      try {
        await api.post("/trustid/skills/assess", { skill_name: skill, score: pct });
      } catch {}
      onComplete && onComplete(pct);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {!result ? (
          <>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: "#FF6B35", fontFamily: "DM Mono, monospace", marginBottom: 4 }}>SKILL ASSESSMENT · {step + 1}/{questions.length}</div>
              <h3 style={{ fontWeight: 800, fontSize: 18 }}>{skill}</h3>
              <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, marginTop: 12 }}>
                <div style={{ height: "100%", width: `${((step + 1) / questions.length) * 100}%`, background: "#FF6B35", borderRadius: 2, transition: "width 0.3s" }} />
              </div>
            </div>
            <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>{questions[step].q}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {questions[step].options.map((opt, i) => (
                <div key={opt} onClick={() => { setAnswers({ ...answers, [step]: i }); }} style={{ padding: "12px 16px", borderRadius: 8, border: `1px solid ${answers[step] === i ? "rgba(255,107,53,0.5)" : "rgba(255,255,255,0.08)"}`, background: answers[step] === i ? "rgba(255,107,53,0.08)" : "rgba(255,255,255,0.02)", cursor: "pointer", fontSize: 13, color: answers[step] === i ? "#FF6B35" : "#AAA", transition: "all 0.15s" }}>
                  {opt}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              {step < questions.length - 1 ? (
                <button onClick={() => answers[step] !== undefined && setStep(step + 1)} disabled={answers[step] === undefined} style={{ flex: 1, background: "#FF6B35", color: "#fff", border: "none", padding: 13, borderRadius: 8, fontWeight: 800, cursor: "pointer", fontFamily: "Sora, sans-serif", opacity: answers[step] === undefined ? 0.5 : 1 }}>Next →</button>
              ) : (
                <button onClick={submitAssessment} disabled={answers[step] === undefined} style={{ flex: 1, background: "#FF6B35", color: "#fff", border: "none", padding: 13, borderRadius: 8, fontWeight: 800, cursor: "pointer", fontFamily: "Sora, sans-serif", opacity: answers[step] === undefined ? 0.5 : 1 }}>Submit Assessment →</button>
              )}
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>{result.passed ? "⚡" : "📚"}</div>
            <h3 style={{ fontWeight: 800, fontSize: 20, marginBottom: 8, color: result.passed ? "#4ECDC4" : "#FFD93D" }}>{result.passed ? "Assessment Passed!" : "Keep Practising"}</h3>
            <div style={{ fontSize: 32, fontWeight: 900, color: result.passed ? "#4ECDC4" : "#FFD93D", marginBottom: 8 }}>{result.score}%</div>
            <p style={{ fontSize: 13, color: "#888", marginBottom: 20 }}>{result.passed ? `Your ${skill} skill is now Platform Assessed on your TrustID. +15 ECS points awarded.` : `Complete a course to build your ${skill} skills and try the assessment again.`}</p>
            <button onClick={onClose} style={{ background: result.passed ? "#4ECDC4" : "#FF6B35", color: result.passed ? "#0A0A0F" : "#fff", border: "none", padding: "12px 32px", borderRadius: 8, fontWeight: 800, cursor: "pointer", fontFamily: "Sora, sans-serif", fontSize: 14 }}>
              {result.passed ? "View Updated Profile →" : "Find a Course →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SkillsCentre() {
  const { user } = useAuth();
  const toast = useToast();
  const [skills, setSkills] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Technical");
  const [newSkill, setNewSkill] = useState("");
  const [assessing, setAssessing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/users/me");
        setSkills(res.data.skills || []);
      } catch { setSkills(MOCK_SKILLS); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const addSkill = async (skillName, category) => {
    if (!skillName) return;
    try {
      const res = await api.post("/users/me/skills", { skill_name: skillName, category, level: "intermediate" });
      setSkills((s) => [...s, { id: res.data.skill_id || Date.now().toString(), skill_name: skillName, category, verification_source: "self_claimed" }]);
      setNewSkill("");
      toast.ecs(15, `${skillName} added to your TrustID!`);
    } catch {}
  };

  const removeSkill = async (skillId) => {
    try {
      await api.delete(`/users/me/skills/${skillId}`);
      setSkills((s) => s.filter((sk) => sk.id !== skillId));
    } catch { setSkills((s) => s.filter((sk) => sk.id !== skillId)); }
  };

  const categorySkills = skills.filter((s) => s.category === activeCategory || (!SKILL_CATEGORIES.includes(s.category) && activeCategory === "Technical"));
  const verifiedCount = skills.filter((s) => s.verification_source !== "self_claimed").length;

  return (
    <div style={styles.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap'); * { box-sizing:border-box; } @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>
      <div style={styles.inner}>
        <div style={{ animation: "fadeUp 0.4s ease forwards" }}>
          <h1 style={styles.title}>Skills Centre</h1>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 8 }}>
            <span style={{ fontSize: 13, color: "#888" }}>Total skills: <strong style={{ color: "#E8E8F0" }}>{skills.length}</strong></span>
            <span style={{ fontSize: 13, color: "#888" }}>Verified: <strong style={{ color: "#4ECDC4" }}>{verifiedCount}</strong></span>
            <span style={{ fontSize: 13, color: "#888" }}>Self-claimed: <strong style={{ color: "#666" }}>{skills.length - verifiedCount}</strong></span>
          </div>
        </div>

        {/* Verification guide */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, animation: "fadeUp 0.4s 0.1s ease both" }}>
          {[
            { label: "Self-Claimed", icon: "○", color: "#666", desc: "You added it, not yet verified" },
            { label: "Platform Assessed", icon: "⚡", color: "#FFD93D", desc: "Passed ARISE assessment" },
            { label: "Education Verified", icon: "🎓", color: "#4ECDC4", desc: "From verified qualification" },
            { label: "Work Verified", icon: "💼", color: "#FF6B35", desc: "Confirmed by employer" },
          ].map((v) => (
            <div key={v.label} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${v.color}20`, borderRadius: 8, padding: "10px 14px", display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 16, color: v.color }}>{v.icon}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: v.color }}>{v.label}</div>
                <div style={{ fontSize: 11, color: "#555" }}>{v.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Category tabs */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", animation: "fadeUp 0.4s 0.15s ease both" }}>
          {SKILL_CATEGORIES.map((c) => {
            const count = skills.filter((s) => s.category === c).length;
            return (
              <button key={c} onClick={() => setActiveCategory(c)} style={{ background: activeCategory === c ? "rgba(255,107,53,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${activeCategory === c ? "rgba(255,107,53,0.35)" : "rgba(255,255,255,0.08)"}`, color: activeCategory === c ? "#FF6B35" : "#888", borderRadius: 20, padding: "7px 16px", cursor: "pointer", fontSize: 13, fontWeight: activeCategory === c ? 700 : 500, fontFamily: "Sora, sans-serif", transition: "all 0.2s" }}>
                {c} {count > 0 && <span style={{ fontSize: 10, marginLeft: 4 }}>({count})</span>}
              </button>
            );
          })}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* My skills */}
          <div style={styles.card}>
            <div style={styles.cardTitle}>MY {activeCategory.toUpperCase()} SKILLS</div>
            {categorySkills.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {categorySkills.map((s) => <SkillBadge key={s.id} skill={s} onRemove={removeSkill} />)}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: 32, color: "#555" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>+</div>
                <div style={{ fontSize: 13 }}>No {activeCategory.toLowerCase()} skills added yet</div>
              </div>
            )}

            {/* Add skill input */}
            <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
              <input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addSkill(newSkill, activeCategory)} placeholder={`Add a ${activeCategory.toLowerCase()} skill...`} style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 14px", color: "#E8E8F0", fontFamily: "Sora, sans-serif", fontSize: 13, outline: "none" }} />
              <button onClick={() => addSkill(newSkill, activeCategory)} disabled={!newSkill.trim()} style={{ background: "#FF6B35", color: "#fff", border: "none", borderRadius: 8, padding: "10px 16px", cursor: "pointer", fontWeight: 700, fontFamily: "Sora, sans-serif", opacity: !newSkill.trim() ? 0.5 : 1 }}>Add</button>
            </div>
          </div>

          {/* Quick add from predefined */}
          <div style={styles.card}>
            <div style={styles.cardTitle}>QUICK ADD — {activeCategory.toUpperCase()}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {(PREDEFINED_SKILLS[activeCategory] || []).filter((s) => !skills.find((sk) => sk.skill_name.toLowerCase() === s.toLowerCase())).map((s) => (
                <button key={s} onClick={() => addSkill(s, activeCategory)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#AAA", borderRadius: 20, padding: "5px 12px", cursor: "pointer", fontSize: 12, fontFamily: "Sora, sans-serif", transition: "all 0.2s" }}>
                  + {s}
                </button>
              ))}
            </div>

            {/* Assessment CTA */}
            <div style={{ marginTop: 20, padding: 16, background: "rgba(255,215,61,0.05)", border: "1px solid rgba(255,215,61,0.15)", borderRadius: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#FFD93D", marginBottom: 6 }}>⚡ Assess a Skill</div>
              <div style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>Self-claimed skills carry less weight. Take a quick 3-question assessment to verify and earn +15 ECS.</div>
              {skills.filter((s) => s.verification_source === "self_claimed").length > 0 ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {skills.filter((s) => s.verification_source === "self_claimed").slice(0, 4).map((s) => (
                    <button key={s.id} onClick={() => setAssessing(s.skill_name)} style={{ background: "rgba(255,215,61,0.1)", border: "1px solid rgba(255,215,61,0.25)", color: "#FFD93D", borderRadius: 6, padding: "5px 10px", cursor: "pointer", fontSize: 11, fontFamily: "Sora, sans-serif", fontWeight: 700 }}>
                      Assess {s.skill_name} →
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: "#555" }}>All your skills are already verified! 🎉</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {assessing && <AssessmentModal skill={assessing} onClose={() => setAssessing(null)} onComplete={() => { setAssessing(null); }} />}
    </div>
  );
}

const MOCK_SKILLS = [
  { id: "s1", skill_name: "Figma", category: "Tool", verification_source: "platform_assessed", level: "advanced" },
  { id: "s2", skill_name: "JavaScript", category: "Technical", verification_source: "self_claimed", level: "intermediate" },
  { id: "s3", skill_name: "English", category: "Language", verification_source: "education_verified" },
  { id: "s4", skill_name: "isiZulu", category: "Language", verification_source: "self_claimed" },
  { id: "s5", skill_name: "Leadership", category: "Soft", verification_source: "work_verified" },
];

const styles = {
  page: { fontFamily: "'Sora', sans-serif", background: "#0A0A0F", color: "#E8E8F0", minHeight: "100vh", padding: "32px 24px" },
  inner: { maxWidth: 1000, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 },
  title: { fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 800 },
  card: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 24 },
  cardTitle: { fontSize: 11, color: "#555", fontFamily: "DM Mono, monospace", fontWeight: 700, letterSpacing: 2, marginBottom: 16 },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 },
  modal: { background: "#141420", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 32, maxWidth: 420, width: "90%" },
};