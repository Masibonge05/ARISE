import { useState, useCallback } from "react";
import api from "../services/api";

export function useJobMatching() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMatches = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await api.get(`/jobs/?${params}`);
      setMatches(res.data.jobs || []);
    } catch {}
    finally { setLoading(false); }
  }, []);

  return { matches, loading, fetchMatches };
}

export function useGrantMatching() {
  const [grants, setGrants] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchGrants = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const res = await api.post("/fundmatch/match", filters);
      setGrants(res.data.programs || []);
    } catch {}
    finally { setLoading(false); }
  }, []);

  return { grants, loading, fetchGrants };
}

export default useJobMatching;