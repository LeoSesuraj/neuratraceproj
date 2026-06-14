import type { UIMessage } from "ai";
import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "neurotrace.threads.v1";

export type ChatThread = {
  id: string;
  title: string;
  updatedAt: number;
  messages: UIMessage[];
};

const isBrowser = typeof window !== "undefined";

function readFromStorage(): ChatThread[] {
  if (!isBrowser) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatThread[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

const listeners = new Set<() => void>();
let cache: ChatThread[] = readFromStorage();

function emit() {
  for (const l of listeners) l();
}

function writeToStorage(next: ChatThread[]) {
  cache = next;
  if (isBrowser) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore quota errors
    }
  }
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() {
  return cache;
}

function getServerSnapshot(): ChatThread[] {
  return [];
}

export function newThreadId() {
  return (
    "t_" +
    Math.random().toString(36).slice(2, 10) +
    Date.now().toString(36).slice(-4)
  );
}

export function useThreads() {
  const threads = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const createThread = useCallback((id?: string): ChatThread => {
    const t: ChatThread = {
      id: id ?? newThreadId(),
      title: "New conversation",
      updatedAt: Date.now(),
      messages: [],
    };
    writeToStorage([t, ...cache.filter((x) => x.id !== t.id)]);
    return t;
  }, []);

  const deleteThread = useCallback((id: string) => {
    writeToStorage(cache.filter((t) => t.id !== id));
  }, []);

  const updateThread = useCallback(
    (id: string, patch: Partial<Omit<ChatThread, "id">>) => {
      writeToStorage(
        cache.map((t) =>
          t.id === id ? { ...t, ...patch, updatedAt: Date.now() } : t,
        ),
      );
    },
    [],
  );

  const getThread = useCallback(
    (id: string): ChatThread | undefined => cache.find((t) => t.id === id),
    [],
  );

  return { threads, createThread, deleteThread, updateThread, getThread };
}

export function deriveTitle(messages: UIMessage[]): string {
  const first = messages.find((m) => m.role === "user");
  if (!first) return "New conversation";
  const text = first.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join(" ")
    .trim();
  if (!text) return "New conversation";
  return text.length > 48 ? text.slice(0, 48) + "…" : text;
}
