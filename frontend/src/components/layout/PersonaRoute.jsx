import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Loader from "../shared/Loader";

export default function PersonaRoute({ children, persona }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (persona && user.persona_type !== persona) return <Navigate to="/dashboard" replace />;
  return children;
}