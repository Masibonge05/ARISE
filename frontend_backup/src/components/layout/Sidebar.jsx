import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const NAV_GROUPS = {
  job_seeker: [
    { label: "Main",     items: [
      { to: "/dashboard",    icon: "⚡", label: "Dashboard" },
      { to: "/profile",      icon: "👤", label: "My TrustID" },
      { to: "/ecs",          icon: "⭐", label: "ECS Score" },
    ]},
    { label: "Opportunities", items: [
      { to: "/jobs",         icon: "💼", label: "Job Feed" },
      { to: "/applications", icon: "📋", label: "Applications" },
      { to: "/freelance",    icon: "🔍", label: "Freelance" },
    ]},
    { label: "Grow",     items: [
      { to: "/skills",       icon: "🎯", label: "Skills" },
      { to: "/courses",      icon: "📚", label: "Courses" },
    ]},
  ],
  freelancer: [
    { label: "Main",     items: [
      { to: "/dashboard",        icon: "⚡", label: "Dashboard" },
      { to: "/profile",          icon: "👤", label: "My TrustID" },
      { to: "/ecs",              icon: "⭐", label: "ECS Score" },
    ]},
    { label: "Projects", items: [
      { to: "/freelance",        icon: "🔍", label: "Find Projects" },
      { to: "/freelance/active", icon: "⚙️", label: "Active Projects" },
      { to: "/freelance/earnings",icon: "💰", label: "Earnings" },
      { to: "/marketboost",        icon: "🛍️", label: "MarketBoost" },
      { to: "/portfolio",        icon: "🎨", label: "Portfolio" },
    ]},
    { label: "Grow",     items: [
      { to: "/skills",           icon: "🎯", label: "Skills" },
      { to: "/courses",          icon: "📚", label: "Courses" },
    ]},
  ],
  entrepreneur: [
    { label: "Main",     items: [
      { to: "/dashboard",        icon: "⚡", label: "Dashboard" },
      { to: "/profile",          icon: "👤", label: "My TrustID" },
      { to: "/ecs",              icon: "⭐", label: "ECS Score" },
    ]},
    { label: "Business", items: [
      { to: "/launchpad",        icon: "🚀", label: "LaunchPad" },
      { to: "/business-profile", icon: "🏢", label: "Business Profile" },
      { to: "/fundmatch",        icon: "💡", label: "FundMatch" },
    ]},
    { label: "Connect",  items: [
      { to: "/mentors",          icon: "🤝", label: "Mentors" },
      { to: "/mentors/sessions", icon: "📅", label: "My Sessions" },
      { to: "/investors",        icon: "📈", label: "Investors" },
    ]},
    { label: "Grow",     items: [
      { to: "/skills",           icon: "🎯", label: "Skills" },
      { to: "/courses",          icon: "📚", label: "Courses" },
    ]},
  ],
};

export default function Sidebar() {
  const { user, isEntrepreneur, isFreelancer } = useAuth();
  const location = useLocation();

  const persona = isEntrepreneur ? "entrepreneur" : isFreelancer ? "freelancer" : "job_seeker";
  const groups = NAV_GROUPS[persona] || NAV_GROUPS.job_seeker;

  const isActive = (to) =>
    to === "/dashboard"
      ? location.pathname === "/dashboard"
      : location.pathname.startsWith(to);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=DM+Mono:wght@400&display=swap');
        .sidebar-link { display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:8px; text-decoration:none; font-size:13px; font-weight:500; color:#666; transition:all 0.15s; white-space:nowrap; font-family:'Sora',sans-serif; }
        .sidebar-link:hover { color:#E8E8F0; background:rgba(255,255,255,0.05); }
        .sidebar-link.active { color:#FF6B35; background:rgba(255,107,53,0.1); font-weight:700; }
        .sidebar-link.active .sidebar-icon { opacity:1; }
        .sidebar-icon { font-size:15px; width:20px; text-align:center; flex-shrink:0; opacity:0.7; }
      `}</style>

      <div style={styles.sidebar}>
        {/* User mini profile */}
        <div style={styles.userMini}>
          <div style={styles.avatar}>
            {user?.profile_photo_url
              ? <img src={user.profile_photo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
              : <span style={{ fontSize: 14, fontWeight: 800 }}>{user?.first_name?.[0]}{user?.last_name?.[0]}</span>
            }
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#E8E8F0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.first_name} {user?.last_name}
            </div>
            <div style={{ fontSize: 10, color: "#FF6B35", fontFamily: "DM Mono,monospace", fontWeight: 700 }}>
              ECS {user?.ecs_score || 0}
            </div>
          </div>
        </div>

        {/* Trust bar */}
        <div style={{ padding: "0 16px 16px" }}>
          <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
            <div style={{ height: "100%", width: `${user?.trust_completion_score || 0}%`,
              background: "linear-gradient(90deg,#FF6B35,#FFD93D)", borderRadius: 2 }} />
          </div>
          <div style={{ fontSize: 10, color: "#555", marginTop: 4, fontFamily: "DM Mono,monospace" }}>
            TrustID {Math.round(user?.trust_completion_score || 0)}% complete
          </div>
        </div>

        {/* Nav groups */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 8px" }}>
          {groups.map((group) => (
            <div key={group.label} style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, color: "#444", fontFamily: "DM Mono,monospace",
                fontWeight: 700, letterSpacing: 2, padding: "0 12px", marginBottom: 4 }}>
                {group.label.toUpperCase()}
              </div>
              {group.items.map((item) => (
                <Link key={item.to} to={item.to}
                  className={`sidebar-link ${isActive(item.to) ? "active" : ""}`}>
                  <span className="sidebar-icon">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom links */}
        <div style={{ padding: "12px 8px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          {[
            { to: "/messages",      icon: "💬", label: "Messages" },
            { to: "/notifications", icon: "🔔", label: "Notifications" },
            { to: "/settings",      icon: "⚙️", label: "Settings" },
          ].map((item) => (
            <Link key={item.to} to={item.to}
              className={`sidebar-link ${isActive(item.to) ? "active" : ""}`}>
              <span className="sidebar-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

const styles = {
  sidebar: {
    width: 220,
    minHeight: "calc(100vh - 60px)",
    background: "rgba(255,255,255,0.02)",
    borderRight: "1px solid rgba(255,255,255,0.06)",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    fontFamily: "'Sora',sans-serif",
  },
  userMini: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    padding: "16px 16px 12px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    marginBottom: 12,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    background: "linear-gradient(135deg,#FF6B35,#FF3D00)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    flexShrink: 0,
    overflow: "hidden",
  },
};