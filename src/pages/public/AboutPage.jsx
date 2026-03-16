import { Link } from "react-router-dom";

const FEATURES = [
  { icon:"🪪", title:"TrustID",          desc:"Verified digital identity. SA ID read by Huawei OCR. No fake profiles." },
  { icon:"⭐", title:"ECS Score",         desc:"Entrepreneurship Credit Score 0–850. A new financial primitive for the unbanked." },
  { icon:"💼", title:"JobFeed",           desc:"AI-matched, scam-free jobs. Huawei NLP scans every posting before it goes live." },
  { icon:"🎨", title:"FreelanceMarket",   desc:"Find clients, get paid safely via escrow. Build a verified portfolio." },
  { icon:"🚀", title:"LaunchPad",         desc:"Register your business in 4 minutes. CIPC verified by Huawei OCR." },
  { icon:"💡", title:"FundMatch",         desc:"AI matches your TrustID to 47+ SA grant programs via Huawei ModelArts." },
  { icon:"🤝", title:"MentorNet",         desc:"Expert mentors matched via Huawei GES graph. B-BBEE funded — free for you." },
  { icon:"📈", title:"InvestorConnect",   desc:"Mutual-consent investor discovery. You're always in control." },
  { icon:"🏛️", title:"GovLink",          desc:"Real-time national impact dashboard for DSBD. Powered by Huawei APM." },
];

const HUAWEI_SERVICES = [
  { name:"ModelArts", desc:"Grant eligibility AI, job matching, skills scoring" },
  { name:"OCR",       desc:"SA ID, passport, certificate, CIPC reading" },
  { name:"NLP",       desc:"Scam detection, session notes, translation" },
  { name:"GES",       desc:"Knowledge graph for mentor & investor matching" },
  { name:"OBS",       desc:"Encrypted document vault with DEW/KMS" },
  { name:"SIS",       desc:"Voice-based language proficiency assessment" },
  { name:"APM",       desc:"Real-time platform monitoring for GovLink" },
  { name:"SMN",       desc:"ECS & investor interest push notifications" },
];

const PERSONAS = [
  { name:"Sphiwe", role:"Job Seeker",   color:"#FF6B35", emoji:"🎓", story:"Final-year engineering student. No formal CV. Needs to prove verified skills to employers — just truth, backed by technology." },
  { name:"Sipho",  role:"Freelancer",   color:"#4ECDC4", emoji:"🎨", story:"Self-taught designer from Soweto. Has real talent but no way to prove it. Needs safe payments and a verified portfolio." },
  { name:"Zama",   role:"Entrepreneur", color:"#FFD93D", emoji:"🚀", story:"Fashion entrepreneur from KZN. Brilliant idea, no funding, no connections. She needs a business identity, grants, mentors." },
];

export default function AboutPage() {
  return (
    <div style={S.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&family=DM+Mono:wght@400;500&display=swap'); *{box-sizing:border-box} @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <nav style={{ padding:"16px 24px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        <Link to="/" style={S.logoLink}>⚡ ARISE</Link>
        <div style={{ display:"flex", gap:12 }}>
          <Link to="/login"  style={S.navLink}>Login</Link>
          <Link to="/signup" style={S.ctaBtn}>Get Started →</Link>
        </div>
      </nav>

      <div style={S.inner}>
        <div style={{ textAlign:"center", padding:"64px 0 48px", animation:"fadeUp 0.5s ease forwards" }}>
          <div style={{ fontSize:11, color:"#FF6B35", fontFamily:"DM Mono,monospace", letterSpacing:3, marginBottom:14 }}>CODE4MZANSI 2026 · HUAWEI + DSBD</div>
          <h1 style={{ fontSize:"clamp(36px,6vw,64px)", fontWeight:900, lineHeight:1.1, marginBottom:20 }}>
            Built for <span style={{ color:"#FF6B35" }}>Mzansi's</span><br />next generation.
          </h1>
          <p style={{ fontSize:17, color:"#888", maxWidth:560, margin:"0 auto 32px", lineHeight:1.8 }}>
            AI-powered enterprise OS connecting SA's youth and women entrepreneurs to verified employment, freelance work, funding, mentorship, and investment — all built on trust.
          </p>
          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <Link to="/signup" style={S.primaryBtn}>Create Your TrustID →</Link>
            <Link to="/" style={S.ghostBtn}>See the Platform</Link>
          </div>
        </div>

        <div style={{ ...S.card, borderColor:"rgba(255,107,53,0.2)", background:"rgba(255,107,53,0.04)" }}>
          <div style={S.sLabel}>THE PROBLEM</div>
          <h2 style={{ fontSize:26, fontWeight:800, marginBottom:14 }}>South Africa has 32% youth unemployment.</h2>
          <p style={{ fontSize:15, color:"#AAA", lineHeight:1.8 }}>
            Every year, R7.8 billion in B-BBEE ED spend goes unclaimed. Youth entrepreneurs can't access grants because they lack a business identity. Job seekers are rejected because a CV doesn't prove anything. Freelancers get scammed. The missing piece isn't ambition — it's <strong style={{ color:"#E8E8F0" }}>trust infrastructure</strong>. ARISE builds it.
          </p>
        </div>

        <div>
          <div style={S.sLabel}>THREE PERSONAS. ONE PLATFORM.</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:14 }}>
            {PERSONAS.map(p => (
              <div key={p.name} style={{ ...S.card, borderColor:`${p.color}25` }}>
                <div style={{ fontSize:40, marginBottom:12 }}>{p.emoji}</div>
                <div style={{ fontSize:11, color:p.color, fontFamily:"DM Mono,monospace", fontWeight:700, letterSpacing:2, marginBottom:6 }}>{p.role.toUpperCase()}</div>
                <div style={{ fontSize:20, fontWeight:800, marginBottom:10, color:p.color }}>{p.name}</div>
                <p style={{ fontSize:13, color:"#888", lineHeight:1.7 }}>{p.story}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={S.sLabel}>PLATFORM FEATURES</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:12 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={S.card}>
                <div style={{ fontSize:28, marginBottom:10 }}>{f.icon}</div>
                <div style={{ fontWeight:700, fontSize:15, marginBottom:6 }}>{f.title}</div>
                <div style={{ fontSize:13, color:"#888", lineHeight:1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...S.card, borderColor:"rgba(255,107,53,0.2)" }}>
          <div style={S.sLabel}>POWERED BY HUAWEI CLOUD · 8 SERVICES</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:10 }}>
            {HUAWEI_SERVICES.map(svc => (
              <div key={svc.name} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, padding:"12px 16px" }}>
                <div style={{ fontWeight:700, fontSize:14, color:"#FF6B35", marginBottom:4 }}>{svc.name}</div>
                <div style={{ fontSize:12, color:"#666", lineHeight:1.5 }}>{svc.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign:"center", padding:"48px 0" }}>
          <h2 style={{ fontSize:32, fontWeight:900, marginBottom:12 }}>Ready to ARISE?</h2>
          <p style={{ fontSize:15, color:"#888", marginBottom:28 }}>Create your TrustID in 2 minutes. Free.</p>
          <Link to="/signup" style={S.primaryBtn}>Get Started — It's Free →</Link>
        </div>
      </div>
    </div>
  );
}

const S = {
  page: { fontFamily:"'Sora',sans-serif", background:"#0A0A0F", color:"#E8E8F0", minHeight:"100vh" },
  inner: { maxWidth:1100, margin:"0 auto", padding:"0 24px 80px", display:"flex", flexDirection:"column", gap:32 },
  card: { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:24 },
  sLabel: { fontSize:11, color:"#555", fontFamily:"DM Mono,monospace", fontWeight:700, letterSpacing:3, marginBottom:14 },
  logoLink: { fontSize:20, fontWeight:800, color:"#E8E8F0", textDecoration:"none" },
  navLink: { fontSize:14, color:"#888", textDecoration:"none", padding:"8px 16px" },
  ctaBtn: { background:"#FF6B35", color:"#fff", textDecoration:"none", padding:"8px 20px", borderRadius:8, fontSize:14, fontWeight:700 },
  primaryBtn: { display:"inline-flex", alignItems:"center", background:"#FF6B35", color:"#fff", textDecoration:"none", padding:"14px 32px", borderRadius:10, fontSize:15, fontWeight:800 },
  ghostBtn: { display:"inline-flex", alignItems:"center", background:"transparent", color:"#888", border:"1px solid rgba(255,255,255,0.1)", textDecoration:"none", padding:"14px 28px", borderRadius:10, fontSize:15 },
};