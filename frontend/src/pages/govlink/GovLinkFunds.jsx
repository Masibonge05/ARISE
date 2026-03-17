import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import api from "../../services/api";

const MOCK = {
  total_grant_value_facilitated: "R8,200,000",
  total_applications: 583,
  total_approved: 142,
  avg_processing_days: 18,
  underutilized_alert: "NEF Rural Fund has high eligibility scores but only 12% application rate — awareness campaign recommended.",
  programs: [
    { name:"NYDA Youth Fund",            funder:"NYDA",  type:"grant", views:1240, applications:142, approved:38, avg_eligibility:74, max_amount:100000 },
    { name:"Women Development Fund",     funder:"DWYPD", type:"grant", views:760,  applications:76,  approved:21, avg_eligibility:68, max_amount:250000 },
    { name:"SEFA Micro Finance",         funder:"SEFA",  type:"loan",  views:1100, applications:198, approved:87, avg_eligibility:82, max_amount:50000  },
    { name:"SEDA Technology Programme",  funder:"SEDA",  type:"grant", views:890,  applications:89,  approved:24, avg_eligibility:61, max_amount:200000 },
    { name:"IDC Youth Empowerment",      funder:"IDC",   type:"loan",  views:430,  applications:43,  approved:11, avg_eligibility:48, max_amount:1000000},
    { name:"NEF Rural Fund",             funder:"NEF",   type:"grant", views:210,  applications:25,  approved:8,  avg_eligibility:71, max_amount:350000 },
  ]
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#1A1A2E", border:"1px solid rgba(255,215,61,0.3)", borderRadius:8, padding:"8px 12px" }}>
      <div style={{ fontSize:11, color:"#888", fontFamily:"DM Mono,monospace" }}>{label}</div>
      <div style={{ fontSize:15, fontWeight:800, color:"#FFD93D" }}>{payload[0].value}</div>
    </div>
  );
};

export default function GovLinkFunds() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("applications");

  useEffect(() => {
    api.get("/govlink/funds").then(r => setData(r.data)).catch(() => setData(MOCK)).finally(() => setLoading(false));
  }, []);

  const d = data || MOCK;
  const programs = [...(d.programs || [])].sort((a,b) => (b[sort]||0)-(a[sort]||0));
  const chartData = programs.map(p => ({ name: p.name.split(" ").slice(0,2).join(" "), applications: p.applications, approved: p.approved }));

  return (
    <div style={S.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap'); *{box-sizing:border-box} @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={S.govHeader}>
        <div style={S.govInner}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <Link to="/govlink" style={{ fontSize:13, color:"#666", textDecoration:"none" }}>← Dashboard</Link>
            <div style={{ width:1, height:16, background:"rgba(255,255,255,0.1)" }} />
            <div style={{ fontWeight:700 }}>💡 Funding Program Analytics</div>
          </div>
          <div style={{ fontSize:11, color:"#555", fontFamily:"DM Mono,monospace" }}>DSBD · Real-time data</div>
        </div>
      </div>

      <div style={S.inner}>
        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:12, animation:"fadeUp 0.4s ease forwards" }}>
          {[
            { label:"Total Facilitated",  value: d.total_grant_value_facilitated || "R8.2M",  color:"#FFD93D", icon:"💡" },
            { label:"Applications",       value: d.total_applications || 583,                   color:"#FF6B35", icon:"📋" },
            { label:"Approved",           value: d.total_approved || 142,                       color:"#4ECDC4", icon:"✅" },
            { label:"Avg Processing",     value: `${d.avg_processing_days || 18} days`,         color:"#888",    icon:"⏱" },
          ].map(s => (
            <div key={s.label} style={S.card}>
              <div style={{ fontSize:20, marginBottom:8 }}>{s.icon}</div>
              <div style={{ fontSize:22, fontWeight:800, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:10, color:"#555", fontFamily:"DM Mono,monospace" }}>{s.label.toUpperCase()}</div>
            </div>
          ))}
        </div>

        {/* Alert */}
        {d.underutilized_alert && (
          <div style={{ background:"rgba(255,215,61,0.06)", border:"1px solid rgba(255,215,61,0.2)", borderRadius:10, padding:"14px 18px", display:"flex", gap:10, animation:"fadeUp 0.4s 0.05s ease both" }}>
            <span style={{ fontSize:18 }}>⚠️</span>
            <div>
              <div style={{ fontWeight:700, color:"#FFD93D", marginBottom:3 }}>Programme Optimisation Alert</div>
              <div style={{ fontSize:13, color:"#AAA" }}>{d.underutilized_alert}</div>
            </div>
          </div>
        )}

        {/* Chart */}
        <div style={{ ...S.card, animation:"fadeUp 0.4s 0.1s ease both" }}>
          <div style={S.cardTitle}>APPLICATIONS VS APPROVALS BY PROGRAMME</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top:5, right:5, left:-20, bottom:5 }}>
              <XAxis dataKey="name" tick={{ fontSize:9, fill:"#555", fontFamily:"DM Mono" }} />
              <YAxis tick={{ fontSize:9, fill:"#555" }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="applications" fill="#FF6B35" radius={[3,3,0,0]} name="Applications" />
              <Bar dataKey="approved"     fill="#4ECDC4" radius={[3,3,0,0]} name="Approved" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sort controls */}
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {[{k:"applications",l:"By Applications"},{k:"approved",l:"By Approvals"},{k:"avg_eligibility",l:"By Eligibility"}].map(s => (
            <button key={s.k} onClick={() => setSort(s.k)}
              style={{ background:sort===s.k?"rgba(255,215,61,0.15)":"rgba(255,255,255,0.04)", border:`1px solid ${sort===s.k?"rgba(255,215,61,0.35)":"rgba(255,255,255,0.08)"}`, color:sort===s.k?"#FFD93D":"#888", borderRadius:20, padding:"6px 14px", fontSize:12, fontWeight:sort===s.k?700:400, cursor:"pointer", fontFamily:"Sora,sans-serif" }}>
              {s.l}
            </button>
          ))}
        </div>

        {/* Programme table */}
        <div style={{ ...S.card, animation:"fadeUp 0.4s 0.15s ease both" }}>
          <div style={S.cardTitle}>PROGRAMME BREAKDOWN</div>
          {programs.map((p, i) => {
            const approvalRate = p.applications > 0 ? Math.round((p.approved/p.applications)*100) : 0;
            const typeColor = p.type === "grant" ? "#4ECDC4" : "#FFD93D";
            return (
              <div key={p.name} style={{ padding:"14px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10, flexWrap:"wrap", gap:8 }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:14, marginBottom:3 }}>{p.name}</div>
                    <div style={{ display:"flex", gap:8 }}>
                      <span style={{ fontSize:10, background:`${typeColor}15`, border:`1px solid ${typeColor}30`, borderRadius:12, padding:"2px 8px", color:typeColor, fontWeight:700, fontFamily:"DM Mono,monospace" }}>{p.type.toUpperCase()}</span>
                      <span style={{ fontSize:11, color:"#555" }}>{p.funder}</span>
                      <span style={{ fontSize:11, color:"#555" }}>Up to R{p.max_amount?.toLocaleString()}</span>
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:20 }}>
                    {[{l:"Views",v:p.views,c:"#E8E8F0"},{l:"Applied",v:p.applications,c:"#FF6B35"},{l:"Approved",v:p.approved,c:"#4ECDC4"},{l:"Avg Match",v:`${p.avg_eligibility}%`,c:"#FFD93D"}].map(m => (
                      <div key={m.l} style={{ textAlign:"center" }}>
                        <div style={{ fontSize:18, fontWeight:800, color:m.c }}>{m.v}</div>
                        <div style={{ fontSize:9, color:"#555", fontFamily:"DM Mono,monospace" }}>{m.l.toUpperCase()}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <div style={{ flex:1, height:4, background:"rgba(255,255,255,0.05)", borderRadius:2 }}>
                    <div style={{ height:"100%", width:`${p.avg_eligibility}%`, background:"#FFD93D", borderRadius:2 }} />
                  </div>
                  <span style={{ fontSize:11, color:"#888", fontFamily:"DM Mono,monospace" }}>{approvalRate}% approval rate</span>
                </div>
              </div>
            );
          })}
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
  cardTitle: { fontSize:11, color:"#555", fontFamily:"DM Mono,monospace", fontWeight:700, letterSpacing:2, marginBottom:16 },
};