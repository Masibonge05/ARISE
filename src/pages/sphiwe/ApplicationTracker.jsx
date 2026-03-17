import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

const STATUS_CONFIG = {
  submitted:            { label: "Submitted",          color: "#888",    icon: "📤", step: 1 },
  viewed:               { label: "Profile Viewed",     color: "#FFD93D", icon: "👁",  step: 2 },
  shortlisted:          { label: "Shortlisted",        color: "#FF6B35", icon: "⭐", step: 3 },
  interview_scheduled:  { label: "Interview Scheduled",color: "#4ECDC4", icon: "📅", step: 4 },
  offered:              { label: "Offer Received",     color: "#4ECDC4", icon: "🎉", step: 5 },
  rejected:             { label: "Not Selected",       color: "#555",    icon: "✗",  step: 0 },
  withdrawn:            { label: "Withdrawn",          color: "#444",    icon: "↩",  step: 0 },
};

function ApplicationCard({ app }) {
  const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.submitted;
  const daysAgo = Math.floor((Date.now() - new Date(app.applied_at)) / 86400000);
  const matchColor = app.match_score >= 80 ? "#4ECDC4" : app.match_score >= 60 ? "#FFD93D" : "#888";

  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${cfg.color}25`, borderRadius: 14, padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 8, background: "rgba(255,107,53,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
            {app.employer?.logo_url ? <img src={app.employer.logo_url} alt="" style={{ width: "100%", borderRadius: 8 }} /> : "🏢"}
          </div>
          <div>
            <Link to={`/jobs/${app.job?.id}`} style={{ fontWeight: 700, fontSize: 15, color: "#E8E8F0", textDecoration: "none", display: "block", marginBottom: 2 }}>{app.job?.title || "Position"}</Link>
            <div style={{ fontSize: 13, color: "#888" }}>{app.employer?.company_name}</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: `${cfg.color}15`, border: `1px solid ${cfg.color}30`, borderRadius: 20, padding: "4px 10px" }}>
            <span style={{ fontSize: 12 }}>{cfg.icon}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color, fontFamily: "DM Mono, monospace" }}>{cfg.label.toUpperCase()}</span>
          </div>
          <span style={{ fontSize: 11, color: "#555", fontFamily: "DM Mono, monospace" }}>{daysAgo === 0 ? "Today" : `${daysAgo}d ago`}</span>
        </div>
      </div>

      {/* Progress steps */}
      {cfg.step > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 14 }}>
          {[1,2,3,4,5].map((s) => (
            <div key={s} style={{ display: "flex", alignItems: "center", flex: s < 5 ? 1 : 0 }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: cfg.step >= s ? cfg.color : "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: cfg.step >= s ? "#0A0A0F" : "#444", fontWeight: 800, flexShrink: 0, transition: "all 0.3s" }}>
                {cfg.step > s ? "✓" : s}
              </div>
              {s < 5 && <div style={{ flex: 1, height: 2, background: cfg.step > s ? cfg.color : "rgba(255,255,255,0.06)", transition: "background 0.3s" }} />}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 12 }}>
          {app.match_score && (
            <span style={{ fontSize: 12, color: matchColor, fontFamily: "DM Mono, monospace", fontWeight: 700 }}>{app.match_score}% match</span>
          )}
          {app.interview_scheduled_at && (
            <span style={{ fontSize: 12, color: "#4ECDC4" }}>📅 Interview: {new Date(app.interview_scheduled_at).toLocaleDateString("en-ZA", { weekday: "short", month: "short", day: "numeric" })}</span>
          )}
        </div>
        <Link to={`/messages?to=${app.job?.id}`} style={{ fontSize: 12, color: "#FF6B35", textDecoration: "none", fontWeight: 600 }}>Message →</Link>
      </div>
    </div>
  );
}

export default function ApplicationTracker() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/jobs/my/applications");
        setApplications(res.data.applications?.length ? res.data.applications : MOCK_APPLICATIONS);
      } catch { setApplications(MOCK_APPLICATIONS); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const filtered = filter === "all" ? applications : applications.filter((a) => a.status === filter);
  const counts = { all: applications.length, active: applications.filter((a) => !["rejected","withdrawn"].includes(a.status)).length, shortlisted: applications.filter((a) => a.status === "shortlisted").length, interview_scheduled: applications.filter((a) => a.status === "interview_scheduled").length };

  return (
    <div style={styles.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap'); * { box-sizing:border-box; } @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>
      <div style={styles.inner}>
        <div style={{ animation: "fadeUp 0.4s ease forwards" }}>
          <h1 style={styles.title}>My Applications</h1>
          <p style={{ fontSize: 14, color: "#888" }}>{applications.length} applications submitted · {counts.active} active</p>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {[
            { label: "Total", value: counts.all, color: "#E8E8F0" },
            { label: "Active", value: counts.active, color: "#FF6B35" },
            { label: "Shortlisted", value: counts.shortlisted, color: "#FFD93D" },
            { label: "Interviews", value: counts.interview_scheduled, color: "#4ECDC4" },
          ].map((s) => (
            <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "14px", textAlign: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, color: "#555", fontFamily: "DM Mono, monospace" }}>{s.label.toUpperCase()}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            { key: "all", label: "All" },
            { key: "shortlisted", label: "Shortlisted" },
            { key: "interview_scheduled", label: "Interviews" },
            { key: "offered", label: "Offers" },
            { key: "rejected", label: "Not Selected" },
          ].map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{ background: filter === f.key ? "rgba(255,107,53,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${filter === f.key ? "rgba(255,107,53,0.35)" : "rgba(255,255,255,0.08)"}`, color: filter === f.key ? "#FF6B35" : "#888", borderRadius: 20, padding: "7px 16px", fontSize: 13, fontWeight: filter === f.key ? 700 : 500, cursor: "pointer", fontFamily: "Sora, sans-serif", transition: "all 0.2s" }}>
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#666" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
            <div style={{ fontFamily: "DM Mono, monospace", fontSize: 13 }}>Loading applications...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "#666", background: "rgba(255,255,255,0.02)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>No applications {filter !== "all" ? `with status "${filter}"` : "yet"}</div>
            <Link to="/jobs" style={{ fontSize: 13, color: "#FF6B35", textDecoration: "none", fontWeight: 600 }}>Browse Jobs →</Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map((app, i) => (
              <div key={app.application_id} style={{ animation: `fadeUp 0.4s ${i * 0.05}s ease both` }}>
                <ApplicationCard app={app} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const MOCK_APPLICATIONS = [
  { application_id: "a1", status: "interview_scheduled", match_score: 94, interview_scheduled_at: new Date(Date.now() + 86400000 * 2).toISOString(), applied_at: new Date(Date.now() - 86400000 * 5).toISOString(), job: { id: "1", title: "Junior UI/UX Designer", sector: "Technology" }, employer: { company_name: "Tech4Africa" } },
  { application_id: "a2", status: "shortlisted", match_score: 82, applied_at: new Date(Date.now() - 86400000 * 8).toISOString(), job: { id: "2", title: "React Developer", sector: "Technology" }, employer: { company_name: "StartupSA" } },
  { application_id: "a3", status: "viewed", match_score: 67, applied_at: new Date(Date.now() - 86400000 * 12).toISOString(), job: { id: "3", title: "Marketing Coordinator", sector: "Marketing" }, employer: { company_name: "Mzansi Media" } },
  { application_id: "a4", status: "rejected", match_score: 45, applied_at: new Date(Date.now() - 86400000 * 20).toISOString(), job: { id: "4", title: "Senior Developer", sector: "Technology" }, employer: { company_name: "BigTech SA" } },
];

const styles = {
  page: { fontFamily: "'Sora', sans-serif", background: "#0A0A0F", color: "#E8E8F0", minHeight: "100vh", padding: "32px 24px" },
  inner: { maxWidth: 800, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 },
  title: { fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 800, marginBottom: 4 },
};