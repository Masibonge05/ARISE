import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const NAV_LINKS = {
  job_seeker: [
    { to: "/dashboard", label: "Dashboard", icon: "⚡" },
    { to: "/jobs", label: "Jobs", icon: "💼" },
    { to: "/applications", label: "Applications", icon: "📋" },
    { to: "/skills", label: "Skills", icon: "🎯" },
  ],
  freelancer: [
    { to: "/dashboard", label: "Dashboard", icon: "⚡" },
    { to: "/freelance", label: "Projects", icon: "🔍" },
    { to: "/freelance/active", label: "Active", icon: "⚙️" },
    { to: "/freelance/earnings", label: "Earnings", icon: "💰" },
    { to: "/portfolio", label: "Portfolio", icon: "🎨" },
  ],
  entrepreneur: [
    { to: "/dashboard", label: "Dashboard", icon: "⚡" },
    { to: "/launchpad", label: "LaunchPad", icon: "🚀" },
    { to: "/fundmatch", label: "FundMatch", icon: "💡" },
    { to: "/mentors", label: "Mentors", icon: "🤝" },
    { to: "/investors", label: "Investors", icon: "📈" },
  ],
};

export default function Navbar({ govMode }) {
  const { user, logout, isJobSeeker, isFreelancer, isEntrepreneur, isGovernment } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const persona = isEntrepreneur ? "entrepreneur" : isFreelancer ? "freelancer" : "job_seeker";
  const links = govMode ? [] : (NAV_LINKS[persona] || NAV_LINKS.job_seeker);
  const isActive = (to) => location.pathname === to || location.pathname.startsWith(to + "/");

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        .nav-link { display:flex; align-items:center; gap:6px; padding:6px 12px; border-radius:8px; font-size:13px; font-weight:600; text-decoration:none; transition:all 0.15s; color:#666; white-space:nowrap; font-family:'Sora',sans-serif; }
        .nav-link:hover { color:#E8E8F0; background:rgba(255,255,255,0.05); }
        .nav-link.active { color:#FF6B35; background:rgba(255,107,53,0.1); }
        .nav-avatar { width:32px; height:32px; border-radius:50%; background:linear-gradient(135deg,#FF6B35,#FF3D00); display:flex; align-items:center; justifyContent:center; font-size:13px; font-weight:800; color:#fff; cursor:pointer; border:2px solid transparent; transition:all 0.2s; }
        .nav-avatar:hover { border-color:rgba(255,107,53,0.5); }
        .dropdown { position:absolute; top:calc(100% + 8px); right:0; background:#141420; border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:8px; min-width:200px; z-index:1000; box-shadow:0 16px 48px rgba(0,0,0,0.5); }
        .dropdown-item { display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:8px; font-size:13px; color:#888; cursor:pointer; transition:all 0.15s; text-decoration:none; font-family:'Sora',sans-serif; font-weight:500; width:100%; background:none; border:none; text-align:left; }
        .dropdown-item:hover { color:#E8E8F0; background:rgba(255,255,255,0.05); }
        .ecs-pill { display:inline-flex; align-items:center; gap:5px; background:rgba(255,107,53,0.1); border:1px solid rgba(255,107,53,0.2); border-radius:20px; padding:3px 10px; font-size:11px; font-weight:700; color:#FF6B35; font-family:'DM Mono',monospace; cursor:pointer; transition:all 0.2s; }
        .ecs-pill:hover { background:rgba(255,107,53,0.15); }
        @media (max-width:768px) { .nav-links-desktop { display:none !important; } }
      `}</style>

      <nav style={styles.nav}>
        <div style={styles.navInner}>
          {/* Logo */}
          <Link to={govMode ? "/govlink" : "/dashboard"} style={styles.logo}>
            <div style={styles.logoIcon}>⚡</div>
            <span style={styles.logoText}>ARISE</span>
            {govMode && <span style={{ fontSize: 10, color: "#FF6B35", fontFamily: "DM Mono, monospace", fontWeight: 700, marginLeft: 4 }}>GOVLINK</span>}
          </Link>

          {/* Desktop nav links */}
          <div className="nav-links-desktop" style={{ display: "flex", gap: 2, alignItems: "center" }}>
            {links.map((l) => (
              <Link key={l.to} to={l.to} className={`nav-link ${isActive(l.to) ? "active" : ""}`}>
                <span style={{ fontSize: 14 }}>{l.icon}</span>
                {l.label}
              </Link>
            ))}
            {govMode && (
              <>
                <Link to="/govlink" className={`nav-link ${isActive("/govlink") ? "active" : ""}`}>🏛️ Dashboard</Link>
                <Link to="/govlink/map" className={`nav-link ${isActive("/govlink/map") ? "active" : ""}`}>🗺 Map</Link>
                <Link to="/govlink/users" className={`nav-link ${isActive("/govlink/users") ? "active" : ""}`}>👥 Users</Link>
                <Link to="/govlink/funds" className={`nav-link ${isActive("/govlink/funds") ? "active" : ""}`}>💰 Funding</Link>
              </>
            )}
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* ECS score pill */}
            {!govMode && (
              <Link to="/ecs" className="ecs-pill">
                ⭐ {user?.ecs_score || 0}
              </Link>
            )}

            {/* Messages */}
            {!govMode && (
              <Link to="/messages" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 8, color: "#666", textDecoration: "none", fontSize: 16, transition: "all 0.15s", background: isActive("/messages") ? "rgba(255,107,53,0.1)" : "transparent" }}>
                💬
              </Link>
            )}

            {/* Notifications */}
            <div style={{ position: "relative" }}>
              <button onClick={() => setNotifOpen(!notifOpen)} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 8, background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 16, position: "relative" }}>
                🔔
                <span style={{ position: "absolute", top: 4, right: 4, width: 7, height: 7, borderRadius: "50%", background: "#FF6B35", border: "1.5px solid #0A0A0F" }} />
              </button>
              {notifOpen && (
                <div className="dropdown" onClick={() => setNotifOpen(false)}>
                  <div style={{ padding: "8px 12px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 4 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>Notifications</div>
                  </div>
                  {[
                    { icon: "💼", text: "Tech4Africa viewed your profile", time: "2h ago" },
                    { icon: "⭐", text: "ECS score updated: +15 points", time: "Yesterday" },
                    { icon: "✅", text: "Email verification complete", time: "2d ago" },
                  ].map((n, i) => (
                    <div key={i} className="dropdown-item">
                      <span style={{ fontSize: 16 }}>{n.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, color: "#CCC" }}>{n.text}</div>
                        <div style={{ fontSize: 10, color: "#555", fontFamily: "DM Mono, monospace" }}>{n.time}</div>
                      </div>
                    </div>
                  ))}
                  <Link to="/notifications" className="dropdown-item" style={{ justifyContent: "center", color: "#FF6B35", marginTop: 4, fontSize: 12 }}>View all →</Link>
                </div>
              )}
            </div>

            {/* Avatar + dropdown */}
            <div style={{ position: "relative" }}>
              <div className="nav-avatar" onClick={() => setMenuOpen(!menuOpen)} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                {user?.profile_photo_url
                  ? <img src={user.profile_photo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                  : <span style={{ fontSize: 13, fontWeight: 800 }}>{user?.first_name?.[0]}{user?.last_name?.[0]}</span>
                }
              </div>
              {menuOpen && (
                <div className="dropdown" onClick={() => setMenuOpen(false)}>
                  <div style={{ padding: "12px 12px 10px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 4 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{user?.first_name} {user?.last_name}</div>
                    <div style={{ fontSize: 11, color: "#666", fontFamily: "DM Mono, monospace" }}>{user?.email}</div>
                    <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ height: 3, flex: 1, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
                        <div style={{ height: "100%", width: `${user?.trust_completion_score || 0}%`, background: "#FF6B35", borderRadius: 2 }} />
                      </div>
                      <span style={{ fontSize: 10, color: "#FF6B35", fontFamily: "DM Mono, monospace" }}>{Math.round(user?.trust_completion_score || 0)}%</span>
                    </div>
                  </div>
                  <Link to="/profile" className="dropdown-item">👤 My TrustID Profile</Link>
                  <Link to="/ecs" className="dropdown-item">⭐ ECS Score</Link>
                  <Link to="/skills" className="dropdown-item">🎯 Skills Centre</Link>
                  <Link to="/settings" className="dropdown-item">⚙️ Settings</Link>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: 4, paddingTop: 4 }}>
                    <button className="dropdown-item" onClick={handleLogout} style={{ color: "#FF6B35" }}>🚪 Sign Out</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Click outside to close dropdowns */}
      {(menuOpen || notifOpen) && (
        <div style={{ position: "fixed", inset: 0, zIndex: 999 }} onClick={() => { setMenuOpen(false); setNotifOpen(false); }} />
      )}
    </>
  );
}

const styles = {
  nav: { position: "sticky", top: 0, zIndex: 1000, background: "rgba(10,10,15,0.92)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 24px" },
  navInner: { maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", height: 60 },
  logo: { display: "flex", alignItems: "center", gap: 8, textDecoration: "none" },
  logoIcon: { width: 28, height: 28, borderRadius: 7, background: "linear-gradient(135deg,#FF6B35,#FF3D00)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 },
  logoText: { fontSize: 18, fontWeight: 800, color: "#E8E8F0", letterSpacing: -0.5, fontFamily: "'Sora',sans-serif" },
};