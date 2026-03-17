import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const STEPS = ["persona", "identity", "qualifications", "skills", "goals", "complete"];

function StepProgress({ current }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 48 }}>
      {STEPS.map((s, i) => (
        <div key={s} style={{ display: "flex", alignItems: "center" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: i <= current ? "#FF6B35" : "rgba(255,255,255,0.1)", transition: "background 0.3s" }} />
          {i < STEPS.length - 1 && <div style={{ width: 28, height: 1, background: i < current ? "#FF6B35" : "rgba(255,255,255,0.08)" }} />}
        </div>
      ))}
    </div>
  );
}

// ─── QUALIFICATIONS UPLOAD ────────────────────────────────────────────────────
export function QualificationsUpload() {
  const navigate = useNavigate();
  const fileRef = useRef();
  const [qualifications, setQualifications] = useState([]);
  const [form, setForm] = useState({ institution_name: "", qualification_title: "", field_of_study: "", year_completed: "", is_current: false });
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  const addQual = async () => {
    if (!form.institution_name || !form.qualification_title) return;
    setAdding(true);
    try {
      const res = await api.post("/users/me/qualifications", { ...form, year_completed: form.year_completed ? parseInt(form.year_completed) : null });
      setQualifications((q) => [...q, { ...form, id: res.data.qualification_id || Date.now(), verification_status: "pending" }]);
      setForm({ institution_name: "", qualification_title: "", field_of_study: "", year_completed: "", is_current: false });
    } catch {
      setQualifications((q) => [...q, { ...form, id: Date.now(), verification_status: "pending" }]);
      setForm({ institution_name: "", qualification_title: "", field_of_study: "", year_completed: "", is_current: false });
    } finally { setAdding(false); }
  };

  const handleContinue = () => navigate("/onboarding/skills");
  const handleSkip = () => navigate("/onboarding/skills");

  return (
    <div style={styles.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap'); * { box-sizing:border-box; } .q-input { width:100%; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:12px 14px; color:#E8E8F0; font-family:'Sora',sans-serif; font-size:14px; outline:none; transition:border-color 0.2s; } .q-input:focus { border-color:#FF6B35; } .q-input::placeholder { color:#555; } @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>

      <div style={styles.inner}>
        <StepProgress current={2} />

        <div style={{ textAlign: "center", marginBottom: 36, animation: "fadeUp 0.4s ease forwards" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎓</div>
          <div style={{ fontSize: 11, color: "#FF6B35", fontFamily: "DM Mono, monospace", letterSpacing: 3, marginBottom: 12 }}>STEP 3 OF 5</div>
          <h1 style={styles.title}>Your qualifications</h1>
          <p style={{ fontSize: 14, color: "#888", lineHeight: 1.7 }}>Add your degrees, diplomas, and certificates. We'll verify them automatically.</p>
        </div>

        <div style={{ maxWidth: 520, margin: "0 auto", width: "100%" }}>
          {/* Added qualifications */}
          {qualifications.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              {qualifications.map((q) => (
                <div key={q.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "rgba(78,205,196,0.04)", border: "1px solid rgba(78,205,196,0.15)", borderRadius: 10, marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{q.qualification_title}</div>
                    <div style={{ fontSize: 12, color: "#888" }}>{q.institution_name} {q.year_completed && `· ${q.year_completed}`}</div>
                  </div>
                  <span style={{ fontSize: 10, color: "#FFD93D", fontFamily: "DM Mono, monospace", fontWeight: 700 }}>○ PENDING</span>
                </div>
              ))}
            </div>
          )}

          {/* Add form */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 24, animation: "fadeUp 0.4s 0.1s ease both" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#AAA", marginBottom: 16 }}>
              {qualifications.length === 0 ? "Add your first qualification" : "Add another qualification"}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={styles.label}>Institution *</label>
                <input className="q-input" placeholder="University of Johannesburg" value={form.institution_name} onChange={(e) => setForm({ ...form, institution_name: e.target.value })} />
              </div>
              <div>
                <label style={styles.label}>Qualification title *</label>
                <input className="q-input" placeholder="BSc Computer Science" value={form.qualification_title} onChange={(e) => setForm({ ...form, qualification_title: e.target.value })} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={styles.label}>Field of study</label>
                  <input className="q-input" placeholder="Engineering" value={form.field_of_study} onChange={(e) => setForm({ ...form, field_of_study: e.target.value })} />
                </div>
                <div>
                  <label style={styles.label}>Year completed</label>
                  <input className="q-input" type="number" placeholder="2024" min="1990" max={new Date().getFullYear()} value={form.year_completed} onChange={(e) => setForm({ ...form, year_completed: e.target.value })} />
                </div>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 13, color: "#888" }}>
                <input type="checkbox" checked={form.is_current} onChange={(e) => setForm({ ...form, is_current: e.target.checked })} style={{ accentColor: "#FF6B35" }} />
                Currently studying
              </label>
              <button onClick={addQual} disabled={adding || !form.institution_name || !form.qualification_title} style={{ background: "rgba(255,107,53,0.15)", border: "1px solid rgba(255,107,53,0.3)", color: "#FF6B35", borderRadius: 8, padding: "11px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Sora, sans-serif", opacity: (!form.institution_name || !form.qualification_title) ? 0.5 : 1 }}>
                {adding ? "Adding..." : "+ Add Qualification"}
              </button>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
            <button onClick={handleContinue} style={styles.primaryBtn}>
              {qualifications.length > 0 ? `Continue with ${qualifications.length} qualification${qualifications.length > 1 ? "s" : ""} →` : "Continue →"}
            </button>
            <button onClick={handleSkip} style={styles.ghostBtn}>Skip — add later</button>
          </div>
        </div>
      </div>
    </div>
  );
}


// ─── GOALS SETUP ──────────────────────────────────────────────────────────────
export function GoalsSetup() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [goals, setGoals] = useState({
    desired_job_title: "",
    desired_sector: "",
    salary_min: "",
    salary_max: "",
    work_style: "",
    open_to_relocation: false,
    employment_type: "full_time",
    is_available: true,
  });

  const set = (key, val) => setGoals((g) => ({ ...g, [key]: val }));

  const handleComplete = async () => {
    setSaving(true);
    try {
      await api.patch("/users/me", { is_available: goals.is_available });
    } catch {}
    finally { setSaving(false); }
    navigate("/onboarding/complete");
  };

  return (
    <div style={styles.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap'); * { box-sizing:border-box; } .g-input { width:100%; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:12px 14px; color:#E8E8F0; font-family:'Sora',sans-serif; font-size:14px; outline:none; transition:border-color 0.2s; } .g-input:focus { border-color:#FF6B35; } .g-input::placeholder { color:#555; } @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>

      <div style={styles.inner}>
        <StepProgress current={4} />

        <div style={{ textAlign: "center", marginBottom: 36, animation: "fadeUp 0.4s ease forwards" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
          <div style={{ fontSize: 11, color: "#FF6B35", fontFamily: "DM Mono, monospace", letterSpacing: 3, marginBottom: 12 }}>STEP 5 OF 5 · ALMOST DONE</div>
          <h1 style={styles.title}>What are you looking for?</h1>
          <p style={{ fontSize: 14, color: "#888", lineHeight: 1.7 }}>This shapes your opportunity feed and helps us match you better.</p>
        </div>

        <div style={{ maxWidth: 520, margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: 16, animation: "fadeUp 0.4s 0.1s ease both" }}>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 24 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={styles.label}>Desired job title or role</label>
                <input className="g-input" placeholder="e.g. UI/UX Designer, Frontend Developer" value={goals.desired_job_title} onChange={(e) => set("desired_job_title", e.target.value)} />
              </div>
              <div>
                <label style={styles.label}>Preferred sector</label>
                <input className="g-input" placeholder="Technology, Fashion, Agriculture..." value={goals.desired_sector} onChange={(e) => set("desired_sector", e.target.value)} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={styles.label}>Minimum salary (ZAR/mo)</label>
                  <input className="g-input" type="number" placeholder="15000" value={goals.salary_min} onChange={(e) => set("salary_min", e.target.value)} />
                </div>
                <div>
                  <label style={styles.label}>Maximum salary (ZAR/mo)</label>
                  <input className="g-input" type="number" placeholder="30000" value={goals.salary_max} onChange={(e) => set("salary_max", e.target.value)} />
                </div>
              </div>
              <div>
                <label style={styles.label}>Work style preference</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {["remote", "hybrid", "on_site"].map((ws) => (
                    <div key={ws} onClick={() => set("work_style", ws)} style={{ flex: 1, padding: "10px", borderRadius: 8, border: `1px solid ${goals.work_style === ws ? "rgba(255,107,53,0.4)" : "rgba(255,255,255,0.08)"}`, background: goals.work_style === ws ? "rgba(255,107,53,0.1)" : "rgba(255,255,255,0.03)", cursor: "pointer", textAlign: "center", fontSize: 12, fontWeight: goals.work_style === ws ? 700 : 400, color: goals.work_style === ws ? "#FF6B35" : "#888", transition: "all 0.15s" }}>
                      {ws.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label style={styles.label}>Employment type</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {["full_time", "part_time", "contract", "internship"].map((et) => (
                    <div key={et} onClick={() => set("employment_type", et)} style={{ padding: "8px 14px", borderRadius: 20, border: `1px solid ${goals.employment_type === et ? "rgba(255,107,53,0.4)" : "rgba(255,255,255,0.08)"}`, background: goals.employment_type === et ? "rgba(255,107,53,0.1)" : "transparent", cursor: "pointer", fontSize: 12, fontWeight: goals.employment_type === et ? 700 : 400, color: goals.employment_type === et ? "#FF6B35" : "#888", transition: "all 0.15s" }}>
                      {et.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}
                    </div>
                  ))}
                </div>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 13, color: "#888" }}>
                <input type="checkbox" checked={goals.open_to_relocation} onChange={(e) => set("open_to_relocation", e.target.checked)} style={{ accentColor: "#FF6B35" }} />
                Open to relocating within South Africa
              </label>
            </div>
          </div>

          <button onClick={handleComplete} disabled={saving} style={{ ...styles.primaryBtn, background: "#4ECDC4", color: "#0A0A0F" }}>
            {saving ? "Saving..." : "Complete Setup & Launch ARISE 🚀"}
          </button>
          <button onClick={() => navigate("/onboarding/complete")} style={styles.ghostBtn}>Skip — set goals later</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { fontFamily: "'Sora', sans-serif", background: "#0A0A0F", color: "#E8E8F0", minHeight: "100vh", padding: "40px 24px" },
  inner: { maxWidth: 600, margin: "0 auto" },
  title: { fontSize: "clamp(24px, 4vw, 34px)", fontWeight: 800, marginBottom: 12 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#AAA", marginBottom: 7 },
  primaryBtn: { width: "100%", background: "#FF6B35", color: "#fff", border: "none", padding: "14px", borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "Sora, sans-serif", transition: "all 0.2s" },
  ghostBtn: { width: "100%", background: "none", border: "none", color: "#666", padding: "12px", fontSize: 13, cursor: "pointer", fontFamily: "Sora, sans-serif" },
};

export default QualificationsUpload;