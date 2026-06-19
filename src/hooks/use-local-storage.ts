import { useCallback, useEffect, useState } from "react";

/**
 * Tiny localStorage-backed state hook. SSR-safe: returns the initial value
 * on first render and hydrates from storage on the client.
 */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) setValue(JSON.parse(raw) as T);
    } catch {
      // ignore
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  }, [key, value, hydrated]);

  const reset = useCallback(() => setValue(initial), [initial]);

  return [value, setValue, reset] as const;
}
