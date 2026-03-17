/**
 * src/hooks/useLocalStorage.js
 * Persists state in localStorage with automatic JSON serialization.
 *
 * Usage:
 *   const [theme, setTheme] = useLocalStorage("arise_theme", "dark");
 *   const [jobFilters, setJobFilters] = useLocalStorage("arise_job_filters", {});
 */

import { useState, useCallback } from "react";

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        if (valueToStore === null || valueToStore === undefined) {
          window.localStorage.removeItem(key);
        } else {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (e) {
        console.warn(`useLocalStorage: failed to save key "${key}"`, e);
      }
    },
    [key, storedValue]
  );

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch {}
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

export default useLocalStorage;