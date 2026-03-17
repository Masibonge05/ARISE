import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

// SA Province coordinates for visual map layout
const PROVINCE_POSITIONS = {
  "Gauteng":       { x: 62, y: 45, size: 38 },
  "Western Cape":  { x: 22, y: 78, size: 34 },
  "KwaZulu-Natal": { x: 76, y: 60, size: 32 },
  "Eastern Cape":  { x: 58, y: 74, size: 30 },
  "Limpopo":       { x: 64, y: 22, size: 28 },
  "Mpumalanga":    { x: 76, y: 36, size: 26 },
  "North West":    { x: 46, y: 34, size: 26 },
  "Free State":    { x: 54, y: 58, size: 28 },
  "Northern Cape": { x: 34, y: 55, size: 26 },
};

const MOCK_PROVINCES = [
  { province: "Gauteng", total_users: 1240, businesses: 187, entrepreneurs: 284, average_ecs_score: 412 },
  { province: "Western Cape", total_users: 487, businesses: 72, entrepreneurs: 108, average_ecs_score: 445 },
  { province: "KwaZulu-Natal", total_users: 398, businesses: 54, entrepreneurs: 89, average_ecs_score: 378 },
  { province: "Eastern Cape", total_users: 187, businesses: 28, entrepreneurs: 42, average_ecs_score: 334 },
  { province: "Limpopo", total_users: 143, businesses: 18, entrepreneurs: 34, average_ecs_score: 298 },
  { province: "Mpumalanga", total_users: 124, businesses: 21, entrepreneurs: 29, average_ecs_score: 312 },
  { province: "North West", total_users: 112, businesses: 16, entrepreneurs: 26, average_ecs_score: 289 },
  { province: "Free State", total_users: 98, businesses: 13, entrepreneurs: 22, average_ecs_score: 276 },
  { province: "Northern Cape", total_users: 58, businesses: 8, entrepreneurs: 14, average_ecs_score: 254 },
];

export default function GovLinkMap() {
  const [provinces, setProvinces] = useState([]);
  const [selected, setSelected] = useState(null);
  const [metric, setMetric] = useState("total_users");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/govlink/map");
        setProvinces(res.data.provinces?.length ? res.data.provinces : MOCK_PROVINCES);
      } catch { setProvinces(MOCK_PROVINCES); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const maxValue = Math.max(...provinces.map((p) => p[metric] || 0), 1);
  const selectedData = selected ? provinces.find((p) => p.province === selected) : null;

  const getColor = (value) => {
    const pct = value / maxValue;
    if (pct > 0.7) return "#FF6B35";
    if (pct > 0.4) return "#FFD93D";
    if (pct > 0.2) return "#4ECDC4";
    return "#334";
  };

  const metricLabels = {
    total_users: "Total Users",
    businesses: "Businesses",
    entrepreneurs: "Entrepreneurs",
    average_ecs_score: "Avg ECS Score",
  };

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        .province-bubble { cursor: pointer; transition: all 0.2s; }
        .province-bubble:hover { filter: brightness(1.3); }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { transform:scale(1); } 50% { transform:scale(1.05); } }
      `}</style>

      {/* GovLink header */}
      <div style={styles.govHeader}>
        <div style={styles.govHeaderInner}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Link to="/govlink" style={{ fontSize: 13, color: "#666", textDecoration: "none" }}>← Dashboard</Link>
            <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.1)" }} />
            <div style={{ fontWeight: 700 }}>🗺 Provincial Breakdown</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {Object.entries(metricLabels).map(([key, label]) => (
              <button key={key} onClick={() => setMetric(key)} style={{ background: metric === key ? "rgba(255,107,53,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${metric === key ? "rgba(255,107,53,0.35)" : "rgba(255,255,255,0.08)"}`, color: metric === key ? "#FF6B35" : "#888", borderRadius: 6, padding: "6px 12px", fontSize: 12, cursor: "pointer", fontFamily: "Sora, sans-serif", fontWeight: metric === key ? 700 : 400 }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={styles.inner}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, animation: "fadeUp 0.4s ease forwards" }}>
          {/* Map visualization */}
          <div style={styles.mapCard}>
            <div style={{ fontSize: 11, color: "#555", fontFamily: "DM Mono, monospace", fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>
              SOUTH AFRICA · {metricLabels[metric].toUpperCase()}
            </div>

            {/* SVG bubble map */}
            <div style={{ position: "relative", width: "100%", paddingBottom: "60%", background: "rgba(255,255,255,0.02)", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)" }}>
              <svg viewBox="0 0 100 60" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                {/* SA outline simplified */}
                <path d="M20,8 L85,8 L92,20 L88,35 L80,50 L65,58 L40,58 L25,52 L15,38 L12,22 Z" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.3" />

                {provinces.map((p) => {
                  const pos = PROVINCE_POSITIONS[p.province];
                  if (!pos) return null;
                  const value = p[metric] || 0;
                  const pct = value / maxValue;
                  const radius = 3 + pct * 5;
                  const color = getColor(value);
                  const isSelected = selected === p.province;

                  return (
                    <g key={p.province} className="province-bubble" onClick={() => setSelected(isSelected ? null : p.province)}>
                      <circle cx={pos.x} cy={pos.y} r={isSelected ? radius + 1.5 : radius} fill={color} opacity={isSelected ? 1 : 0.7} style={{ animation: isSelected ? "pulse 1.5s infinite" : "none" }} />
                      <circle cx={pos.x} cy={pos.y} r={isSelected ? radius + 3 : radius + 1} fill="none" stroke={color} strokeWidth="0.5" opacity={isSelected ? 0.5 : 0.3} />
                      <text x={pos.x} y={pos.y + radius + 2.5} textAnchor="middle" fill="#AAA" fontSize="2" fontFamily="DM Mono">{p.province.split(" ")[0]}</text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Legend */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14 }}>
              <span style={{ fontSize: 11, color: "#555" }}>Low</span>
              <div style={{ flex: 1, height: 6, borderRadius: 3, background: "linear-gradient(90deg, #334, #4ECDC4, #FFD93D, #FF6B35)" }} />
              <span style={{ fontSize: 11, color: "#555" }}>High</span>
            </div>
          </div>

          {/* Rankings + selected detail */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Selected province detail */}
            {selectedData && (
              <div style={{ background: "rgba(255,107,53,0.06)", border: "1px solid rgba(255,107,53,0.2)", borderRadius: 14, padding: 20 }}>
                <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 12, color: "#FF6B35" }}>{selectedData.province}</div>
                {[
                  { label: "Total Users", value: selectedData.total_users?.toLocaleString() },
                  { label: "Businesses", value: selectedData.businesses?.toLocaleString() },
                  { label: "Entrepreneurs", value: selectedData.entrepreneurs?.toLocaleString() },
                  { label: "Avg ECS Score", value: selectedData.average_ecs_score },
                ].map((m) => (
                  <div key={m.label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ fontSize: 12, color: "#888" }}>{m.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#E8E8F0" }}>{m.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Rankings list */}
            <div style={styles.card}>
              <div style={{ fontSize: 11, color: "#555", fontFamily: "DM Mono, monospace", fontWeight: 700, letterSpacing: 2, marginBottom: 14 }}>
                RANKING BY {metricLabels[metric].toUpperCase()}
              </div>
              {[...provinces].sort((a, b) => (b[metric] || 0) - (a[metric] || 0)).map((p, i) => {
                const value = p[metric] || 0;
                const pct = (value / maxValue) * 100;
                const color = getColor(value);
                return (
                  <div key={p.province} onClick={() => setSelected(selected === p.province ? null : p.province)} style={{ padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 10, color: "#555", fontFamily: "DM Mono, monospace", width: 14 }}>{i + 1}</span>
                        <span style={{ fontSize: 12, fontWeight: selected === p.province ? 700 : 500, color: selected === p.province ? "#FF6B35" : "#CCC" }}>{p.province}</span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color }}>{metric === "average_ecs_score" ? value : value.toLocaleString()}</span>
                    </div>
                    <div style={{ height: 3, background: "rgba(255,255,255,0.05)", borderRadius: 2, marginLeft: 22 }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 2, transition: "width 0.8s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { fontFamily: "'Sora', sans-serif", background: "#0A0A0F", color: "#E8E8F0", minHeight: "100vh" },
  govHeader: { background: "rgba(255,107,53,0.04)", borderBottom: "1px solid rgba(255,107,53,0.12)", padding: "0 24px" },
  govHeaderInner: { maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", height: 60, flexWrap: "wrap", gap: 8 },
  inner: { maxWidth: 1200, margin: "0 auto", padding: "32px 24px" },
  mapCard: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 24 },
  card: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 20 },
};