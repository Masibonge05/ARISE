import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Loader from "../shared/Loader";

export default function GovRoute({ children }) {
  const { isAuthenticated, isGovernment, loading } = useAuth();
  if (loading) return <Loader />;
  if (!isAuthenticated) return <Navigate to="/govlink/login" replace />;
  if (!isGovernment) return <Navigate to="/dashboard" replace />;
  return children;
}