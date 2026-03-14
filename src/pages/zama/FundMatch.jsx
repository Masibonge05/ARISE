import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

function EligibilityScore({ score, is_eligible }) {
  const color = score >= 80 ? "#4ECDC4" : score >= 60 ? "#FFD93D" : score >= 40 ? "#FF6B35" : "#666";
  const pct = score;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ position: "relative", width: 40, height: 40 }}>
        <svg viewBox="0 0 36 36" style={{ width: 40, height: 40, transform: "rotate(-90deg)" }}>
          <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
          <circle cx="18" cy="18" r="15" fill="none" stroke={color} strokeWidth="3" strokeDasharray={`${pct * 0.942} 94.2`} strokeLinecap="round" />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color }}>{score}%</div>
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color }}>{score >= 80 ? "High Match" : score >= 60 ? "Good Match" : score >= 40 ? "Partial Match" : "Low Match"}</div>
        {is_eligible && <div style={{ fontSize: 10, color: "#4ECDC4", fontFamily: "DM Mono, monospace" }}>✓ ELIGIBLE</div>}
      </div>
    </div>
  );
}

function FunderCard({ funder, onApply }) {
  const [expanded, setExpanded] = useState(false);
  const typeColors = { grant: "#4ECDC4", loan: "#FFD93D", loan_grant_hybrid: "#FF6B35" };
  const typeColor = typeColors[funder.type] || "#888";

  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${funder.is_eligible ? "rgba(78,205,196,0.2)" : "rgba(255,255,255,0.07)"}`, borderRadius: 14, padding: 20, transition: "all 0.2s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
            <span style={{ fontSize: 10, background: `${typeColor}15`, border: `1px solid ${typeColor}30`, borderRadius: 12, padding: "2px 8px", color: typeColor, fontWeight: 700, fontFamily: "DM Mono, monospace" }}>
              {funder.type.replace("_", " ").toUpperCase()}
            </span>
            {funder.is_eligible && <span style={{ fontSize: 10, background: "rgba(78,205,196,0.1)", border: "1px solid rgba(78,205,196,0.25)", borderRadius: 12, padding: "2px 8px", color: "#4ECDC4", fontWeight: 700 }}>✓ YOU QUALIFY</span>}
          </div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 3 }}>{funder.name}</div>
          <div style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>{funder.funder}</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#FFD93D" }}>Up to R{funder.max_amount?.toLocaleString()}</div>
        </div>
        <EligibilityScore score={funder.eligibility_score} is_eligible={funder.is_eligible} />
      </div>

      {/* Eligibility reasons */}
      <div style={{ marginTop: 14, padding: 14, background: "rgba(255,255,255,0.02)", borderRadius: 8 }}>
        <div style={{ fontSize: 11, color: "#555", fontFamily: "DM Mono, monospace", marginBottom: 8 }}>WHY YOU MATCH</div>
        {funder.eligibility_reasons?.slice(0, 3).map((r, i) => (
          <div key={i} style={{ fontSize: 12, color: "#4ECDC4", marginBottom: 4, display: "flex", gap: 6 }}>
            <span>✓</span><span>{r}</span>
          </div>
        ))}
        {funder.disqualifiers?.length > 0 && funder.disqualifiers.map((d, i) => (
          <div key={i} style={{ fontSize: 12, color: "#FF8888", marginBottom: 4, display: "flex", gap: 6 }}>
            <span>✗</span><span>{d}</span>
          </div>
        ))}
      </div>

      {expanded && (
        <div style={{ marginTop: 12, fontSize: 13, color: "#888", lineHeight: 1.6, borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 12 }}>
          {funder.description}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        <button onClick={() => setExpanded(!expanded)} style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#888", borderRadius: 8, padding: "10px", fontSize: 12, cursor: "pointer", fontFamily: "Sora, sans-serif" }}>
          {expanded ? "Show less ▲" : "Show more ▼"}
        </button>
        <Link to={`/fundmatch/${funder.id}`} style={{ flex: 2, background: funder.is_eligible ? "#FFD93D" : "rgba(255,255,255,0.06)", color: funder.is_eligible ? "#0A0A0F" : "#888", borderRadius: 8, padding: "10px 16px", fontSize: 13, fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          {funder.is_eligible ? "Apply Now →" : "View Details"}
        </Link>
      </div>
    </div>
  );
}

export default function FundMatch() {
  const [funders, setFunders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [stats, setStats] = useState({ total: 0, eligible: 0 });

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/fundmatch/");
        setFunders(res.data.matches || []);
        setStats({ total: res.data.total || 0, eligible: res.data.eligible_count || 0 });
      } catch (e) {
        setFunders(MOCK_FUNDERS);
        setStats({ total: MOCK_FUNDERS.length, eligible: MOCK_FUNDERS.filter((f) => f.is_eligible).length });
      } finally { setLoading(false); }
    };
    fetch();
  }, []);

  const filtered = filter === "all" ? funders : filter === "eligible" ? funders.filter((f) => f.is_eligible) : funders.filter((f) => f.type === filter);

  return (
    <div style={styles.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap'); * { box-sizing:border-box; } @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>
      <div style={styles.inner}>
        {/* Header */}
        <div style={{ animation: "fadeUp 0.4s ease forwards" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: "linear-gradient(135deg, #FFD93D33, #FF6B3533)", border: "1px solid rgba(255,215,61,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>💡</div>
            <div>
              <h1 style={styles.title}>FundMatch</h1>
              <p style={{ fontSize: 13, color: "#888" }}>AI-powered grant matching · Powered by Huawei ModelArts</p>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 16 }}>
            {[
              { label: "Programs Found", value: stats.total, color: "#E8E8F0" },
              { label: "You Qualify For", value: stats.eligible, color: "#4ECDC4" },
              { label: "Total Funding Available", value: "R2.6M+", color: "#FFD93D" },
            ].map((s) => (
              <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "12px 20px" }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "#666", fontFamily: "DM Mono, monospace" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            { key: "all", label: "All Programs" },
            { key: "eligible", label: `Eligible (${stats.eligible})` },
            { key: "grant", label: "Grants" },
            { key: "loan", label: "Loans" },
          ].map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{ background: filter === f.key ? "rgba(255,215,61,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${filter === f.key ? "rgba(255,215,61,0.35)" : "rgba(255,255,255,0.08)"}`, color: filter === f.key ? "#FFD93D" : "#888", borderRadius: 20, padding: "7px 16px", fontSize: 13, fontWeight: filter === f.key ? 700 : 500, cursor: "pointer", fontFamily: "Sora, sans-serif", transition: "all 0.2s" }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Huawei badge */}
        <div style={{ background: "rgba(255,107,53,0.05)", border: "1px solid rgba(255,107,53,0.15)", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 16 }}>🤖</span>
          <span style={{ fontSize: 13, color: "#AAA" }}>
            Eligibility scores are calculated by <strong style={{ color: "#FF6B35" }}>Huawei ModelArts</strong> using your TrustID profile data — age, gender, location, business stage, and sector.
          </span>
        </div>

        {/* Results */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#666" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>💡</div>
            <div style={{ fontFamily: "DM Mono, monospace", fontSize: 13 }}>Matching your profile to funding programs...</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14 }}>
            {filtered.map((f, i) => (
              <div key={f.id} style={{ animation: `fadeUp 0.4s ${i * 0.05}s ease both` }}>
                <FunderCard funder={f} />
              </div>
            ))}
          </div>
        )}

        {filtered.length === 0 && !loading && (
          <div style={{ textAlign: "center", padding: 60, color: "#666" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>No results for this filter</div>
            <button onClick={() => setFilter("all")} style={{ color: "#FFD93D", background: "none", border: "none", cursor: "pointer", fontSize: 13, fontFamily: "Sora, sans-serif" }}>Show all programs</button>
          </div>
        )}
      </div>
    </div>
  );
}

const MOCK_FUNDERS = [
  { id: "nyda-001", name: "NYDA Youth Fund", funder: "National Youth Development Agency", type: "grant", max_amount: 100000, description: "Supports SA youth entrepreneurs aged 18-35.", eligibility_score: 87, is_eligible: true, eligibility_reasons: ["Age 23 meets requirement", "SA citizenship confirmed", "All sectors eligible"], disqualifiers: [] },
  { id: "wdf-001", name: "Women Development Fund", funder: "Dept. of Women, Youth & Persons with Disabilities", type: "grant", max_amount: 250000, description: "Empowers women entrepreneurs.", eligibility_score: 92, is_eligible: true, eligibility_reasons: ["Female-owned business", "SA citizen", "All sectors eligible"], disqualifiers: [] },
  { id: "sefa-001", name: "SEFA Micro Finance", funder: "Small Enterprise Finance Agency", type: "loan", max_amount: 50000, description: "Micro loans for micro enterprises.", eligibility_score: 78, is_eligible: true, eligibility_reasons: ["No CIPC required", "All sectors eligible", "SA citizen"], disqualifiers: [] },
  { id: "idc-001", name: "IDC Youth Empowerment Scheme", funder: "Industrial Development Corporation", type: "loan", max_amount: 1000000, description: "Financing for youth-owned enterprises.", eligibility_score: 48, is_eligible: false, eligibility_reasons: ["Age meets requirement"], disqualifiers: ["Manufacturing/tech sector required", "CIPC registration required"] },
];

const styles = {
  page: { fontFamily: "'Sora', sans-serif", background: "#0A0A0F", color: "#E8E8F0", minHeight: "100vh", padding: "32px 24px" },
  inner: { maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 },
  title: { fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 800 },
};