import { useState, useEffect } from "react";

export function usePersistentState(key, fallback) {
  const [value, setValue] = useState(() => {
    try {
      const v = localStorage.getItem(`cf_${key}`);
      return v !== null ? JSON.parse(v) : fallback;
    } catch {
      return fallback;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(`cf_${key}`, JSON.stringify(value));
    } catch {}
  }, [key, value]);

  return [value, setValue];
}
