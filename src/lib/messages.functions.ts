import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { assertNoPhi } from "./phi";

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (context.supabase as any).rpc("can_access_resident_thread", {
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

type MessageRow = {
  id: string;
  resident_id: string;
  sender_id: string | null;
  content: string;
  created_at: string;
  sender_label?: string | null;
  sender_role?: string | null;
};

function coerceRole(value: unknown): ResidentMessage["sender_role"] {
  return value === "family" || value === "staff" || value === "admin" ? value : null;
}

export const listResidentMessages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ resident_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }): Promise<ResidentMessage[]> => {
    await assertThreadAccess(context, data.resident_id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: rows, error } = await (context.supabase as any)
      .from("resident_messages")
      .select("*")
      .eq("resident_id", data.resident_id)
      .order("created_at", { ascending: true })
      .limit(500);
    if (error) throw new Error(error.message);
    const messages = (rows ?? []) as MessageRow[];
    const senderIds = Array.from(
      new Set(messages.map((m) => m.sender_id).filter((id): id is string => !!id)),
    );
    const senders = await resolveSenders(senderIds, data.resident_id);
    return messages.map((m) => {
      const s = m.sender_id ? senders.get(m.sender_id) : undefined;
      return {
        id: m.id,
        resident_id: m.resident_id,
        sender_id: m.sender_id ?? "",
        content: m.content,
        created_at: m.created_at,
        // Fall back to the snapshot so messages from removed accounts still
        // show who wrote them.
        sender_name: s?.name ?? m.sender_label ?? null,
        sender_role: s?.role ?? coerceRole(m.sender_role),
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
    assertNoPhi(data.content, "Message");

    const senders = await resolveSenders([context.userId], data.resident_id);
    const me = senders.get(context.userId);

    const base = {
      resident_id: data.resident_id,
      sender_id: context.userId,
      content: data.content.trim(),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const insert = (payload: Record<string, unknown>) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context.supabase as any)
        .from("resident_messages")
        .insert(payload)
        .select("*")
        .single();

    let { data: inserted, error } = await insert({
      ...base,
      sender_label: me?.name ?? null,
      sender_role: me?.role ?? null,
    });
    if (error && /sender_label|sender_role/.test(error.message ?? "")) {
      // Snapshot columns not migrated yet.
      ({ data: inserted, error } = await insert(base));
    }
    if (error) throw new Error(error.message);

    const row = inserted as MessageRow;
    return {
      id: row.id,
      resident_id: row.resident_id,
      sender_id: row.sender_id ?? context.userId,
      content: row.content,
      created_at: row.created_at,
      sender_name: me?.name ?? row.sender_label ?? null,
      sender_role: me?.role ?? coerceRole(row.sender_role),
    };
  });

