import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export type ResidentMessage = {
  id: string;
  resident_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender_name: string | null;
  sender_role: "family" | "staff" | "admin" | null;
};

async function assertThreadAccess(
  context: { supabase: import("@supabase/supabase-js").SupabaseClient; userId: string },
  resident_id: string,
) {
  const { data, error } = await context.supabase.rpc("can_access_resident_thread", {
    _user_id: context.userId,
    _resident_id: resident_id,
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden");
}

async function resolveSenders(
  senderIds: string[],
  residentId: string,
): Promise<Map<string, { name: string | null; role: ResidentMessage["sender_role"] }>> {
  const out = new Map<string, { name: string | null; role: ResidentMessage["sender_role"] }>();
  if (senderIds.length === 0) return out;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const [{ data: profiles }, { data: families }, { data: resRow }] = await Promise.all([
    supabaseAdmin.from("profiles").select("id, name, email").in("id", senderIds),
    supabaseAdmin.from("resident_family").select("user_id").eq("resident_id", residentId).in("user_id", senderIds),
    supabaseAdmin.from("residents").select("facility_id").eq("id", residentId).maybeSingle(),
  ]);
  const familySet = new Set((families ?? []).map((r) => r.user_id as string));
  const facilityId = (resRow as { facility_id: string } | null)?.facility_id ?? null;

  let elevatedRoles: Array<{ user_id: string; role: string }> = [];
  if (facilityId) {
    const { data } = await supabaseAdmin
      .from("user_roles")
      .select("user_id, role")
      .in("user_id", senderIds)
      .eq("facility_id", facilityId)
      .in("role", ["staff", "admin"]);
    elevatedRoles = (data ?? []) as Array<{ user_id: string; role: string }>;
  }
  const adminSet = new Set(elevatedRoles.filter((r) => r.role === "admin").map((r) => r.user_id));
  const staffSet = new Set(elevatedRoles.filter((r) => r.role === "staff").map((r) => r.user_id));

  for (const id of senderIds) {
    const profile = (profiles ?? []).find((p) => p.id === id);
    const name = profile?.name ?? profile?.email ?? null;
    let role: ResidentMessage["sender_role"] = null;
    if (adminSet.has(id)) role = "admin";
    else if (staffSet.has(id)) role = "staff";
    else if (familySet.has(id)) role = "family";
    out.set(id, { name, role });
  }
  return out;
}

export const listResidentMessages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ resident_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }): Promise<ResidentMessage[]> => {
    await assertThreadAccess(context, data.resident_id);
    const { data: rows, error } = await context.supabase
      .from("resident_messages")
      .select("id, resident_id, sender_id, content, created_at")
      .eq("resident_id", data.resident_id)
      .order("created_at", { ascending: true })
      .limit(500);
    if (error) throw new Error(error.message);
    const messages = (rows ?? []) as Array<{
      id: string;
      resident_id: string;
      sender_id: string;
      content: string;
      created_at: string;
    }>;
    const senderIds = Array.from(new Set(messages.map((m) => m.sender_id)));
    const senders = await resolveSenders(senderIds, data.resident_id);
    return messages.map((m) => {
      const s = senders.get(m.sender_id);
      return {
        ...m,
        sender_name: s?.name ?? null,
        sender_role: s?.role ?? null,
      };
    });
  });

export const sendResidentMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        resident_id: z.string().uuid(),
        content: z.string().trim().min(1).max(4000),
      })
      .parse(d),
  )
  .handler(async ({ data, context }): Promise<ResidentMessage> => {
    await assertThreadAccess(context, data.resident_id);
    const { data: inserted, error } = await context.supabase
      .from("resident_messages")
      .insert({
        resident_id: data.resident_id,
        sender_id: context.userId,
        content: data.content.trim(),
      })
      .select("id, resident_id, sender_id, content, created_at")
      .single();
    if (error) throw new Error(error.message);
    const row = inserted as {
      id: string;
      resident_id: string;
      sender_id: string;
      content: string;
      created_at: string;
    };
    const senders = await resolveSenders([row.sender_id], row.resident_id);
    const s = senders.get(row.sender_id);
    return {
      ...row,
      sender_name: s?.name ?? null,
      sender_role: s?.role ?? null,
    };
  });
