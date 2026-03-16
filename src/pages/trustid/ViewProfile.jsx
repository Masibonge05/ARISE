import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Spinner, TrustBadge } from "../../components/ui";
import ProfileCard from "../../components/trustid/ProfileCard";
import SkillTag from "../../components/trustid/SkillTag";
import api from "../../services/api";

export default function ViewProfile() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/users/${userId}/profile`)
      .then(r => setProfile(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"60vh", gap:12, background:"#0A0A0F" }}>
      <Spinner /> <span style={{ color:"#888", fontFamily:"DM Mono,monospace", fontSize:13 }}>Loading profile…</span>
    </div>
  );
  if (!profile) return (
    <div style={{ textAlign:"center", padding:60, color:"#555", fontFamily:"Sora,sans-serif", background:"#0A0A0F", minHeight:"100vh" }}>
      <div style={{ fontSize:40, marginBottom:12 }}>👤</div>
      <div>Profile not found.</div>
      <Link to="/jobs" style={{ color:"#FF6B35", textDecoration:"none", display:"block", marginTop:12 }}>← Back</Link>
    </div>
  );

  return (
    <div style={S.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Mono:wght@400&display=swap'); *{box-sizing:border-box}`}</style>
      <div style={S.inner}>
        <ProfileCard user={profile} />

        {profile.bio && (
          <div style={S.card}>
            <div style={S.cardTitle}>ABOUT</div>
            <p style={{ fontSize:14, color:"#BBB", lineHeight:1.7 }}>{profile.bio}</p>
          </div>
        )}

        {profile.skills?.length > 0 && (
          <div style={S.card}>
            <div style={S.cardTitle}>SKILLS ({profile.skills.filter(s=>s.verification_source!=="self_claimed").length} verified)</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
              {profile.skills.map(s => <SkillTag key={s.id||s.skill_name} skill={s} />)}
            </div>
          </div>
        )}

        {profile.qualifications?.length > 0 && (
          <div style={S.card}>
            <div style={S.cardTitle}>QUALIFICATIONS</div>
            {profile.qualifications.map((q,i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:13 }}>{q.qualification_title}</div>
                  <div style={{ fontSize:11, color:"#888" }}>{q.institution_name}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:11, color:"#888" }}>{q.year_completed}</div>
                  {q.is_verified && <TrustBadge type="education" size="sm" />}
                </div>
              </div>
            ))}
          </div>
        )}

        {profile.work_experience?.length > 0 && (
          <div style={S.card}>
            <div style={S.cardTitle}>WORK EXPERIENCE</div>
            {profile.work_experience.map((w,i) => (
              <div key={i} style={{ padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ fontWeight:700, fontSize:13 }}>{w.job_title}</div>
                <div style={{ fontSize:11, color:"#888" }}>{w.company_name} · {w.start_date?.slice(0,7)} – {w.is_current?"Present":w.end_date?.slice(0,7)}</div>
                {w.is_reference_verified && <TrustBadge type="work" size="sm" />}
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign:"center", padding:"8px 0" }}>
          <div style={{ fontSize:12, color:"#555" }}>ECS Score: <strong style={{ color:"#FF6B35" }}>{profile.ecs_score||0}</strong> · TrustID: {Math.round(profile.trust_completion_score||0)}% complete</div>
        </div>
      </div>
    </div>
  );
}

const S = {
  page: { fontFamily:"'Sora',sans-serif", background:"#0A0A0F", color:"#E8E8F0", minHeight:"100vh", padding:"32px 24px" },
  inner: { maxWidth:720, margin:"0 auto", display:"flex", flexDirection:"column", gap:16 },
  card: { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:20 },
  cardTitle: { fontSize:11, color:"#555", fontFamily:"DM Mono,monospace", fontWeight:700, letterSpacing:2, marginBottom:12 },
};