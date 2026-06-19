import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { useThreads, newThreadId } from "@/lib/chat-threads";
import {
  deleteCoachConversation,
  fetchAllCoachConversations,
  getCurrentUserId,
} from "@/lib/coach-sync";
import { MessageCircle, Plus, Sparkles, Trash2 } from "lucide-react";

export const Route = createFileRoute("/learn/coach/")({
  component: CoachIndex,
});

function CoachIndex() {
  const navigate = useNavigate();
  const { threads, createThread, deleteThread, updateThread } = useThreads();

  // Hydrate from Supabase when signed in.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const uid = await getCurrentUserId();
      if (!uid || cancelled) return;
      const remote = await fetchAllCoachConversations();
      if (cancelled) return;
      for (const t of remote) {
        // Ensure the thread exists locally, then patch with remote content.
        createThread(t.id);
        updateThread(t.id, { messages: t.messages, title: t.title });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [createThread, updateThread]);

  useEffect(() => {
    if (threads.length === 0) {
      const t = createThread();
      navigate({ to: "/learn/coach/$threadId", params: { threadId: t.id }, replace: true });
    }
  }, [threads.length, createThread, navigate]);

  const handleNew = () => {
    const t = createThread(newThreadId());
    navigate({ to: "/learn/coach/$threadId", params: { threadId: t.id } });
  };

  return (
    <AppShell>
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary">AI Coach</p>
          <h1 className="mt-2 text-3xl sm:text-4xl">Your conversations</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Saved on this device. Start a new chat anytime — your past
            conversations stay here for you to return to.
          </p>
        </div>
        <button
          onClick={handleNew}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" />
          New chat
        </button>
      </header>

      <ul className="mt-8 grid gap-2">
        {threads.map((t) => (
          <li
            key={t.id}
            className="group flex items-center gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3 shadow-soft transition-colors hover:bg-surface"
          >
            <Link
              to="/learn/coach/$threadId"
              params={{ threadId: t.id }}
              className="flex min-w-0 flex-1 items-center gap-3"
            >
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sky-soft">
                <MessageCircle className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{t.title}</p>
                <p className="text-xs text-muted-foreground">
                  {t.messages.length === 0
                    ? "No messages yet"
                    : `${t.messages.length} message${t.messages.length === 1 ? "" : "s"}`}
                </p>
              </div>
            </Link>
            <button
              aria-label="Delete conversation"
              onClick={() => {
                deleteThread(t.id);
                void deleteCoachConversation(t.id);
              }}
              className="rounded-full p-2 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
        {threads.length === 0 && (
          <li className="rounded-3xl border border-dashed border-border bg-surface p-8 text-center">
            <Sparkles className="mx-auto h-6 w-6 text-primary" />
            <p className="mt-3 text-sm text-muted-foreground">
              Starting your first conversation…
            </p>
          </li>
        )}
      </ul>
    </AppShell>
  );
}
