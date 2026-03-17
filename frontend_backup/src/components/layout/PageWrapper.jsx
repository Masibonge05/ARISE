import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const HIDE_NAV = ["/onboarding"];
const HIDE_SIDEBAR = ["/onboarding", "/messages", "/govlink"];

export default function PageWrapper({ hideNav, govMode }) {
  const location = useLocation();
  const path = location.pathname;

  const shouldHideNav = hideNav || HIDE_NAV.some((p) => path.startsWith(p));
  const shouldHideSidebar = hideNav || HIDE_SIDEBAR.some((p) => path.startsWith(p)) || govMode;

  return (
    <div style={{ fontFamily: "'Sora',sans-serif", background: "#0A0A0F", color: "#E8E8F0", minHeight: "100vh" }}>
      {!shouldHideNav && <Navbar govMode={govMode} />}
      <div style={{ display: "flex", minHeight: shouldHideNav ? "100vh" : "calc(100vh - 60px)" }}>
        {!shouldHideSidebar && <Sidebar />}
        <main style={{ flex: 1, minWidth: 0, overflowX: "hidden" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}