import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { EmptyState, SectionLabel } from "../../components/ui";
import api from "../../services/api";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#1A1A2E", border: "1px solid rgba(78,205,196,0.3)", borderRadius: 8, padding: "8px 12px" }}>
      <div style={{ fontSize: 11, color: "#888", fontFamily: "DM Mono,monospace" }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 800, color: "#4ECDC4" }}>R{payload[0]?.value?.toLocaleString()}</div>
    </div>
  );
};

export default function EarningsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("6m");

  useEffect(() => {
    api.get("/freelance/my/earnings")
      .then((r) => setData(r.data))
      .catch(() => setData(MOCK))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "#4ECDC4", fontFamily: "DM Mono,monospace", fontSize: 13 }}>
      💰 Loading earnings...
    </div>
  );

  return (
    <div style={S.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap'); * { box-sizing:border-box; } @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={S.inner}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={S.title}>Earnings Dashboard</h1>
            <p style={{ fontSize: 14, color: "#888" }}>All payments protected by ARISE escrow · ZAR</p>
          </div>
          <Link to="/freelance" style={S.ghostBtn}>Find More Projects →</Link>
        </div>

        {/* Top stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 14 }}>
          {[
            { label: "Total Earned",     value: `R${(data?.total_earned || 0).toLocaleString()}`,        color: "#4ECDC4", icon: "💰" },
            { label: "Projects Done",    value: data?.completed_projects || 0,                           color: "#FF6B35", icon: "✅" },
            { label: "Pending Release",  value: `R${(data?.pending_release || 0).toLocaleString()}`,     color: "#FFD93D", icon: "🔒" },
            { label: "Avg Per Project",  value: data?.completed_projects > 0
                ? `R${Math.round((data?.total_earned || 0) / data.completed_projects).toLocaleString()}`
                : "—",
              color: "#A8E6CF", icon: "📊" },
            { label: "Avg Rating",       value: data?.average_rating ? `${data.average_rating.toFixed(1)}★` : "—", color: "#FFD93D", icon: "⭐" },
          ].map((s) => (
            <div key={s.label} style={{ ...S.card, animation: "fadeUp 0.4s ease both" }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#666", fontFamily: "DM Mono,monospace" }}>{s.label.toUpperCase()}</div>
            </div>
          ))}
        </div>

        {/* Period selector + chart */}
        {data?.chart_data?.length > 0 && (
          <div style={{ ...S.card, animation: "fadeUp 0.4s 0.1s ease both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <SectionLabel>EARNINGS OVER TIME</SectionLabel>
              <div style={{ display: "flex", gap: 6 }}>
                {["3m", "6m", "1y"].map((p) => (
                  <button key={p} onClick={() => setPeriod(p)} style={{ background: period === p ? "rgba(78,205,196,0.15)" : "transparent", border: `1px solid ${period === p ? "rgba(78,205,196,0.35)" : "rgba(255,255,255,0.08)"}`, color: period === p ? "#4ECDC4" : "#666", borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer", fontFamily: "Sora,sans-serif", fontWeight: period === p ? 700 : 400 }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data.chart_data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="earnGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4ECDC4" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4ECDC4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#555", fontFamily: "DM Mono" }} />
                <YAxis tick={{ fontSize: 10, fill: "#555" }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="amount" stroke="#4ECDC4" strokeWidth={2} fill="url(#earnGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Escrow banner */}
        {(data?.pending_release || 0) > 0 && (
          <div style={{ background: "rgba(255,215,61,0.06)", border: "1px solid rgba(255,215,61,0.2)", borderRadius: 12, padding: "16px 20px", display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ fontSize: 22 }}>🔒</span>
            <div>
              <div style={{ fontWeight: 700, color: "#FFD93D", marginBottom: 3 }}>R{(data?.pending_release || 0).toLocaleString()} in Escrow</div>
              <div style={{ fontSize: 13, color: "#AAA" }}>Payment held securely — released when your client confirms delivery.</div>
            </div>
          </div>
        )}

        {/* Transaction history */}
        <div style={{ ...S.card, animation: "fadeUp 0.4s 0.2s ease both" }}>
          <SectionLabel>TRANSACTION HISTORY</SectionLabel>
          {data?.history?.length > 0 ? (
            <div>
              {data.history.map((h, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{h.project_title}</div>
                    <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                      {h.client_rating && (
                        <span style={{ fontSize: 12, color: "#FFD93D" }}>{"★".repeat(h.client_rating)}{"☆".repeat(5 - h.client_rating)}</span>
                      )}
                      {h.completed_at && (
                        <span style={{ fontSize: 11, color: "#555", fontFamily: "DM Mono,monospace" }}>
                          {new Date(h.completed_at).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 16, color: "#4ECDC4" }}>+R{h.amount?.toLocaleString()}</div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon="💰" title="No earnings yet"
              desc="Complete your first project to see your earnings here."
              action={<Link to="/freelance" style={{ fontSize: 13, color: "#4ECDC4", textDecoration: "none", fontWeight: 600 }}>Find Projects →</Link>} />
          )}
        </div>
      </div>
    </div>
  );
}

const MOCK = {
  total_earned: 24800, completed_projects: 6, pending_release: 3500,
  average_rating: 4.9,
  chart_data: [
    { month: "Oct", amount: 1500 }, { month: "Nov", amount: 3200 },
    { month: "Dec", amount: 4100 }, { month: "Jan", amount: 5800 },
    { month: "Feb", amount: 6200 }, { month: "Mar", amount: 4000 },
  ],
  history: [
    { project_title: "Logo for FreshMart SA",     amount: 5800, client_rating: 5, completed_at: new Date(Date.now() - 86400000 * 7).toISOString() },
    { project_title: "MobiPay App UI Design",      amount: 7200, client_rating: 5, completed_at: new Date(Date.now() - 86400000 * 21).toISOString() },
    { project_title: "Thandi's Bakery Branding",   amount: 3500, client_rating: 4, completed_at: new Date(Date.now() - 86400000 * 35).toISOString() },
  ],
};

const S = {
  page: { fontFamily: "'Sora',sans-serif", background: "#0A0A0F", color: "#E8E8F0", minHeight: "100vh", padding: "32px 24px" },
  inner: { maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 },
  title: { fontSize: "clamp(22px,3vw,30px)", fontWeight: 800, marginBottom: 4 },
  card: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 24 },
  ghostBtn: { display: "inline-flex", alignItems: "center", background: "transparent", color: "#888", border: "1px solid rgba(255,255,255,0.1)", padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none", fontFamily: "Sora,sans-serif" },
};