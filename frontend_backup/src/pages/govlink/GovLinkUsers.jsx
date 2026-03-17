import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import api from "../../services/api";

const MOCK = {
  total_users: 2847,
  avg_ecs_score: 387.2,
  persona_breakdown: { job_seeker:1203, freelancer:487, entrepreneur:641, employer:312, investor:89, mentor:115 },
  age_groups: { "18-24":623, "25-34":1197, "35-44":687, "45+":340 },
  province_breakdown: { Gauteng:1240, "Western Cape":487, "KwaZulu-Natal":398, "Eastern Cape":187, Limpopo:143, Other:392 },
  gender: { female:1623, male:1089, unspecified:135 },
  verification_rates: { identity_verified_pct:62.4, email_verified_pct:89.1, skill_assessed_pct:41.3, business_registered_pct:22.5 },
  ecs_distribution: { "0-299":1240, "300-499":891, "500-649":503, "650-749":148, "750+":65 },
  weekly_registrations: [
    {week:"W1 Jan",count:124},{week:"W2 Jan",count:187},{week:"W3 Jan",count:201},{week:"W4 Jan",count:178},
    {week:"W1 Feb",count:243},{week:"W2 Feb",count:289},{week:"W3 Feb",count:312},{week:"W4 Feb",count:334},
  ]
};

const PERSONA_COLORS = { job_seeker:"#FF6B35", freelancer:"#4ECDC4", entrepreneur:"#FFD93D", employer:"#A8E6CF", investor:"#888", mentor:"#666" };
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return <div style={{ background:"#1A1A2E", border:"1px solid rgba(255,107,53,0.3)", borderRadius:8, padding:"8px 12px" }}><div style={{ fontSize:10, color:"#888" }}>{label}</div><div style={{ fontSize:15, fontWeight:800, color:"#FF6B35" }}>{payload[0].value}</div></div>;
};

export default function GovLinkUsers() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/govlink/users").then(r => setData(r.data)).catch(() => setData(MOCK)).finally(() => setLoading(false));
  }, []);

  const d = data || MOCK;
  const personaData = Object.entries(d.persona_breakdown||{}).map(([k,v]) => ({ name:k.replace("_"," "), value:v, color:PERSONA_COLORS[k]||"#888" }));
  const genderTotal = (d.gender?.female||0) + (d.gender?.male||0) + (d.gender?.unspecified||0);

  return (
    <div style={S.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap'); *{box-sizing:border-box} @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={S.govHeader}>
        <div style={S.govInner}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <Link to="/govlink" style={{ fontSize:13, color:"#666", textDecoration:"none" }}>← Dashboard</Link>
            <div style={{ width:1, height:16, background:"rgba(255,255,255,0.1)" }} />
            <div style={{ fontWeight:700 }}>👥 User Analytics</div>
          </div>
          <div style={{ display:"flex", gap:6, alignItems:"center" }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:"#4ECDC4", boxShadow:"0 0 6px #4ECDC4" }} />
            <span style={{ fontSize:11, color:"#4ECDC4", fontFamily:"DM Mono,monospace" }}>LIVE</span>
          </div>
        </div>
      </div>

      <div style={S.inner}>
        {/* Top metrics */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:12, animation:"fadeUp 0.4s ease forwards" }}>
          {[
            { label:"Total Users",   value: d.total_users?.toLocaleString() || "2,847",  color:"#E8E8F0", icon:"👥" },
            { label:"Avg ECS Score", value: Math.round(d.avg_ecs_score || 387),           color:"#FF6B35", icon:"⭐" },
            { label:"Identity Verif", value:`${d.verification_rates?.identity_verified_pct || 62}%`, color:"#4ECDC4", icon:"🪪" },
            { label:"Email Verified", value:`${d.verification_rates?.email_verified_pct || 89}%`,    color:"#FFD93D", icon:"✉️" },
          ].map(s => (
            <div key={s.label} style={S.card}>
              <div style={{ fontSize:22, marginBottom:8 }}>{s.icon}</div>
              <div style={{ fontSize:24, fontWeight:800, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:10, color:"#555", fontFamily:"DM Mono,monospace" }}>{s.label.toUpperCase()}</div>
            </div>
          ))}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:16 }}>
          {/* Weekly registrations */}
          <div style={{ ...S.card, animation:"fadeUp 0.4s 0.05s ease both" }}>
            <div style={S.cardTitle}>WEEKLY REGISTRATIONS</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={d.weekly_registrations || []} margin={{ top:5, right:5, left:-20, bottom:5 }}>
                <XAxis dataKey="week" tick={{ fontSize:9, fill:"#555", fontFamily:"DM Mono" }} />
                <YAxis tick={{ fontSize:9, fill:"#555" }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#FF6B35" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gender */}
          <div style={{ ...S.card, animation:"fadeUp 0.4s 0.1s ease both" }}>
            <div style={S.cardTitle}>GENDER</div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {[{label:"Female",value:d.gender?.female||0,color:"#FF6B35"},{label:"Male",value:d.gender?.male||0,color:"#4ECDC4"},{label:"Other",value:d.gender?.unspecified||0,color:"#555"}].map(g => (
                <div key={g.label}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ fontSize:12, color:"#888" }}>{g.label}</span>
                    <span style={{ fontSize:12, fontWeight:700, color:g.color }}>{g.value?.toLocaleString()} ({genderTotal ? Math.round(g.value/genderTotal*100) : 0}%)</span>
                  </div>
                  <div style={{ height:4, background:"rgba(255,255,255,0.05)", borderRadius:2 }}>
                    <div style={{ height:"100%", width:genderTotal ? `${(g.value/genderTotal*100)}%` : "0%", background:g.color, borderRadius:2 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          {/* Persona breakdown */}
          <div style={{ ...S.card, animation:"fadeUp 0.4s 0.15s ease both" }}>
            <div style={S.cardTitle}>PERSONA BREAKDOWN</div>
            {personaData.map(p => (
              <div key={p.name} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ fontSize:13, color:"#AAA", textTransform:"capitalize" }}>{p.name}</span>
                <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                  <div style={{ width:80, height:4, background:"rgba(255,255,255,0.05)", borderRadius:2 }}>
                    <div style={{ height:"100%", width:`${(p.value/d.total_users)*100}%`, background:p.color, borderRadius:2 }} />
                  </div>
                  <span style={{ fontSize:13, fontWeight:700, color:p.color, minWidth:40, textAlign:"right" }}>{p.value?.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Province + verification */}
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div style={{ ...S.card, animation:"fadeUp 0.4s 0.2s ease both" }}>
              <div style={S.cardTitle}>VERIFICATION RATES</div>
              {[
                {label:"Identity verified",    pct: d.verification_rates?.identity_verified_pct  || 62, color:"#4ECDC4"},
                {label:"Email verified",       pct: d.verification_rates?.email_verified_pct     || 89, color:"#FFD93D"},
                {label:"Skill assessed",       pct: d.verification_rates?.skill_assessed_pct     || 41, color:"#FF6B35"},
                {label:"Business registered",  pct: d.verification_rates?.business_registered_pct|| 22, color:"#A8E6CF"},
              ].map(v => (
                <div key={v.label} style={{ marginBottom:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ fontSize:12, color:"#888" }}>{v.label}</span>
                    <span style={{ fontSize:12, fontWeight:700, color:v.color }}>{v.pct}%</span>
                  </div>
                  <div style={{ height:4, background:"rgba(255,255,255,0.05)", borderRadius:2 }}>
                    <div style={{ height:"100%", width:`${v.pct}%`, background:v.color, borderRadius:2 }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ ...S.card, animation:"fadeUp 0.4s 0.25s ease both" }}>
              <div style={S.cardTitle}>ECS DISTRIBUTION</div>
              {Object.entries(d.ecs_distribution||{}).map(([band, count]) => (
                <div key={band} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ fontSize:11, color:"#888", fontFamily:"DM Mono,monospace" }}>{band}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:"#FF6B35" }}>{count?.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const S = {
  page: { fontFamily:"'Sora',sans-serif", background:"#0A0A0F", color:"#E8E8F0", minHeight:"100vh" },
  govHeader: { background:"rgba(255,107,53,0.04)", borderBottom:"1px solid rgba(255,107,53,0.12)", padding:"0 24px" },
  govInner: { maxWidth:1200, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", height:56 },
  inner: { maxWidth:1100, margin:"0 auto", padding:"28px 24px", display:"flex", flexDirection:"column", gap:18 },
  card: { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:22 },
  cardTitle: { fontSize:11, color:"#555", fontFamily:"DM Mono,monospace", fontWeight:700, letterSpacing:2, marginBottom:14 },
};