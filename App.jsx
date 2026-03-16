import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// ─── Public ───────────────────────────────────────────────────────────────────
import LandingPage          from "./pages/public/LandingPage";
import LoginPage            from "./pages/public/LoginPage";
import SignupPage           from "./pages/public/SignupPage";
import AboutPage            from "./pages/public/AboutPage";
import VerifyEmailPage      from "./pages/public/VerifyEmailPage";

// ─── Onboarding ───────────────────────────────────────────────────────────────
import PersonaSelect        from "./pages/onboarding/PersonaSelect";
import IdentityUpload       from "./pages/onboarding/IdentityUpload";
import QualificationsUpload from "./pages/onboarding/QualificationsUpload";
import SkillsAssessment     from "./pages/onboarding/SkillsAssessment";
import { GoalsSetup }       from "./pages/onboarding/QualificationsUpload";
import OnboardingComplete   from "./pages/onboarding/OnboardingComplete";

// ─── Layout ───────────────────────────────────────────────────────────────────
import PageWrapper          from "./components/layout/PageWrapper";

// ─── Core ─────────────────────────────────────────────────────────────────────
import Dashboard            from "./pages/dashboard/Dashboard";
import MyProfile            from "./pages/trustid/MyProfile";
import VerificationTracker  from "./pages/trustid/VerificationTracker";
import ECSFullDashboard     from "./pages/ecs/ECSFullDashboard";

// ─── Sphiwe — Jobs ────────────────────────────────────────────────────────────
import JobFeed              from "./pages/sphiwe/JobFeed";
import JobDetail            from "./pages/sphiwe/JobDetail";
import ApplyJob             from "./pages/sphiwe/ApplyJob";
import ApplicationTracker   from "./pages/sphiwe/ApplicationTracker";
import EmployerProfile      from "./pages/sphiwe/EmployerProfile";

// ─── Sipho — Freelance ────────────────────────────────────────────────────────
import FreelanceFeed        from "./pages/sipho/FreelanceFeed";
import SubmitProposal       from "./pages/sipho/SubmitProposal";
import ProjectDetail        from "./pages/sipho/ProjectDetail";
import { ActiveProjects }   from "./pages/sipho/PortfolioPage";
import EarningsDashboard    from "./pages/sipho/EarningsDashboard";
import PortfolioPage        from "./pages/sipho/PortfolioPage";

// ─── Zama — Entrepreneur ──────────────────────────────────────────────────────
import LaunchPad            from "./pages/zama/LaunchPad";
import FundMatch            from "./pages/zama/FundMatch";
import FunderDetail         from "./pages/zama/FunderDetail";
import MentorFeed           from "./pages/zama/MentorFeed";
import MentorProfile        from "./pages/zama/MentorProfile";
import MentorSessions       from "./pages/zama/MentorSessions";
import InvestorFeed         from "./pages/zama/InvestorFeed";
import InvestorProfile      from "./pages/zama/InvestorProfile";
import BusinessProfile      from "./pages/zama/BusinessProfile";

// ─── GovLink ──────────────────────────────────────────────────────────────────
import GovLinkLogin         from "./pages/govlink/GovLinkLogin";
import GovLinkDashboard     from "./pages/govlink/GovLinkDashboard";
import GovLinkMap           from "./pages/govlink/GovLinkMap";
import GovLinkUsers         from "./pages/govlink/GovLinkUsers";
import GovLinkFunds         from "./pages/govlink/GovLinkFunds";

// ─── Shared ───────────────────────────────────────────────────────────────────
import Messages             from "./pages/shared/Messages";
import Notifications        from "./pages/shared/Notifications";
import SkillsCentre         from "./pages/shared/SkillsCentre";
import CoursesPage          from "./pages/shared/CoursesPage";
import { VerificationTracker as VerifyCenter } from "./pages/shared/CoursesPage";
import Settings             from "./pages/shared/Settings";
import MarketBoost          from "./pages/shared/MarketBoost";
import NotFound             from "./pages/shared/NotFound";
import SafetyPage           from "./pages/shared/SafetyPage";

// ─── Loading / Fallback ───────────────────────────────────────────────────────
function Loader() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0A0A0F", flexDirection: "column", gap: 14 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#FF6B35,#FF3D00)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>⚡</div>
      <div style={{ fontSize: 13, color: "#FF6B35", fontFamily: "DM Mono,monospace" }}>Loading ARISE...</div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}

// ─── Route Guards ─────────────────────────────────────────────────────────────
function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Loader />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Loader />;
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
}

function GovRoute({ children }) {
  const { isAuthenticated, isGovernment, loading } = useAuth();
  if (loading) return <Loader />;
  if (!isAuthenticated) return <Navigate to="/govlink/login" replace />;
  if (!isGovernment) return <Navigate to="/dashboard" replace />;
  return children;
}

// ─── App Routes ───────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      {/* ── Public ─────────────────────────────────────────────────────────── */}
      <Route path="/"            element={<LandingPage />} />
      <Route path="/about"       element={<AboutPage />} />
      <Route path="/safety"      element={<SafetyPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/login"       element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
      <Route path="/signup"      element={<PublicOnlyRoute><SignupPage /></PublicOnlyRoute>} />

      {/* ── Onboarding (no nav) ─────────────────────────────────────────────── */}
      <Route path="/onboarding" element={<PrivateRoute><PageWrapper hideNav /></PrivateRoute>}>
        <Route index                 element={<PersonaSelect />} />
        <Route path="identity"       element={<IdentityUpload />} />
        <Route path="qualifications" element={<QualificationsUpload />} />
        <Route path="skills"         element={<SkillsAssessment />} />
        <Route path="goals"          element={<GoalsSetup />} />
        <Route path="complete"       element={<OnboardingComplete />} />
      </Route>

      {/* ── Authenticated App ───────────────────────────────────────────────── */}
      <Route path="/" element={<PrivateRoute><PageWrapper /></PrivateRoute>}>

        {/* Core */}
        <Route path="dashboard"       element={<Dashboard />} />
        <Route path="profile"         element={<MyProfile />} />
        <Route path="profile/:userId" element={<MyProfile />} />
        <Route path="verify"          element={<VerificationTracker />} />
        <Route path="ecs"             element={<ECSFullDashboard />} />

        {/* Sphiwe — Jobs */}
        <Route path="jobs"                element={<JobFeed />} />
        <Route path="jobs/:jobId"         element={<JobDetail />} />
        <Route path="jobs/:jobId/apply"   element={<ApplyJob />} />
        <Route path="applications"        element={<ApplicationTracker />} />
        <Route path="employers/:id"       element={<EmployerProfile />} />

        {/* Sipho — Freelance */}
        <Route path="freelance"              element={<FreelanceFeed />} />
        <Route path="freelance/active"       element={<ActiveProjects />} />
        <Route path="freelance/earnings"     element={<EarningsDashboard />} />
        <Route path="freelance/:projectId"   element={<ProjectDetail />} />
        <Route path="freelance/:projectId/propose" element={<SubmitProposal />} />
        <Route path="portfolio"              element={<PortfolioPage />} />

        {/* Zama — Entrepreneur */}
        <Route path="launchpad"             element={<LaunchPad />} />
        <Route path="fundmatch"             element={<FundMatch />} />
        <Route path="fundmatch/:funderId"   element={<FunderDetail />} />
        <Route path="mentors"               element={<MentorFeed />} />
        <Route path="mentors/:mentorId"     element={<MentorProfile />} />
        <Route path="mentors/sessions"      element={<MentorSessions />} />
        <Route path="investors"             element={<InvestorFeed />} />
        <Route path="investors/:investorId" element={<InvestorProfile />} />
        <Route path="business-profile"      element={<BusinessProfile />} />

        {/* Shared */}
        <Route path="messages"            element={<Messages />} />
        <Route path="messages/:threadId"  element={<Messages />} />
        <Route path="notifications"       element={<Notifications />} />
        <Route path="marketboost"          element={<MarketBoost />} />
        <Route path="skills"              element={<SkillsCentre />} />
        <Route path="courses"             element={<CoursesPage />} />
        <Route path="settings"            element={<Settings />} />
        <Route path="verification-centre" element={<VerifyCenter />} />

      </Route>

      {/* ── GovLink ─────────────────────────────────────────────────────────── */}
      <Route path="/govlink/login" element={<GovLinkLogin />} />
      <Route path="/govlink" element={<GovRoute><PageWrapper govMode /></GovRoute>}>
        <Route index        element={<GovLinkDashboard />} />
        <Route path="map"   element={<GovLinkMap />} />
        <Route path="users" element={<GovLinkUsers />} />
        <Route path="funds" element={<GovLinkFunds />} />
      </Route>

      {/* ── 404 ─────────────────────────────────────────────────────────────── */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}