import { supabase } from "@/integrations/supabase/client";
import type { UIMessage } from "ai";
import type { ChatThread } from "./chat-threads";
import { deriveTitle } from "./chat-threads";

// coach_conversations table, typed access via untyped client cast since the
// table may be added via migration after types.ts was last generated.
// Columns: id (text, client-generated thread id), user_id, messages jsonb,
//          created_at, updated_at.
type Row = {
  id: string;
  user_id: string;
  messages: UIMessage[] | null;
  created_at: string;
  updated_at: string;
};

const table = () => (supabase as unknown as {
  from: (t: string) => {
    select: (cols: string) => {
      order: (col: string, opts: { ascending: boolean }) => Promise<{ data: Row[] | null; error: unknown }>;
      eq: (col: string, val: string) => {
        maybeSingle: () => Promise<{ data: Row | null; error: unknown }>;
      };
    };
    upsert: (row: Partial<Row>, opts?: { onConflict: string }) => Promise<{ error: unknown }>;
    delete: () => {
      eq: (col: string, val: string) => Promise<{ error: unknown }>;
    };
  };
}).from("coach_conversations");

export async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

export async function fetchAllCoachConversations(): Promise<ChatThread[]> {
  const { data, error } = await table().select("id,user_id,messages,created_at,updated_at").order("updated_at", { ascending: false });
  if (error || !data) return [];
  return data.map((r) => {
    const messages = (r.messages ?? []) as UIMessage[];
    return {
      id: r.id,
      title: deriveTitle(messages),
      updatedAt: new Date(r.updated_at).getTime(),
      messages,
    };
  });
}

export async function fetchCoachConversation(id: string): Promise<ChatThread | null> {
  const { data, error } = await table()
    .select("id,user_id,messages,created_at,updated_at")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  const messages = (data.messages ?? []) as UIMessage[];
  return {
    id: data.id,
    title: deriveTitle(messages),
    updatedAt: new Date(data.updated_at).getTime(),
    messages,
  };
}

export async function upsertCoachConversation(
  userId: string,
  thread: { id: string; messages: UIMessage[] },
): Promise<void> {
  await table().upsert(
    {
      id: thread.id,
      user_id: userId,
      messages: thread.messages,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );
}

export async function deleteCoachConversation(id: string): Promise<void> {
  await table().delete().eq("id", id);
}
