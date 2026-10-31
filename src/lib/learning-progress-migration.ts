const originalLessonIds: Record<string, string> = {
  "1.1": "1.1", "1.2": "1.3", "1.3": "1.4", "1.4": "1.5", "1.5": "1.6", "1.6": "1.11",
};

/** Preserve original six-lesson progress when the expanded chapter is first opened. */
export function migrateOriginalProgress(progress: { completed?: unknown; current?: unknown; reflection?: unknown }) {
  return {
    completed: Array.isArray(progress.completed)
      ? progress.completed.flatMap((id) => typeof id === "string" && originalLessonIds[id] ? [originalLessonIds[id]] : [])
      : [],
    current: typeof progress.current === "string" ? originalLessonIds[progress.current] ?? "1.1" : "1.1",
    reflection: typeof progress.reflection === "string" ? progress.reflection : undefined,
  };
}