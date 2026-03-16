import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { TrustBadge, ECSGauge, TrustBar } from "../../components/ui";
import api from "../../services/api";

const STEPS = [
  { id: "email",    label: "Email Verification",    desc: "Verify your email address",                               ecs: 25,  icon: "✉️",  action: "/settings",            actionLabel: "Verify" },
  { id: "identity", label: "Identity Document",     desc: "Upload SA ID, passport, or driver's licence",            ecs: 50,  icon: "🪪",  action: "/onboarding/identity", actionLabel: "Upload ID" },
  { id: "photo",    label: "Profile Photo",         desc: "Add a photo to your TrustID",                            ecs: 10,  icon: "📸",  action: "/profile",             actionLabel: "Add Photo" },
  { id: "bio",      label: "Profile Bio",           desc: "Write a short bio about yourself",                       ecs: 10,  icon: "✍️",  action: "/profile",             actionLabel: "Write Bio" },
  { id: "qual",     label: "Qualification",         desc: "Upload an academic certificate for verification",         ecs: 25,  icon: "🎓",  action: "/profile",             actionLabel: "Add Qualification" },
  { id: "skill",    label: "Skills Assessment",     desc: "Pass a 3-question assessment on a claimed skill",         ecs: 15,  icon: "⚡",  action: "/skills",              actionLabel: "Assess Skill" },
  { id: "work",     label: "Work Experience",       desc: "Get a work reference confirmed by a former employer",     ecs: 20,  icon: "💼",  action: "/profile",             actionLabel: "Add Experience" },
  { id: "business", label: "Business Registration", desc: "Complete LaunchPad to register your business on ARISE",  ecs: 100, icon: "🚀",  action: "/launchpad",           actionLabel: "Launch Business" },
];

export default function VerificationTracker() {
  const { user } = useAuth();
  const [status, setStatus] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/trustid/status")
      .then((r) => {
        const d = r.data;
        setStatus({
          email:    d.is_email_verified || false,
          identity: d.is_identity_verified || false,
          photo:    false,
          bio:      false,
          qual:     (d.qualifications?.verified || 0) > 0,
          skill:    (d.skills?.verified || 0) > 0,
          work:     (d.work_experience?.verified || 0) > 0,
          business: false,
        });
      })
      .catch(() => {
        setStatus({
          email:    user?.is_email_verified || false,
          identity: user?.is_identity_verified || false,
          photo:    !!user?.profile_photo_url,
          bio:      !!user?.bio,
          qual:     false, skill: false, work: false, business: false,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const completed = STEPS.filter((s) => status[s.id]).length;
  const pct = Math.round((completed / STEPS.length) * 100);
  const ecsEarned = STEPS.filter((s) => status[s.id]).reduce((sum, s) => sum + s.ecs, 0);
  const ecsPotential = STEPS.filter((s) => !status[s.id]).reduce((sum, s) => sum + s.ecs, 0);

  return (
    <div style={S.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap'); * { box-sizing:border-box; } @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={S.inner}>

        {/* Header */}
        <div style={{ animation: "fadeUp 0.4s ease forwards" }}>
          <h1 style={S.title}>Verification Centre</h1>
          <p style={{ fontSize: 14, color: "#888" }}>Each verified item strengthens your TrustID and awards ECS points</p>
        </div>

        {/* Progress overview */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, animation: "fadeUp 0.4s 0.05s ease both" }}>
          <div style={S.card}>
            <div style={{ fontSize: 11, color: "#555", fontFamily: "DM Mono,monospace", marginBottom: 8 }}>COMPLETED</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: "#4ECDC4" }}>{completed}/{STEPS.length}</div>
            <div style={{ marginTop: 10, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
              <div style={{ height: "100%", width: `${pct}%`, background: "#4ECDC4", borderRadius: 2, transition: "width 1s ease" }} />
            </div>
          </div>
          <div style={S.card}>
            <div style={{ fontSize: 11, color: "#555", fontFamily: "DM Mono,monospace", marginBottom: 8 }}>ECS EARNED</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: "#FF6B35" }}>+{ecsEarned}</div>
            <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>from verifications</div>
          </div>
          <div style={S.card}>
            <div style={{ fontSize: 11, color: "#555", fontFamily: "DM Mono,monospace", marginBottom: 8 }}>POTENTIAL</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: "#FFD93D" }}>+{ecsPotential}</div>
            <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>still available</div>
          </div>
        </div>

        {/* Steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, animation: "fadeUp 0.4s 0.1s ease both" }}>
          {STEPS.map((step) => {
            const done = status[step.id];
            return (
              <div key={step.id} style={{ display: "flex", gap: 16, alignItems: "center", padding: "16px 20px", background: done ? "rgba(78,205,196,0.04)" : "rgba(255,255,255,0.03)", border: `1px solid ${done ? "rgba(78,205,196,0.2)" : "rgba(255,255,255,0.07)"}`, borderRadius: 12, transition: "all 0.2s" }}>
                {/* Status icon */}
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: done ? "rgba(78,205,196,0.15)" : "rgba(255,255,255,0.05)", border: `1px solid ${done ? "rgba(78,205,196,0.3)" : "rgba(255,255,255,0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: done ? 16 : 20, flexShrink: 0 }}>
                  {done ? "✓" : step.icon}
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: done ? "#4ECDC4" : "#E8E8F0", marginBottom: 2 }}>{step.label}</div>
                  <div style={{ fontSize: 12, color: "#666" }}>{step.desc}</div>
                </div>

                {/* ECS */}
                <div style={{ textAlign: "center", minWidth: 56 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: done ? "#4ECDC4" : "#FF6B35" }}>
                    {done ? "✓" : `+${step.ecs}`}
                  </div>
                  <div style={{ fontSize: 10, color: "#555", fontFamily: "DM Mono,monospace" }}>ECS</div>
                </div>

                {/* Action */}
                {!done && (
                  <Link to={step.action} style={{ background: "rgba(255,107,53,0.1)", border: "1px solid rgba(255,107,53,0.25)", color: "#FF6B35", borderRadius: 8, padding: "8px 14px", textDecoration: "none", fontSize: 12, fontWeight: 700, fontFamily: "Sora,sans-serif", flexShrink: 0 }}>
                    {step.actionLabel} →
                  </Link>
                )}
                {done && <TrustBadge type="verified" size="sm" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const S = {
  page: { fontFamily: "'Sora',sans-serif", background: "#0A0A0F", color: "#E8E8F0", minHeight: "100vh", padding: "32px 24px" },
  inner: { maxWidth: 800, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 },
  title: { fontSize: "clamp(22px,3vw,30px)", fontWeight: 800, marginBottom: 4 },
  card: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 18 },
};