import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying"); // verifying | success | failed | invalid

  useEffect(() => {
    const token = params.get("token");
    if (!token) { setStatus("invalid"); return; }
    api.post("/auth/verify-email", { token })
      .then(() => {
        setStatus("success");
        setTimeout(() => navigate("/dashboard"), 3000);
      })
      .catch(() => setStatus("failed"));
  }, []);

  const config = {
    verifying: { icon:"⏳", color:"#FFD93D", title:"Verifying your email…",    desc:"Please wait a moment.",                                     anim:"pulse 1.5s infinite" },
    success:   { icon:"✅", color:"#4ECDC4", title:"Email Verified!",           desc:"You've earned +25 ECS points. Redirecting to dashboard…",    anim:"pop 0.5s ease" },
    failed:    { icon:"❌", color:"#FF6B35", title:"Verification Failed",        desc:"The link may have expired. Request a new one from settings.", anim:"none" },
    invalid:   { icon:"🔗", color:"#888",    title:"Invalid Link",              desc:"This verification link is invalid or has already been used.", anim:"none" },
  }[status];

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing:border-box; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes pop { 0%{transform:scale(0)} 70%{transform:scale(1.2)} 100%{transform:scale(1)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* Background glow */}
      <div style={{ position:"fixed", top:"30%", left:"50%", transform:"translateX(-50%)", width:400, height:400, borderRadius:"50%", background:`radial-gradient(circle, ${config.color}15 0%, transparent 70%)`, pointerEvents:"none" }} />

      <div style={S.card}>
        {/* Logo */}
        <Link to="/" style={S.logo}>⚡ ARISE</Link>

        {/* Icon */}
        <div style={{ fontSize:72, marginBottom:20, animation:config.anim, display:"inline-block" }}>
          {config.icon}
        </div>

        {/* Title */}
        <h1 style={{ fontSize:28, fontWeight:800, marginBottom:10, color:config.color, animation:"fadeUp 0.4s ease" }}>
          {config.title}
        </h1>
        <p style={{ fontSize:14, color:"#888", marginBottom:28, lineHeight:1.7, animation:"fadeUp 0.4s 0.1s ease both" }}>
          {config.desc}
        </p>

        {/* ECS award for success */}
        {status === "success" && (
          <div style={{ background:"rgba(255,107,53,0.1)", border:"1px solid rgba(255,107,53,0.2)", borderRadius:10, padding:"12px 20px", marginBottom:24, animation:"fadeUp 0.4s 0.2s ease both" }}>
            <div style={{ fontSize:11, color:"#555", fontFamily:"DM Mono,monospace", marginBottom:4 }}>ECS POINTS AWARDED</div>
            <div style={{ fontSize:32, fontWeight:900, color:"#FF6B35" }}>+25</div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display:"flex", flexDirection:"column", gap:10, width:"100%", animation:"fadeUp 0.4s 0.3s ease both" }}>
          {status === "success" && (
            <Link to="/dashboard" style={S.primaryBtn}>Go to Dashboard →</Link>
          )}
          {status === "failed" && (
            <>
              <Link to="/settings" style={S.primaryBtn}>Resend Verification Email</Link>
              <Link to="/login" style={S.ghostBtn}>Back to Login</Link>
            </>
          )}
          {status === "invalid" && (
            <Link to="/login" style={S.primaryBtn}>Go to Login →</Link>
          )}
        </div>
      </div>
    </div>
  );
}

const S = {
  page: { fontFamily:"'Sora',sans-serif", background:"#0A0A0F", color:"#E8E8F0", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px", position:"relative", overflow:"hidden" },
  card: { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:18, padding:"40px 36px", maxWidth:400, width:"100%", textAlign:"center", position:"relative", zIndex:1 },
  logo: { display:"inline-block", fontSize:18, fontWeight:800, color:"#E8E8F0", textDecoration:"none", marginBottom:28 },
  primaryBtn: { display:"flex", alignItems:"center", justifyContent:"center", background:"#FF6B35", color:"#fff", textDecoration:"none", padding:"13px", borderRadius:8, fontSize:14, fontWeight:700, fontFamily:"Sora,sans-serif" },
  ghostBtn: { display:"flex", alignItems:"center", justifyContent:"center", background:"transparent", color:"#888", border:"1px solid rgba(255,255,255,0.1)", textDecoration:"none", padding:"12px", borderRadius:8, fontSize:14 },
};