import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Send } from "lucide-react";
import {
  listResidentMessages,
  sendResidentMessage,
  type ResidentMessage,
} from "@/lib/messages.functions";
import { supabase } from "@/integrations/supabase/client";
import { findPhi } from "@/lib/phi";

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  return sameDay
    ? d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
    : d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function roleLabel(role: ResidentMessage["sender_role"]) {
  if (role === "admin") return "Admin";
  if (role === "staff") return "Staff";
  if (role === "family") return "Family";
  return "";
}

export function ResidentMessageThread({
  residentId,
  currentUserId,
  isFamily,
  onMessagesViewed,
  autoFocus = false,
}: {
  residentId: string;
  currentUserId: string | null;
  isFamily: boolean;
  /** Called whenever a new message arrives or the thread loads, for unread tracking. */
  onMessagesViewed?: (lastIso: string | null) => void;
  autoFocus?: boolean;
}) {
  const qc = useQueryClient();
  const queryKey = useMemo(() => ["resident-messages", residentId] as const, [residentId]);

  const { data: messages = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => listResidentMessages({ data: { resident_id: residentId } }),
  });

  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const send = useMutation({
    mutationFn: (content: string) =>
      sendResidentMessage({ data: { resident_id: residentId, content } }),
    onSuccess: () => {
      setDraft("");
      qc.invalidateQueries({ queryKey });
    },
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`resident-messages:${residentId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "resident_messages",
          filter: `resident_id=eq.${residentId}`,
        },
        () => {
          qc.invalidateQueries({ queryKey });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [residentId, qc, queryKey]);

  // Track viewed
  useEffect(() => {
    if (messages.length > 0) {
      onMessagesViewed?.(messages[messages.length - 1].created_at);
    } else {
      onMessagesViewed?.(null);
    }
  }, [messages, onMessagesViewed]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const phiHit = draft ? findPhi(draft) : null;

  const handleSend = () => {
    const trimmed = draft.trim();
    if (!trimmed || send.isPending || phiHit) return;
    send.mutate(trimmed);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto rounded-2xl bg-surface/60 p-4"
      >
        {isLoading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Loading messages…</p>
        ) : messages.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            <p>No messages yet.</p>
            <p className="mt-1">
              {isFamily
                ? "Say hello to the care team, they'll see your message and reply here."
                : "Start the conversation with the family, anything you write here is visible to them."}
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {messages.map((m, i) => {
              // "My side" of the thread: my own messages, plus messages from my
              // side of the conversation whose author account no longer exists.
              const sideOf = (msg: ResidentMessage): "family" | "team" =>
                msg.sender_role === "family" ? "family" : "team";
              const mySide: "family" | "team" = isFamily ? "family" : "team";
              const mine =
                (currentUserId !== null && m.sender_id === currentUserId) ||
                (m.sender_id === "" && sideOf(m) === mySide);
              const prev = i > 0 ? messages[i - 1] : null;
              const newDay =
                !prev ||
                new Date(prev.created_at).toDateString() !== new Date(m.created_at).toDateString();
              const grouped =
                !newDay &&
                prev !== null &&
                (prev.sender_id === m.sender_id
                  ? true
                  : prev.sender_name === m.sender_name && sideOf(prev) === sideOf(m));
              const fallbackName = sideOf(m) === "family" ? "Family" : "Care team";
              const name = mine ? "You" : (m.sender_name ?? fallbackName);
              const initial = (name[0] ?? "?").toUpperCase();
              const bubble = mine
                ? "bg-primary text-primary-foreground rounded-br-md"
                : "bg-card text-foreground border border-border rounded-bl-md";
              return (
                <li key={m.id}>
                  {newDay && (
                    <p className="mb-4 text-center text-xs text-muted-foreground">
                      {new Date(m.created_at).toLocaleDateString(undefined, {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  )}
                  <div
                    className={`flex items-end gap-2 ${mine ? "flex-row-reverse" : "flex-row"} ${
                      grouped ? "mt-1" : "mt-0"
                    }`}
                  >
                    <div
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-semibold ${
                        grouped
                          ? "opacity-0"
                          : mine
                            ? "bg-primary/15 text-primary"
                            : "bg-surface text-foreground/70"
                      }`}
                      aria-hidden={grouped}
                    >
                      {initial}
                    </div>
                    <div className={`flex max-w-[78%] flex-col ${mine ? "items-end" : "items-start"}`}>
                      {!grouped && (
                        <div className="mb-1 flex items-center gap-2 px-1">
                          <span className="text-xs font-semibold text-foreground/85">{name}</span>
                          {m.sender_role && !mine && (
                            <span className="rounded-full bg-surface px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                              {roleLabel(m.sender_role)}
                            </span>
                          )}
                        </div>
                      )}
                      <div
                        className={`whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-base leading-relaxed shadow-soft ${bubble}`}
                      >
                        {m.content}
                      </div>
                      <span className="mt-1 px-1 text-[11px] text-muted-foreground">
                        {formatTime(m.created_at)}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="mt-3 flex flex-col gap-2"
      >
        <p className="text-xs text-muted-foreground">
          Non-PHI pilot: do not share names, dates of birth, diagnoses, or contact info here.
        </p>
        {phiHit && (
          <p className="text-xs text-destructive" role="alert">
            That looks like a {phiHit.label}. Remove it before sending.
          </p>
        )}
        <div className="flex items-end gap-2">
        <textarea
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={isFamily ? "Write a message to the care team…" : "Reply to the family…"}
          rows={2}
          className="min-h-[48px] flex-1 resize-none rounded-2xl border border-border bg-card px-4 py-3 text-base shadow-soft focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <button
          type="submit"
          disabled={!draft.trim() || send.isPending || !!phiHit}
          aria-label="Send message"
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
        >
          <Send className="h-5 w-5" />
        </button>
        </div>
      </form>
      {send.isError && (
        <p className="mt-2 text-xs text-destructive">
          Couldn't send that. Please try again.
        </p>
      )}
    </div>
  );
}
