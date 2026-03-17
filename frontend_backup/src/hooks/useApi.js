/**
 * src/hooks/useApi.js
 * Data fetching hook with loading, error, and refetch state.
 *
 * Usage:
 *   const { data, loading, error, refetch } = useApi("/jobs/");
 *   const { data, execute } = useApi("/jobs/", { method: "POST", lazy: true });
 */

import { useState, useEffect, useCallback, useRef } from "react";
import api from "../services/api";

export function useApi(endpoint, options = {}) {
  const { method = "GET", body = null, lazy = false, transform = null } = options;
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(!lazy);
  const [error, setError]     = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const execute = useCallback(async (overrideBody) => {
    setLoading(true);
    setError(null);
    try {
      const payload = overrideBody !== undefined ? overrideBody : body;
      const res = method === "GET"
        ? await api.get(endpoint)
        : await api[method.toLowerCase()](endpoint, payload);
      const result = transform ? transform(res.data) : res.data;
      if (mountedRef.current) setData(result);
      return { data: result, error: null };
    } catch (e) {
      const msg = e.response?.data?.detail || e.message || "Request failed";
      if (mountedRef.current) setError(msg);
      return { data: null, error: msg };
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [endpoint, method, body, transform]);

  useEffect(() => {
    if (!lazy && method === "GET") execute();
  }, [endpoint]); // eslint-disable-line

  return { data, loading, error, refetch: execute, execute };
}

export default useApi;