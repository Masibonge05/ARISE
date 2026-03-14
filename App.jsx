import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

function ComingSoon({ page }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", flexDirection:"column", gap:16 }}>
      <div style={{ fontSize:32, color:"#FF6B35" }}>⚡ ARISE</div>
      <div style={{ color:"#888" }}>{page} — coming soon</div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<ComingSoon page="Landing Page" />} />
          <Route path="/login" element={<ComingSoon page="Login" />} />
          <Route path="/signup" element={<ComingSoon page="Sign Up" />} />
          <Route path="/dashboard" element={<ComingSoon page="Dashboard" />} />
          <Route path="*" element={<ComingSoon page="404 Not Found" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
