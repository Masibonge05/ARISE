import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { getECSBand } from "../utils/ecsCalculator";

export function useECS() {
  const [score, setScore]         = useState(0);
  const [breakdown, setBreakdown] = useState({});
  const [history, setHistory]     = useState([]);
  const [loading, setLoading]     = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/ecs/score");
      setScore(res.data.ecs_score || 0);
      setBreakdown(res.data.breakdown || {});
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return {
    score, breakdown, history, loading,
    band: getECSBand(score),
    refetch: fetch,
  };
}

export default useECS;