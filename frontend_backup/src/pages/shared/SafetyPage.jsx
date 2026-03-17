import { Link } from "react-router-dom";

const FEATURES = [
  { icon:"🚫", title:"Never pay upfront",        desc:"Legitimate employers will never ask for fees to apply, for equipment, or for training before starting work. This is always a scam." },
  { icon:"🔒", title:"Stay inside ARISE",         desc:"All messages happen inside ARISE until both parties agree to share contacts. Never move conversations to WhatsApp before this step." },
  { icon:"✅", title:"Check employer badges",     desc:"Only apply to postings from Verified Employers (green badge). Unverified employers are clearly flagged — proceed with extreme caution." },
  { icon:"🛡️", title:"Escrow protects you",      desc:"As a freelancer, all payments are held in escrow until you deliver. Never accept payment outside ARISE for work posted here." },
  { icon:"🚩", title:"Report suspicious posts",  desc:"If a job looks fake, offers unrealistic pay, or asks for personal documents upfront — use the 🚩 flag button immediately." },
  { icon:"🤝", title:"Investors are verified",   desc:"On ARISE, all investors complete identity and mandate verification before accessing your profile. You control when contact is shared." },
];

const WARNING_SIGNS = [
  "Job offers an unusually high salary with no experience required",
  "Employer asks you to pay for a 'starter kit', 'training', or 'registration'",
  "Job requires you to travel to an unknown location before contract signing",
  "Contact happens only via WhatsApp with no verifiable company details",
  "Job description is vague but salary promises are very specific and large",
  "Employer asks for your banking details or ID number before an interview",
  "You are asked to recruit other people and earn a commission doing so",
];

const CONTACTS = [
  { org:"SAPS Emergency",              number:"10111",          desc:"Emergency police response",            type:"emergency" },
  { org:"Human Trafficking Hotline",   number:"0800 222 777",   desc:"Free, toll-free, 24/7",                type:"trafficking" },
  { org:"SAPS Crime Stop",             number:"08600 10111",    desc:"Report crimes anonymously",            type:"crime" },
  { org:"Gender Violence Helpline",    number:"0800 428 428",   desc:"GBV support, free, 24/7",              type:"gbv" },
  { org:"ARISE Safety Report",         number:"safety@arise.co.za", desc:"Report suspicious listings to us", type:"arise" },
];

export default function SafetyPage() {
  return (
    <div style={S.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap'); *{box-sizing:border-box} @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Nav */}
      <nav style={{ padding:"16px 24px", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <Link to="/" style={{ fontWeight:800, fontSize:18, color:"#E8E8F0", textDecoration:"none" }}>⚡ ARISE</Link>
        <Link to="/login" style={{ color:"#888", textDecoration:"none", fontSize:14 }}>Login →</Link>
      </nav>

      <div style={S.inner}>
        {/* Header */}
        <div style={{ display:"flex", gap:16, alignItems:"flex-start", animation:"fadeUp 0.4s ease forwards" }}>
          <div style={{ width:60, height:60, borderRadius:14, background:"rgba(78,205,196,0.1)", border:"1px solid rgba(78,205,196,0.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:30, flexShrink:0 }}>🛡️</div>
          <div>
            <h1 style={{ fontSize:"clamp(26px,4vw,40px)", fontWeight:900, marginBottom:8 }}>ARISE Safety</h1>
            <p style={{ fontSize:15, color:"#888", lineHeight:1.7, maxWidth:600 }}>
              ARISE is built to structurally prevent job scams, human trafficking, and exploitation. Here's how we protect you — and how you can protect yourself.
            </p>
          </div>
        </div>

        {/* How ARISE protects you */}
        <div style={{ animation:"fadeUp 0.4s 0.05s ease both" }}>
          <div style={S.sLabel}>HOW ARISE PROTECTS YOU</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:14 }}>
            {FEATURES.map((f) => (
              <div key={f.title} style={{ ...S.card, display:"flex", gap:14 }}>
                <div style={{ width:44, height:44, borderRadius:10, background:"rgba(78,205,196,0.08)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>{f.icon}</div>
                <div>
                  <div style={{ fontWeight:700, fontSize:14, marginBottom:5 }}>{f.title}</div>
                  <div style={{ fontSize:13, color:"#888", lineHeight:1.6 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Warning signs */}
        <div style={{ background:"rgba(255,107,53,0.05)", border:"1px solid rgba(255,107,53,0.2)", borderRadius:14, padding:24, animation:"fadeUp 0.4s 0.1s ease both" }}>
          <div style={S.sLabel}>⚠ WARNING SIGNS — LEAVE & REPORT IMMEDIATELY</div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {WARNING_SIGNS.map((w) => (
              <div key={w} style={{ display:"flex", gap:10 }}>
                <span style={{ color:"#FF6B35", fontSize:16, flexShrink:0 }}>✗</span>
                <span style={{ fontSize:14, color:"#CCC" }}>{w}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Huawei NLP scan */}
        <div style={{ ...S.card, borderColor:"rgba(255,107,53,0.2)", background:"rgba(255,107,53,0.04)", animation:"fadeUp 0.4s 0.15s ease both" }}>
          <div style={S.sLabel}>🤖 POWERED BY HUAWEI NLP</div>
          <h3 style={{ fontWeight:800, fontSize:18, marginBottom:8 }}>Every job posting is scanned before it goes live.</h3>
          <p style={{ fontSize:14, color:"#AAA", lineHeight:1.7 }}>
            ARISE uses Huawei NLP to scan all job postings for trafficking red flags, scam patterns, and misleading content. Postings that trigger critical risk indicators are automatically blocked. Medium-risk postings are manually reviewed by the ARISE safety team before approval.
          </p>
        </div>

        {/* Emergency contacts */}
        <div style={{ ...S.card, animation:"fadeUp 0.4s 0.2s ease both" }}>
          <div style={S.sLabel}>EMERGENCY CONTACTS — SOUTH AFRICA</div>
          <div style={{ display:"flex", flexDirection:"column" }}>
            {CONTACTS.map((c) => (
              <div key={c.org} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"13px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:14 }}>{c.org}</div>
                  <div style={{ fontSize:12, color:"#666" }}>{c.desc}</div>
                </div>
                <div style={{ fontSize:16, fontWeight:800, color:"#FF6B35", fontFamily:"DM Mono,monospace" }}>{c.number}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign:"center", padding:"24px 0 48px", animation:"fadeUp 0.4s 0.25s ease both" }}>
          <p style={{ fontSize:14, color:"#888", marginBottom:20 }}>Informed and ready? Start applying to verified, safe jobs on ARISE.</p>
          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <Link to="/signup" style={{ background:"#FF6B35", color:"#fff", textDecoration:"none", padding:"13px 28px", borderRadius:8, fontWeight:700, fontSize:14, fontFamily:"Sora,sans-serif" }}>
              Create Your TrustID →
            </Link>
            <Link to="/" style={{ background:"transparent", color:"#888", border:"1px solid rgba(255,255,255,0.1)", textDecoration:"none", padding:"13px 28px", borderRadius:8, fontSize:14, fontFamily:"Sora,sans-serif" }}>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const S = {
  page: { fontFamily:"'Sora',sans-serif", background:"#0A0A0F", color:"#E8E8F0", minHeight:"100vh" },
  inner: { maxWidth:960, margin:"0 auto", padding:"40px 24px 80px", display:"flex", flexDirection:"column", gap:28 },
  card: { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:24 },
  sLabel: { fontSize:11, color:"#555", fontFamily:"DM Mono,monospace", fontWeight:700, letterSpacing:3, marginBottom:14 },
};