import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const VERIFICATION_COLORS = {
  verified: "#4ECDC4", pending: "#FFD93D",
  in_progress: "#FF6B35", failed: "#FF4444", self_claimed: "#666",
};

const SKILL_SOURCE_LABELS = {
  self_claimed: "Self-claimed", platform_assessed: "Platform Assessed",
  education_verified: "Education Verified", work_verified: "Work Verified", accredited: "Accredited",
};

function VerificationBadge({ status, source }) {
  const key = status || source;
  const color = VERIFICATION_COLORS[key] || "#666";
  const label = status ? status.replace("_", " ") : SKILL_SOURCE_LABELS[source] || source;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: `${color}15`, border: `1px solid ${color}30`, borderRadius: 12, padding: "2px 8px", fontSize: 10, color, fontWeight: 700, fontFamily: "DM Mono, monospace", textTransform: "uppercase" }}>
      {status === "verified" || source === "accredited" ? "✓" : status === "pending" ? "○" : "~"} {label}
    </span>
  );
}

export default function MyProfile() {
  const { user } = useAuth();
  const { userId } = useParams();
  const navigate = useNavigate();
  const isOwnProfile = !userId || userId === user?.id;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetch = async () => {
      try {
        const endpoint = isOwnProfile ? "/users/me" : `/users/${userId}`;
        const res = await api.get(endpoint);
        setProfile(res.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, [userId]);

  if (loading) return <div style={styles.loading}>⚡ Loading profile...</div>;
  if (!profile) return <div style={styles.loading}>Profile not found.</div>;

  const ecsColor = profile.ecs_score < 300 ? "#FF6B35" : profile.ecs_score < 500 ? "#FFD93D" : profile.ecs_score < 650 ? "#4ECDC4" : "#A8E6CF";
  const tabs = ["overview", "skills", "experience", "portfolio"];

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        .profile-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 20px; }
        .tab-btn { background: none; border: none; cursor: pointer; padding: 10px 20px; font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 600; border-radius: 6px; transition: all 0.2s; color: #666; }
        .tab-btn.active { background: rgba(255,107,53,0.15); color: #FF6B35; }
        .tab-btn:hover { color: #CCC; }
        .skill-tag { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 4px 12px; font-size: 12px; margin: 3px; cursor: default; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <div style={styles.inner}>
        {/* ── Profile Header ── */}
        <div style={{ ...styles.profileHeader, animation: "fadeUp 0.4s ease forwards" }}>
          {/* Left — identity */}
          <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
            <div style={styles.avatar}>
              {profile.profile_photo_url
                ? <img src={profile.profile_photo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                : <span>{profile.full_name?.[0]}</span>
              }
              {profile.is_identity_verified && (
                <div style={styles.verifiedRing} title="Identity Verified">✓</div>
              )}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                <h1 style={styles.name}>{profile.full_name}</h1>
                {profile.is_identity_verified && (
                  <span style={{ background: "rgba(78,205,196,0.1)", border: "1px solid rgba(78,205,196,0.25)", borderRadius: 12, padding: "3px 10px", fontSize: 11, color: "#4ECDC4", fontWeight: 700 }}>✓ VERIFIED</span>
                )}
              </div>
              <div style={{ fontSize: 14, color: "#888", marginBottom: 10 }}>
                {profile.primary_persona?.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}
                {profile.province && ` · ${profile.city || ""} ${profile.province}`}
              </div>
              {profile.bio && <p style={{ fontSize: 14, color: "#BBB", maxWidth: 520, lineHeight: 1.6 }}>{profile.bio}</p>}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                <span style={{ fontSize: 13, color: "#666" }}>TrustID: <span style={{ color: "#FF6B35", fontWeight: 700 }}>{Math.round(profile.trust_completion_score)}% complete</span></span>
              </div>
            </div>
          </div>

          {/* Right — ECS + actions */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 16 }}>
            <div style={styles.ecsCard}>
              <div style={{ fontSize: 10, color: "#666", fontFamily: "DM Mono, monospace", marginBottom: 4 }}>ECS SCORE</div>
              <div style={{ fontSize: 40, fontWeight: 900, color: ecsColor, lineHeight: 1 }}>{profile.ecs_score}</div>
              <div style={{ fontSize: 10, color: "#555", fontFamily: "DM Mono, monospace" }}>/ 850</div>
            </div>
            {isOwnProfile ? (
              <div style={{ display: "flex", gap: 8 }}>
                <Link to="/profile/verify" style={styles.btnSecondary}>Verify More →</Link>
                <Link to="/ecs" style={styles.btnPrimary}>ECS Dashboard</Link>
              </div>
            ) : (
              <Link to={`/messages?to=${profile.id}`} style={styles.btnPrimary}>Send Message</Link>
            )}
          </div>
        </div>

        {/* ── Trust Completion Banner ── */}
        {isOwnProfile && profile.trust_completion_score < 60 && (
          <div style={styles.completionBanner}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Your TrustID is {Math.round(profile.trust_completion_score)}% complete</div>
              <div style={{ fontSize: 13, color: "#AAA" }}>Complete your profile to appear in more searches and unlock better matches.</div>
            </div>
            <Link to="/onboarding/identity" style={styles.btnPrimary}>Continue Setup →</Link>
          </div>
        )}

        {/* ── Tabs ── */}
        <div style={{ display: "flex", gap: 4, borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 1 }}>
          {tabs.map((tab) => (
            <button key={tab} className={`tab-btn ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === "skills" && profile.skills?.length > 0 && <span style={styles.tabCount}>{profile.skills.length}</span>}
              {tab === "experience" && profile.work_experiences?.length > 0 && <span style={styles.tabCount}>{profile.work_experiences.length}</span>}
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        <div style={{ animation: "fadeUp 0.3s ease forwards" }}>

          {/* Overview */}
          {activeTab === "overview" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* Qualifications */}
              <div className="profile-card">
                <div style={styles.cardTitle}>🎓 Qualifications</div>
                {profile.qualifications?.length > 0 ? profile.qualifications.map((q) => (
                  <div key={q.id} style={styles.listItem}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{q.qualification_title}</div>
                    <div style={{ fontSize: 13, color: "#888", marginBottom: 4 }}>{q.institution_name} {q.year_completed && `· ${q.year_completed}`}</div>
                    <VerificationBadge status={q.verification_status} />
                  </div>
                )) : (
                  <div style={styles.emptyState}>
                    No qualifications added yet.
                    {isOwnProfile && <Link to="/onboarding/qualifications" style={styles.addLink}>+ Add qualification</Link>}
                  </div>
                )}
              </div>

              {/* Top Skills */}
              <div className="profile-card">
                <div style={styles.cardTitle}>⚡ Skills</div>
                {profile.skills?.length > 0 ? (
                  <div>
                    {profile.skills.slice(0, 6).map((s) => (
                      <span key={s.id} className="skill-tag" style={{ borderColor: VERIFICATION_COLORS[s.verification_source] + "30", color: "#CCC" }}>
                        {s.skill_name}
                        <span style={{ fontSize: 9, color: VERIFICATION_COLORS[s.verification_source] || "#666" }}>
                          {s.verification_source === "self_claimed" ? "○" : "✓"}
                        </span>
                      </span>
                    ))}
                    {profile.skills.length > 6 && (
                      <button onClick={() => setActiveTab("skills")} style={{ fontSize: 12, color: "#FF6B35", background: "none", border: "none", cursor: "pointer", marginTop: 8 }}>
                        +{profile.skills.length - 6} more skills
                      </button>
                    )}
                  </div>
                ) : (
                  <div style={styles.emptyState}>
                    No skills added yet.
                    {isOwnProfile && <Link to="/skills" style={styles.addLink}>+ Add skills</Link>}
                  </div>
                )}
              </div>

              {/* Work History */}
              <div className="profile-card" style={{ gridColumn: "span 2" }}>
                <div style={styles.cardTitle}>💼 Work Experience</div>
                {profile.work_experiences?.length > 0 ? profile.work_experiences.map((w) => (
                  <div key={w.id} style={{ ...styles.listItem, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{w.job_title}</div>
                      <div style={{ fontSize: 13, color: "#888" }}>{w.company_name} · {w.is_current ? "Present" : w.end_date?.slice(0, 7)}</div>
                      {w.description && <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>{w.description}</div>}
                    </div>
                    <VerificationBadge status={w.verification_status} />
                  </div>
                )) : (
                  <div style={styles.emptyState}>
                    No work experience added.
                    {isOwnProfile && <Link to="/profile" style={styles.addLink}>+ Add experience</Link>}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Skills Tab */}
          {activeTab === "skills" && (
            <div className="profile-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div style={styles.cardTitle}>All Skills</div>
                {isOwnProfile && <Link to="/skills" style={styles.addLink}>+ Add / Assess Skills</Link>}
              </div>
              {["Technical", "Soft", "Language", "Tool", null].map((cat) => {
                const catSkills = profile.skills?.filter((s) => (cat ? s.category === cat : !["Technical","Soft","Language","Tool"].includes(s.category)));
                if (!catSkills?.length) return null;
                return (
                  <div key={cat} style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 11, color: "#666", fontFamily: "DM Mono, monospace", marginBottom: 10 }}>{cat?.toUpperCase() || "OTHER"}</div>
                    <div>
                      {catSkills.map((s) => (
                        <span key={s.id} className="skill-tag" style={{ borderColor: `${VERIFICATION_COLORS[s.verification_source]}30` }}>
                          {s.skill_name}
                          <span style={{ fontSize: 10, color: VERIFICATION_COLORS[s.verification_source] }}>{s.verification_source === "self_claimed" ? "○" : "✓"}</span>
                          <span style={{ fontSize: 9, color: "#555", textTransform: "uppercase" }}>{s.level}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Experience Tab */}
          {activeTab === "experience" && (
            <div className="profile-card">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                <div style={styles.cardTitle}>Work Experience</div>
                {isOwnProfile && <button style={styles.addLink}>+ Add Experience</button>}
              </div>
              {profile.work_experiences?.map((w) => (
                <div key={w.id} style={{ ...styles.listItem, borderLeft: "3px solid rgba(255,107,53,0.3)", paddingLeft: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{w.job_title}</div>
                      <div style={{ fontSize: 13, color: "#888", margin: "4px 0" }}>{w.company_name}</div>
                      <div style={{ fontSize: 12, color: "#666" }}>{new Date(w.start_date).getFullYear()} — {w.is_current ? "Present" : w.end_date ? new Date(w.end_date).getFullYear() : "—"}</div>
                      {w.description && <p style={{ fontSize: 13, color: "#AAA", marginTop: 8, lineHeight: 1.5 }}>{w.description}</p>}
                    </div>
                    <VerificationBadge status={w.verification_status} />
                  </div>
                </div>
              ))}
              {!profile.work_experiences?.length && <div style={styles.emptyState}>No work experience added yet.</div>}
            </div>
          )}

          {/* Portfolio Tab */}
          {activeTab === "portfolio" && (
            <div>
              {profile.portfolio_items?.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
                  {profile.portfolio_items.map((p) => (
                    <div key={p.id} className="profile-card">
                      {p.thumbnail_url && <img src={p.thumbnail_url} alt={p.title} style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 8, marginBottom: 12 }} />}
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{p.title}</div>
                      {p.category && <div style={{ fontSize: 11, color: "#666", fontFamily: "DM Mono, monospace", marginBottom: 8 }}>{p.category.toUpperCase()}</div>}
                      {p.is_client_verified && <VerificationBadge status="verified" />}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="profile-card" style={styles.emptyState}>
                  No portfolio items yet.
                  {isOwnProfile && <Link to="/portfolio" style={styles.addLink}>+ Add portfolio item</Link>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { fontFamily: "'Sora', sans-serif", background: "#0A0A0F", color: "#E8E8F0", minHeight: "100vh", padding: "32px 24px" },
  inner: { maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 },
  loading: { display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "Sora, sans-serif", color: "#FF6B35", background: "#0A0A0F" },
  profileHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 32 },
  avatar: { width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, #FF6B35, #FF3D00)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: "#fff", position: "relative", flexShrink: 0 },
  verifiedRing: { position: "absolute", bottom: 0, right: 0, width: 22, height: 22, borderRadius: "50%", background: "#4ECDC4", border: "2px solid #0A0A0F", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#0A0A0F", fontWeight: 900 },
  name: { fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 800, letterSpacing: -0.5 },
  ecsCard: { background: "rgba(255,107,53,0.06)", border: "1px solid rgba(255,107,53,0.15)", borderRadius: 12, padding: "16px 24px", textAlign: "center", minWidth: 100 },
  btnPrimary: { display: "inline-flex", alignItems: "center", gap: 6, background: "#FF6B35", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", textDecoration: "none", fontFamily: "Sora, sans-serif" },
  btnSecondary: { display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", color: "#E8E8F0", border: "1px solid rgba(255,255,255,0.12)", padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", textDecoration: "none", fontFamily: "Sora, sans-serif" },
  completionBanner: { background: "rgba(255,107,53,0.06)", border: "1px solid rgba(255,107,53,0.2)", borderRadius: 12, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20 },
  tabCount: { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 18, height: 18, borderRadius: "50%", background: "rgba(255,107,53,0.2)", color: "#FF6B35", fontSize: 10, marginLeft: 6, fontWeight: 700 },
  cardTitle: { fontSize: 13, fontWeight: 700, color: "#AAA", marginBottom: 16, fontFamily: "DM Mono, monospace", letterSpacing: 1 },
  listItem: { paddingBottom: 16, marginBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.05)" },
  emptyState: { fontSize: 13, color: "#555", display: "flex", flexDirection: "column", gap: 8, padding: "8px 0" },
  addLink: { color: "#FF6B35", textDecoration: "none", fontSize: 13, fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontFamily: "Sora, sans-serif" },
};