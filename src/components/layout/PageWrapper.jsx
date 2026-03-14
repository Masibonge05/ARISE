import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";

// Pages that should not show the Navbar (full-screen flows)
const HIDE_NAV_PATHS = ["/onboarding"];

export default function PageWrapper({ hideNav, govMode }) {
  const location = useLocation();
  const shouldHideNav = hideNav || HIDE_NAV_PATHS.some((p) => location.pathname.startsWith(p));

  return (
    <div style={{ fontFamily: "'Sora', sans-serif", background: "#0A0A0F", color: "#E8E8F0", minHeight: "100vh" }}>
      {!shouldHideNav && <Navbar govMode={govMode} />}
      <main>
        <Outlet />
      </main>
    </div>
  );
}