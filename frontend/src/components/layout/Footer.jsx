import { Link } from "react-router-dom";
export default function Footer() {
  return (
    <footer style={{ background:"rgba(255,255,255,0.02)", borderTop:"1px solid rgba(255,255,255,0.06)", padding:"24px", fontFamily:"Sora,sans-serif" }}>
      <div style={{ maxWidth:1100, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
        <div style={{ fontSize:14, fontWeight:800, color:"#E8E8F0" }}>⚡ ARISE</div>
        <div style={{ display:"flex", gap:20 }}>
          {[{to:"/about",l:"About"},{to:"/safety",l:"Safety"},{to:"/govlink/login",l:"GovLink"}].map(({to,l}) => (
            <Link key={to} to={to} style={{ fontSize:12, color:"#555", textDecoration:"none" }}>{l}</Link>
          ))}
        </div>
        <div style={{ fontSize:11, color:"#444", fontFamily:"DM Mono,monospace" }}>© 2026 ARISE · Code4Mzansi · Powered by Huawei Cloud</div>
      </div>
    </footer>
  );
}