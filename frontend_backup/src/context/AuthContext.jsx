import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";

// ─── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ─── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(() => localStorage.getItem("arise_token"));
  const [loading, setLoading] = useState(true);  // true on first load
  const [error, setError]     = useState(null);

  // ── Attach token to every axios request ───────────────
  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      localStorage.setItem("arise_token", token);
    } else {
      delete api.defaults.headers.common["Authorization"];
      localStorage.removeItem("arise_token");
    }
  }, [token]);

  // ── Load user on mount if token exists ────────────────
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
      } catch (err) {
        // Token is invalid or expired — clear everything
        console.warn("Session expired. Please log in again.");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Register ──────────────────────────────────────────
  const register = useCallback(async (formData) => {
    setError(null);
    try {
      const res = await api.post("/auth/register", formData);
      const { access_token, user: newUser } = res.data;
      setToken(access_token);
      setUser(newUser);
      return { success: true, user: newUser };
    } catch (err) {
      const message = err.response?.data?.detail || "Registration failed. Please try again.";
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  // ── Login ─────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const res = await api.post("/auth/login", { email, password });
      const { access_token, user: loggedInUser } = res.data;
      setToken(access_token);
      setUser(loggedInUser);
      return { success: true, user: loggedInUser };
    } catch (err) {
      const message = err.response?.data?.detail || "Login failed. Please check your credentials.";
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  // ── Logout ────────────────────────────────────────────
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  // ── Update user in state (after profile edits) ────────
  const updateUser = useCallback((updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  }, []);

  // ── Refresh user from server ──────────────────────────
  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
      return res.data;
    } catch (err) {
      console.error("Failed to refresh user:", err);
    }
  }, []);

  // ── Computed helpers ──────────────────────────────────
  const isAuthenticated = !!user && !!token;

  const isPersona = (persona) => {
    if (!user) return false;
    return (
      user.primary_persona === persona ||
      (user.secondary_personas || []).includes(persona)
    );
  };

  const isJobSeeker    = isPersona("job_seeker");
  const isFreelancer   = isPersona("freelancer");
  const isEntrepreneur = isPersona("entrepreneur");
  const isEmployer     = isPersona("employer");
  const isInvestor     = isPersona("investor");
  const isMentor       = isPersona("mentor");
  const isGovernment   = isPersona("government");

  // ─── Context Value ──────────────────────────────────────────────────────────
  const value = {
    // State
    user,
    token,
    loading,
    error,

    // Actions
    register,
    login,
    logout,
    updateUser,
    refreshUser,
    setError,

    // Helpers
    isAuthenticated,
    isJobSeeker,
    isFreelancer,
    isEntrepreneur,
    isEmployer,
    isInvestor,
    isMentor,
    isGovernment,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────────
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}

export default AuthContext;