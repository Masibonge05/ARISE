import { useState, useEffect, useCallback } from "react";
import api from "../services/api";

export function useProfile(userId = null) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const url = userId ? `/users/${userId}/profile` : "/users/me";
      const res = await api.get(url);
      setProfile(res.data);
    } catch (e) {
      setError(e.response?.data?.detail || "Could not load profile");
    } finally { setLoading(false); }
  }, [userId]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const updateProfile = async (data) => {
    const res = await api.patch("/users/me", data);
    setProfile(prev => ({ ...prev, ...res.data }));
    return res.data;
  };

  return { profile, loading, error, refetch: fetchProfile, updateProfile };
}

export default useProfile;