import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import api from "../services/api";
import { getECSBand } from "../utils/ecsCalculator";

const ECSContext = createContext(null);

export function ECSProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [score, setScore]     = useState(0);
  const [history, setHistory] = useState([]);
  const [breakdown, setBreakdown] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchECS = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await api.get("/ecs/score");
      setScore(res.data.ecs_score || 0);
      setBreakdown(res.data.breakdown || {});
    } catch {}
    finally { setLoading(false); }
  }, [isAuthenticated]);

  useEffect(() => { fetchECS(); }, [fetchECS]);

  const band = getECSBand(score);

  return (
    <ECSContext.Provider value={{
      score, history, breakdown, loading,
      band, refetch: fetchECS,
      updateScore: (newScore) => setScore(newScore),
    }}>
      {children}
    </ECSContext.Provider>
  );
}

export function useECSContext() {
  const ctx = useContext(ECSContext);
  if (!ctx) throw new Error("useECSContext must be inside <ECSProvider>");
  return ctx;
}

export default ECSContext;