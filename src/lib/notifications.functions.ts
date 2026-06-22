import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export type NotificationRow = {
  id: string;
  user_id: string;
  resident_id: string | null;
  type: string;
  message: string | null;
  read: boolean;
  created_at: string;
  resident_name: string | null;
};

export const listMyNotifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<NotificationRow[]> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = context.supabase as any;
    const { data, error } = await supabase
      .from("notifications")
      .select("id, user_id, resident_id, type, message, read, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    const rows = (data ?? []) as Array<Omit<NotificationRow, "resident_name">>;
    const residentIds = Array.from(
      new Set(rows.map((r) => r.resident_id).filter((x): x is string => !!x)),
    );
    const nameMap = new Map<string, string>();
    if (residentIds.length > 0) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: residents } = await supabaseAdmin
        .from("residents")
        .select("id, name")
        .in("id", residentIds);
      for (const r of (residents ?? []) as Array<{ id: string; name: string }>) {
        nameMap.set(r.id, r.name);
      }
    }
    return rows.map((r) => ({
      ...r,
      resident_name: r.resident_id ? (nameMap.get(r.resident_id) ?? null) : null,
    }));
  });

export const countUnreadNotifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ count: number }> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = context.supabase as any;
    const { count, error } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("read", false);
    if (error) throw new Error(error.message);
    return { count: count ?? 0 };
  });

export const markAllNotificationsRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ ok: true }> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = context.supabase as any;
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", context.userId)
      .eq("read", false);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const markResidentNotificationsRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ resident_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = context.supabase as any;
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", context.userId)
      .eq("resident_id", data.resident_id)
      .eq("read", false);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
