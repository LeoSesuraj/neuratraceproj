import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useThreads, deriveTitle } from "@/lib/chat-threads";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { ArrowLeft, ShieldAlert, Sparkles } from "lucide-react";
import logo from "@/assets/neurotrace-logo.png";
import {
  fetchCoachConversation,
  getCurrentUserId,
  upsertCoachConversation,
} from "@/lib/coach-sync";
import { useVisualViewportOffset } from "@/hooks/use-visual-viewport-offset";

export const Route = createFileRoute("/learn/coach/$threadId")({
  component: ThreadPage,
});

const STARTER_PROMPTS = [
  "My mom keeps asking for her mother.",
  "My dad doesn't recognize me anymore.",
  "My grandmother gets angry during visits.",
  "She refuses to take a bath. What do I do?",
];

function ThreadPage() {
  const { threadId } = Route.useParams();
  return <ThreadChat key={threadId} threadId={threadId} />;
}

function ThreadChat({ threadId }: { threadId: string }) {
  const navigate = useNavigate();
  const { getThread, createThread, updateThread } = useThreads();
  const [initialMessages, setInitialMessages] = useState<UIMessage[]>(() => {
    const existing = getThread(threadId);
    if (existing) return existing.messages;
    const t = createThread(threadId);
    return t.messages;
  });
  const [userId, setUserId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Discover auth + hydrate from Supabase if signed in.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const uid = await getCurrentUserId();
      if (cancelled) return;
      setUserId(uid);
      if (uid) {
        const remote = await fetchCoachConversation(threadId);
        if (!cancelled && remote && remote.messages.length > 0) {
          setInitialMessages(remote.messages);
          updateThread(threadId, { messages: remote.messages, title: remote.title });
        }
      }
      if (!cancelled) setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [threadId, updateThread]);

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat" }),
    [],
  );

  const { messages, sendMessage, status, error, stop } = useChat({
    id: threadId,
    messages: initialMessages,
    transport,
  });

  // Persist on every message change (localStorage + Supabase if signed in).
  const lastSavedRef = useRef<string>("");
  useEffect(() => {
    if (!hydrated) return;
    const serialized = JSON.stringify(messages);
    if (serialized === lastSavedRef.current) return;
    lastSavedRef.current = serialized;
    updateThread(threadId, {
      messages,
      title: deriveTitle(messages),
    });
    if (userId && messages.length > 0) {
      void upsertCoachConversation(userId, { id: threadId, messages });
    }
  }, [messages, threadId, updateThread, userId, hydrated]);

  const [input, setInput] = useState("");
  const isLoading = status === "submitted" || status === "streaming";
  const keyboardOffset = useVisualViewportOffset();

  const handleSubmit = (msg: PromptInputMessage) => {
    const text = (msg.text ?? input).trim();
    if (!text || isLoading) return;
    sendMessage({ text });
    setInput("");
  };

  const handleStarter = (text: string) => {
    if (isLoading) return;
    sendMessage({ text });
  };

  return (
    <AppShell>
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/learn/coach"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Conversations
        </Link>
        <button
          onClick={() => {
            const id =
              "t_" +
              Math.random().toString(36).slice(2, 10) +
              Date.now().toString(36).slice(-4);
            createThread(id);
            navigate({ to: "/learn/coach/$threadId", params: { threadId: id } });
          }}
          className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface"
        >
          + New chat
        </button>
      </div>

      <div className="mt-4 flex h-[calc(100dvh-13rem)] min-h-[520px] flex-col overflow-hidden rounded-3xl border border-border/70 bg-card shadow-soft sm:h-[calc(100dvh-11rem)]">
        <Conversation className="flex-1">
          <ConversationContent
            aria-live="polite"
            aria-relevant="additions"
            aria-label="Coach conversation"
            className="px-4 py-6 sm:px-6"
          >
            {messages.length === 0 ? (
              <ConversationEmptyState
                className="h-full"
                icon={
                  <img
                    src={logo}
                    alt=""
                    width={56}
                    height={56}
                    className="h-14 w-14"
                  />
                }
                title="What's on your mind today?"
                description="Describe what's happening with your loved one. I'll respond with calm, practical guidance."
              >
                <div className="mt-4 grid w-full max-w-md gap-2">
                  {STARTER_PROMPTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => handleStarter(p)}
                      className="rounded-2xl border border-border/70 bg-surface px-4 py-3 text-left text-sm text-foreground transition-colors hover:bg-sky-soft"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </ConversationEmptyState>
            ) : (
              messages.map((m) => {
                const text = m.parts
                  .map((p) => (p.type === "text" ? p.text : ""))
                  .join("");
                return (
                  <Message key={m.id} from={m.role}>
                    <MessageContent>
                      {m.role === "assistant" ? (
                        <MessageResponse>{text}</MessageResponse>
                      ) : (
                        <p className="whitespace-pre-wrap">{text}</p>
                      )}
                    </MessageContent>
                  </Message>
                );
              })
            )}
            {status === "submitted" && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                <Shimmer>Thinking…</Shimmer>
              </div>
            )}
            {error && (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                Something went wrong. Please try again.
              </div>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <div
          className="border-t border-border/70 bg-card px-3 py-3 sm:px-4"
          style={keyboardOffset > 0 ? { paddingBottom: `calc(0.75rem + ${keyboardOffset}px)` } : undefined}
        >
          <div className="mb-3 flex items-start gap-2.5 rounded-2xl border border-sky-200/70 bg-sky-50 px-3 py-2.5 text-sm leading-snug text-sky-900 dark:border-sky-900/40 dark:bg-sky-950/40 dark:text-sky-100">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-sky-600 dark:text-sky-300" aria-hidden />
            <p>
              <span className="font-semibold">For your privacy and safety,</span>{" "}
              do not enter names, room numbers, diagnoses, or any personal
              medical details. Describe situations generally — for example,
              &ldquo;my family member&rdquo; instead of a name.
            </p>
          </div>
          <PromptInput onSubmit={handleSubmit}>
            <PromptInputTextarea
              value={input}
              onChange={(e) => setInput(e.currentTarget.value)}
              placeholder="Tell me what's happening…"
              aria-label="Message the NeuroTrace Coach"
              autoFocus
            />
            <PromptInputFooter className="justify-end">
              <PromptInputSubmit status={status} onStop={stop} />
            </PromptInputFooter>
          </PromptInput>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            NeuroTrace provides educational support, not medical advice. For
            medical concerns, consult a healthcare professional.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
