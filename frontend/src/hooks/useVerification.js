import { useState, useEffect } from "react";
import api from "../services/api";

export function useVerification() {
  const [status, setStatus]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/trustid/status")
      .then(r => setStatus(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const trustScore = status?.trust_completion_score || 0;
  const ecsFromVerification = status?.ecs_score || 0;

  return { status, loading, trustScore, ecsFromVerification };
}

export default useVerification;