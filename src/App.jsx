import { BrowserRouter, Routes, Route } from "react-router-dom";


function ComingSoon({ page }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", flexDirection:"column", gap:16, background:"#0A0A0F" }}>
      <div style={{ fontSize:48, color:"#FF6B35" }}>⚡</div>
      <div style={{ fontSize:28, fontWeight:800, color:"#E8E8F0" }}>ARISE</div>
      <div style={{ color:"#888", fontSize:14 }}>{page}</div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ComingSoon page="Landing Page" />} />
        <Route path="/login" element={<ComingSoon page="Login" />} />
        <Route path="/signup" element={<ComingSoon page="Sign Up" />} />
        <Route path="/dashboard" element={<ComingSoon page="Dashboard" />} />
        <Route path="*" element={<ComingSoon page="Page Not Found" />} />
      </Routes>
    </BrowserRouter>
  );
}
