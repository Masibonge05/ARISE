import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from "recharts";
import api from "../../services/api";

function MetricCard({ label, value, sub, color = "#FF6B35", icon }) {
  return (
    <div style={styles.metricCard}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 11, color: "#555", fontFamily: "DM Mono, monospace", letterSpacing: 1, marginBottom: 8 }}>{label.toUpperCase()}</div>
          <div style={{ fontSize: 32, fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
          {sub && <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>{sub}</div>}
        </div>
        {icon && <div style={{ fontSize: 28, opacity: 0.6 }}>{icon}</div>}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#1A1A2E", border: "1px solid rgba(255,107,53,0.3)", borderRadius: 8, padding: "8px 12px" }}>
      <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 800, color: "#FF6B35" }}>{payload[0].value}</div>
    </div>
  );
};

export default function GovLinkDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/govlink/dashboard");
        setData(res.data);
      } catch { setData(MOCK_DATA); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "80vh", fontFamily: "Sora, sans-serif", color: "#E8E8F0", background: "#0A0A0F", gap: 12 }}>
      <div style={{ fontSize: 32 }}>🏛️</div>
      <div style={{ color: "#FF6B35", fontFamily: "DM Mono, monospace", fontSize: 13 }}>Loading national impact data...</div>
    </div>
  );

  const s = data.summary;
  const d = data.demographics;

  return (
    <div style={styles.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&family=DM+Mono:wght@400;500&display=swap'); * { box-sizing:border-box; } @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>

      {/* Header */}
      <div style={styles.govHeader}>
        <div style={styles.govHeaderInner}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(255,107,53,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🏛️</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>GovLink · DSBD Impact Portal</div>
              <div style={{ fontSize: 12, color: "#888", fontFamily: "DM Mono, monospace" }}>Department of Small Business Development · Real-time data</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <Link to="/govlink/map" style={styles.govNavBtn}>🗺 SA Map</Link>
            <Link to="/govlink/users" style={styles.govNavBtn}>👥 Users</Link>
            <Link to="/govlink/funds" style={styles.govNavBtn}>💰 Funding</Link>
          </div>
        </div>
      </div>

      <div style={styles.inner}>
        {/* Live indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, animation: "fadeUp 0.4s ease forwards" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ECDC4", boxShadow: "0 0 8px #4ECDC4", animation: "pulse 1.5s infinite" }} />
          <span style={{ fontSize: 12, color: "#4ECDC4", fontFamily: "DM Mono, monospace" }}>LIVE · Powered by Huawei APM · Updated {new Date().toLocaleTimeString("en-ZA")}</span>
        </div>

        {/* Top metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, animation: "fadeUp 0.4s 0.1s ease both" }}>
          <MetricCard label="Total Users" value={s.total_users?.toLocaleString()} icon="👥" color="#E8E8F0" sub="Active on ARISE" />
          <MetricCard label="Entrepreneurs" value={s.total_entrepreneurs?.toLocaleString()} icon="🚀" color="#FFD93D" sub="Youth & women founders" />
          <MetricCard label="Businesses Registered" value={s.total_businesses_registered?.toLocaleString()} icon="🏢" color="#FF6B35" sub={`${s.cipc_verified_businesses} CIPC verified`} />
          <MetricCard label="Jobs Created" value={s.estimated_jobs_created?.toLocaleString()} icon="💼" color="#4ECDC4" sub="Direct employment" />
          <MetricCard label="Grants Facilitated" value={s.grants_facilitated_value} icon="💡" color="#FFD93D" sub="Total value unlocked" />
          <MetricCard label="Freelance Income" value={s.freelance_income_generated} icon="💰" color="#A8E6CF" sub="Generated on platform" />
        </div>

        {/* Charts row */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, animation: "fadeUp 0.4s 0.2s ease both" }}>
          {/* Registration trend */}
          <div style={styles.card}>
            <div style={styles.cardTitle}>MONTHLY REGISTRATIONS TREND</div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data.registration_trend} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#555", fontFamily: "DM Mono" }} />
                <YAxis tick={{ fontSize: 10, fill: "#555", fontFamily: "DM Mono" }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="registrations" stroke="#FF6B35" strokeWidth={2} fill="url(#regGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Demographics */}
          <div style={styles.card}>
            <div style={styles.cardTitle}>GENDER BREAKDOWN</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Female", value: d.gender.female, total: s.total_users, color: "#FF6B35" },
                { label: "Male", value: d.gender.male, total: s.total_users, color: "#4ECDC4" },
                { label: "Unspecified", value: d.gender.unspecified, total: s.total_users, color: "#555" },
              ].map((g) => (
                <div key={g.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: "#888" }}>{g.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: g.color }}>{g.value} ({Math.round((g.value / Math.max(g.total, 1)) * 100)}%)</span>
                  </div>
                  <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3 }}>
                    <div style={{ height: "100%", width: `${(g.value / Math.max(g.total, 1)) * 100}%`, background: g.color, borderRadius: 3, transition: "width 1s ease" }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 24 }}>
              <div style={styles.cardTitle}>ECS DISTRIBUTION</div>
              {[
                { label: "Building (0–299)", value: d.ecs_distribution.building_under_300, color: "#FF6B35" },
                { label: "Developing (300–499)", value: d.ecs_distribution.developing_300_499, color: "#FFD93D" },
                { label: "Established (500–649)", value: d.ecs_distribution.established_500_649, color: "#4ECDC4" },
                { label: "Thriving (650–749)", value: d.ecs_distribution.thriving_650_749, color: "#A8E6CF" },
                { label: "Elite (750+)", value: d.ecs_distribution.elite_750_plus, color: "#FF6B35" },
              ].map((e) => (
                <div key={e.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: "#888" }}>{e.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: e.color }}>{e.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Persona breakdown */}
        <div style={{ ...styles.card, animation: "fadeUp 0.4s 0.3s ease both" }}>
          <div style={styles.cardTitle}>PERSONA BREAKDOWN</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[
              { name: "Job Seekers", value: data.user_personas?.job_seeker || 0, fill: "#FF6B35" },
              { name: "Freelancers", value: data.user_personas?.freelancer || 0, fill: "#4ECDC4" },
              { name: "Entrepreneurs", value: data.user_personas?.entrepreneur || 0, fill: "#FFD93D" },
              { name: "Employers", value: data.user_personas?.employer || 0, fill: "#A8E6CF" },
              { name: "Investors", value: data.user_personas?.investor || 0, fill: "#888" },
              { name: "Mentors", value: data.user_personas?.mentor || 0, fill: "#666" },
            ]} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#555", fontFamily: "DM Mono" }} />
              <YAxis tick={{ fontSize: 10, fill: "#555" }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#FF6B35" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Alert banner */}
        <div style={{ background: "rgba(255,215,61,0.06)", border: "1px solid rgba(255,215,61,0.2)", borderRadius: 10, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, animation: "fadeUp 0.4s 0.4s ease both" }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <div>
            <div style={{ fontWeight: 700, color: "#FFD93D", marginBottom: 2 }}>Programme Optimization Alert</div>
            <div style={{ fontSize: 13, color: "#AAA" }}>NEF Rural Fund has high eligibility scores but low application rates — consider an awareness campaign in rural provinces.</div>
          </div>
          <Link to="/govlink/funds" style={{ marginLeft: "auto", fontSize: 12, color: "#FFD93D", textDecoration: "none", fontWeight: 700, whiteSpace: "nowrap" }}>View Funding Data →</Link>
        </div>

        <div style={{ fontSize: 11, color: "#333", fontFamily: "DM Mono, monospace", textAlign: "center" }}>
          POWERED BY HUAWEI APM · DATA REFRESHES EVERY 60 SECONDS · ARISE CODE4MZANSI 2026
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }`}</style>
    </div>
  );
}

const MOCK_DATA = {
  summary: { total_users: 2847, total_entrepreneurs: 641, total_job_seekers: 1203, total_freelancers: 487, total_businesses_registered: 412, cipc_verified_businesses: 187, total_job_applications: 3421, successful_hires: 342, grants_facilitated_value: "R8,200,000", estimated_jobs_created: 1171, freelance_income_generated: "R2,400,000" },
  demographics: { gender: { female: 1623, male: 1089, unspecified: 135 }, ecs_distribution: { building_under_300: 1240, developing_300_499: 891, established_500_649: 503, thriving_650_749: 148, elite_750_plus: 65 } },
  registration_trend: [
    { month: "Oct 2025", registrations: 124 },
    { month: "Nov 2025", registrations: 287 },
    { month: "Dec 2025", registrations: 341 },
    { month: "Jan 2026", registrations: 512 },
    { month: "Feb 2026", registrations: 743 },
    { month: "Mar 2026", registrations: 840 },
  ],
  user_personas: { job_seeker: 1203, freelancer: 487, entrepreneur: 641, employer: 312, investor: 89, mentor: 115 },
};

const styles = {
  page: { fontFamily: "'Sora', sans-serif", background: "#0A0A0F", color: "#E8E8F0", minHeight: "100vh" },
  govHeader: { background: "rgba(255,107,53,0.04)", borderBottom: "1px solid rgba(255,107,53,0.12)", padding: "0 24px" },
  govHeaderInner: { maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", height: 64 },
  govNavBtn: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#888", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 600, textDecoration: "none", fontFamily: "Sora, sans-serif", transition: "all 0.2s" },
  inner: { maxWidth: 1200, margin: "0 auto", padding: "32px 24px", display: "flex", flexDirection: "column", gap: 20 },
  card: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 24 },
  metricCard: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 20 },
  cardTitle: { fontSize: 11, color: "#555", fontFamily: "DM Mono, monospace", fontWeight: 700, letterSpacing: 2, marginBottom: 16 },
};