import { useCallback, useEffect, useState } from "react";
import { allLessons } from "./curriculum";
import { migrateOriginalProgress } from "./learning-progress-migration";

/** Anonymous, device-local learning progress. Never mixed with resident records. */
const KEY = "neuratrace.learning.v2";

export type Progress = {
  completed: string[];
  current: string;
  reflection?: string;
};

const initial: Progress = { completed: [], current: allLessons[0]?.id ?? "1.1" };

function read(): Progress {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      const legacy = window.localStorage.getItem("neuratrace.learning.v1");
      if (!legacy) return initial;
      const migrated = migrateOriginalProgress(JSON.parse(legacy));
      window.localStorage.setItem(KEY, JSON.stringify(migrated));
      return migrated;
    }
    const p = JSON.parse(raw) as Partial<Progress>;
    return {
      completed: Array.isArray(p.completed) ? p.completed.filter((id) => allLessons.some((l) => l.id === id)) : [],
      current: typeof p.current === "string" ? p.current : initial.current,
      reflection: typeof p.reflection === "string" ? p.reflection : undefined,
    };
  } catch {
    return initial;
  }
}

export function percentComplete(completed: string[], lessonIds: string[]) {
  if (lessonIds.length === 0) return 0;
  const done = lessonIds.filter((id) => completed.includes(id)).length;
  return Math.round((done / lessonIds.length) * 100);
}

export function useLearningProgress() {
  const [progress, setProgress] = useState<Progress>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProgress(read());
    setReady(true);
  }, []);

  const update = useCallback((fn: (p: Progress) => Progress) => {
    setProgress((prev) => {
      const next = fn(prev);
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable: keep in memory */
      }
      return next;
    });
  }, []);

  return {
    progress,
    ready,
    setCurrent: (id: string) => update((p) => ({ ...p, current: id })),
    markComplete: (id: string) =>
      update((p) => (p.completed.includes(id) ? p : { ...p, completed: [...p.completed, id] })),
    setReflection: (text: string) => update((p) => ({ ...p, reflection: text })),
    reset: () => update(() => initial),
  };
}
