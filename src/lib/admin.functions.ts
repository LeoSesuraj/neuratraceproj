import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// ---------- helpers ----------

async function assertFacilityAdmin(
  context: { supabase: import("@supabase/supabase-js").SupabaseClient; userId: string; claims: { email?: unknown } },
  facilityId: string,
): Promise<void> {
  const { SUPER_ADMIN_EMAILS } = await import("./super-admin");
  const email = (context.claims.email as string | undefined) ?? "";
  if (SUPER_ADMIN_EMAILS.includes(email.toLowerCase().trim())) return;
  const { data } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId)
    .eq("facility_id", facilityId)
    .eq("role", "admin")
    .is("deactivated_at", null)
    .maybeSingle();
  if (!data) throw new Error("Forbidden: admin only");
}

async function getMyAdminFacilityId(
  context: { supabase: import("@supabase/supabase-js").SupabaseClient; userId: string },
): Promise<string | null> {
  const { data } = await context.supabase
    .from("user_roles")
    .select("facility_id")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .is("deactivated_at", null)
    .not("facility_id", "is", null)
    .limit(1)
    .maybeSingle();
  return (data?.facility_id as string | undefined) ?? null;
}

// ---------- Login event capture ----------

export const recordLoginEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const req = getRequest();
    const ipHeader =
      req?.headers.get("cf-connecting-ip") ||
      req?.headers.get("x-real-ip") ||
      req?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      null;
    const ua = req?.headers.get("user-agent") ?? null;
    const email = (context.claims.email as string | undefined) ?? null;

    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role, facility_id")
      .eq("user_id", context.userId)
      .is("deactivated_at", null);
    const primary =
      (roles ?? []).find((r) => r.role === "admin") ??
      (roles ?? []).find((r) => r.role === "staff") ??
      (roles ?? []).find((r) => r.role === "family") ??
      null;

    await supabaseAdmin.from("login_events").insert({
      user_id: context.userId,
      email,
      role: primary?.role ?? null,
      facility_id: (primary?.facility_id as string | null | undefined) ?? null,
      ip: ipHeader,
      user_agent: ua,
    });

    await supabaseAdmin
      .from("profiles")
      .update({ last_active_at: new Date().toISOString() })
      .eq("id", context.userId);

    return { ok: true };
  });

// ---------- Users ----------

export const listFacilityUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const facilityId = await getMyAdminFacilityId(context);
    if (!facilityId) throw new Error("Forbidden: admin only");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: roles, error } = await supabaseAdmin
      .from("user_roles")
      .select("user_id, role, facility_id, deactivated_at, created_at")
      .eq("facility_id", facilityId);
    if (error) throw new Error(error.message);

    const userIds = Array.from(new Set((roles ?? []).map((r) => r.user_id as string)));
    if (userIds.length === 0) return { facilityId, users: [] };

    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id, email, name, last_active_at")
      .in("id", userIds);

    const { data: famLinks } = await supabaseAdmin
      .from("resident_family")
      .select("user_id, resident_id, residents(name)")
      .in("user_id", userIds);

    const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));
    const famByUser = new Map<string, { resident_id: string; name: string }[]>();
    for (const link of famLinks ?? []) {
      const arr = famByUser.get(link.user_id as string) ?? [];
      const res = link.residents as unknown as { name: string } | null;
      arr.push({ resident_id: link.resident_id as string, name: res?.name ?? "Unknown" });
      famByUser.set(link.user_id as string, arr);
    }

    // Aggregate roles per user (a user can have multiple)
    const byUser = new Map<string, {
      user_id: string;
      email: string | null;
      name: string | null;
      roles: { role: string; deactivated_at: string | null }[];
      last_active_at: string | null;
      family_residents: { resident_id: string; name: string }[];
    }>();
    for (const r of roles ?? []) {
      const uid = r.user_id as string;
      const prof = profileById.get(uid);
      const row = byUser.get(uid) ?? {
        user_id: uid,
        email: prof?.email ?? null,
        name: prof?.name ?? null,
        roles: [],
        last_active_at: prof?.last_active_at ?? null,
        family_residents: famByUser.get(uid) ?? [],
      };
      row.roles.push({ role: r.role as string, deactivated_at: r.deactivated_at as string | null });
      byUser.set(uid, row);
    }
    return {
      facilityId,
      users: Array.from(byUser.values()).sort((a, b) =>
        (a.email ?? "").localeCompare(b.email ?? ""),
      ),
    };
  });

export const deactivateUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ user_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const facilityId = await getMyAdminFacilityId(context);
    if (!facilityId) throw new Error("Forbidden: admin only");
    if (data.user_id === context.userId) throw new Error("You can't deactivate your own account.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("user_roles")
      .update({ deactivated_at: new Date().toISOString() })
      .eq("user_id", data.user_id)
      .eq("facility_id", facilityId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const reactivateUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ user_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const facilityId = await getMyAdminFacilityId(context);
    if (!facilityId) throw new Error("Forbidden: admin only");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("user_roles")
      .update({ deactivated_at: null })
      .eq("user_id", data.user_id)
      .eq("facility_id", facilityId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const removeUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ user_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const facilityId = await getMyAdminFacilityId(context);
    if (!facilityId) throw new Error("Forbidden: admin only");
    if (data.user_id === context.userId) throw new Error("You can't remove your own account.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Only allow removing users whose ONLY facility ties are this one.
    const { data: otherRoles } = await supabaseAdmin
      .from("user_roles")
      .select("facility_id")
      .eq("user_id", data.user_id)
      .neq("facility_id", facilityId);
    if ((otherRoles ?? []).length > 0) {
      // Just unlink from this facility instead of nuking the auth user
      await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", data.user_id)
        .eq("facility_id", facilityId);
      return { ok: true, unlinked: true as const };
    }

    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.user_id);
    if (error) throw new Error(error.message);
    return { ok: true, deleted: true as const };
  });

// ---------- Access log ----------

export const listAccessLog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const facilityId = await getMyAdminFacilityId(context);
    if (!facilityId) throw new Error("Forbidden: admin only");
    const { data, error } = await context.supabase
      .from("login_events")
      .select("id, email, role, ip, user_agent, created_at")
      .eq("facility_id", facilityId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

// ---------- Residents (admin) ----------

export const listFacilityResidents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const facilityId = await getMyAdminFacilityId(context);
    if (!facilityId) throw new Error("Forbidden: admin only");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("residents")
      .select("id, name, room_number, care_stage, dementia_type, deactivated_at, deactivated_reason, created_at")
      .eq("facility_id", facilityId)
      .order("name");
    if (error) throw new Error(error.message);

    const ids = (data ?? []).map((r) => r.id);
    const familyByResident = new Map<string, { user_id: string; email: string | null; name: string | null }[]>();
    if (ids.length) {
      const { data: links } = await supabaseAdmin
        .from("resident_family")
        .select("resident_id, user_id, profiles:user_id(email, name)")
        .in("resident_id", ids);
      for (const l of links ?? []) {
        const arr = familyByResident.get(l.resident_id as string) ?? [];
        const p = l.profiles as unknown as { email: string | null; name: string | null } | null;
        arr.push({ user_id: l.user_id as string, email: p?.email ?? null, name: p?.name ?? null });
        familyByResident.set(l.resident_id as string, arr);
      }
    }

    return (data ?? []).map((r) => ({ ...r, family: familyByResident.get(r.id) ?? [] }));
  });

export const adminCreateResident = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        name: z.string().trim().min(1).max(120),
        room_number: z.string().trim().max(40).optional().or(z.literal("")),
        care_stage: z.enum(["early", "middle", "late", ""]).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const facilityId = await getMyAdminFacilityId(context);
    if (!facilityId) throw new Error("Forbidden: admin only");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("residents")
      .insert({
        name: data.name,
        facility_id: facilityId,
        room_number: data.room_number || null,
        care_stage: data.care_stage || null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const adminUpdateResident = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        id: z.string().uuid(),
        name: z.string().trim().min(1).max(120).optional(),
        room_number: z.string().trim().max(40).nullable().optional(),
        care_stage: z.enum(["early", "middle", "late"]).nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const facilityId = await getMyAdminFacilityId(context);
    if (!facilityId) throw new Error("Forbidden: admin only");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { id, ...patch } = data;
    const { error } = await supabaseAdmin
      .from("residents")
      .update(patch)
      .eq("id", id)
      .eq("facility_id", facilityId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deactivateResident = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({ id: z.string().uuid(), reason: z.string().max(200).optional() })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const facilityId = await getMyAdminFacilityId(context);
    if (!facilityId) throw new Error("Forbidden: admin only");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("residents")
      .update({ deactivated_at: new Date().toISOString(), deactivated_reason: data.reason || null })
      .eq("id", data.id)
      .eq("facility_id", facilityId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const reactivateResident = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const facilityId = await getMyAdminFacilityId(context);
    if (!facilityId) throw new Error("Forbidden: admin only");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("residents")
      .update({ deactivated_at: null, deactivated_reason: null })
      .eq("id", data.id)
      .eq("facility_id", facilityId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const linkFamilyByEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({ resident_id: z.string().uuid(), email: z.string().email() })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const facilityId = await getMyAdminFacilityId(context);
    if (!facilityId) throw new Error("Forbidden: admin only");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Confirm resident belongs to admin's facility
    const { data: resident } = await supabaseAdmin
      .from("residents")
      .select("id, facility_id")
      .eq("id", data.resident_id)
      .maybeSingle();
    if (!resident || resident.facility_id !== facilityId) {
      throw new Error("Resident not found in your facility.");
    }

    const normalized = data.email.toLowerCase().trim();
    const { data: prof } = await supabaseAdmin
      .from("profiles")
      .select("id, email")
      .ilike("email", normalized)
      .maybeSingle();
    if (!prof) throw new Error("No account with that email. Ask them to sign up first.");

    await supabaseAdmin.from("resident_family").upsert(
      { resident_id: data.resident_id, user_id: prof.id },
      { onConflict: "resident_id,user_id" },
    );
    await supabaseAdmin.from("user_roles").upsert(
      { user_id: prof.id, role: "family", facility_id: facilityId },
      { onConflict: "user_id,role,facility_id" },
    );
    return { ok: true };
  });

export const unlinkFamilyFromResident = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ resident_id: z.string().uuid(), user_id: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const facilityId = await getMyAdminFacilityId(context);
    if (!facilityId) throw new Error("Forbidden: admin only");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: resident } = await supabaseAdmin
      .from("residents")
      .select("facility_id")
      .eq("id", data.resident_id)
      .maybeSingle();
    if (!resident || resident.facility_id !== facilityId) {
      throw new Error("Resident not found in your facility.");
    }
    const { error } = await supabaseAdmin
      .from("resident_family")
      .delete()
      .eq("resident_id", data.resident_id)
      .eq("user_id", data.user_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
