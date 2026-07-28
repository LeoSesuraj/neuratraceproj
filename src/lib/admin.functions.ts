import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// NOTE: This module uses columns/tables added by db/admin-dashboard.sql
// (residents.room_number, .care_stage, .deactivated_at, .deactivated_reason;
//  user_roles.deactivated_at; profiles.last_active_at; table login_events).
// Until those land in the generated Supabase types, we go through a loosely
// typed client so the build stays green.

type AnyClient = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  from: (table: string) => any;
  auth: {
    admin: {
      deleteUser: (id: string) => Promise<{ error: { message: string } | null }>;
      getUserById: (id: string) => Promise<{
        data: { user: { app_metadata?: Record<string, unknown> | null } | null };
        error: { message: string } | null;
      }>;
      updateUserById: (
        id: string,
        attrs: { app_metadata?: Record<string, unknown> },
      ) => Promise<{ error: { message: string } | null }>;
    };
  };
};


async function loose(): Promise<AnyClient> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as unknown as AnyClient;
}

// ---------- helpers ----------

async function assertSuperOrAdmin(
  context: { supabase: import("@supabase/supabase-js").SupabaseClient; userId: string; claims: { email?: unknown } },
  facilityId: string,
): Promise<void> {
  const { SUPER_ADMIN_EMAILS } = await import("./super-admin");
  const email = (context.claims.email as string | undefined) ?? "";
  if (SUPER_ADMIN_EMAILS.includes(email.toLowerCase().trim())) return;
  const db = await loose();
  const { data } = await db
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
  context: { userId: string; claims: { email?: unknown } },
): Promise<string | null> {
  const db = await loose();
  const { data } = await db
    .from("user_roles")
    .select("facility_id")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .is("deactivated_at", null)
    .not("facility_id", "is", null)
    .limit(1)
    .maybeSingle();
  const fid = (data?.facility_id as string | undefined) ?? null;
  if (fid) return fid;
  // Super admin: fall back to the first facility in the system.
  const { SUPER_ADMIN_EMAILS } = await import("./super-admin");
  const email = (context.claims.email as string | undefined) ?? "";
  if (SUPER_ADMIN_EMAILS.includes(email.toLowerCase().trim())) {
    const { data: f } = await db
      .from("facilities")
      .select("id")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    return (f?.id as string | undefined) ?? null;
  }
  return null;
}

// ---------- Login event capture ----------

export const recordLoginEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await loose();
    const req = getRequest();
    const ipHeader =
      req?.headers.get("cf-connecting-ip") ||
      req?.headers.get("x-real-ip") ||
      req?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      null;
    const ua = req?.headers.get("user-agent") ?? null;
    const email = (context.claims.email as string | undefined) ?? null;

    const { data: roles } = await db
      .from("user_roles")
      .select("role, facility_id")
      .eq("user_id", context.userId)
      .is("deactivated_at", null);
    const list = (roles ?? []) as Array<{ role: string; facility_id: string | null }>;
    const primary =
      list.find((r) => r.role === "admin") ??
      list.find((r) => r.role === "staff") ??
      list.find((r) => r.role === "family") ??
      null;

    await db.from("login_events").insert({
      user_id: context.userId,
      email,
      role: primary?.role ?? null,
      facility_id: primary?.facility_id ?? null,
      ip: ipHeader,
      user_agent: ua,
    });

    await db
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
    const db = await loose();

    const { data: rolesData, error } = await db
      .from("user_roles")
      .select("user_id, role, facility_id, deactivated_at, created_at")
      .eq("facility_id", facilityId);
    if (error) throw new Error(error.message);
    const roles = (rolesData ?? []) as Array<{
      user_id: string;
      role: string;
      deactivated_at: string | null;
    }>;

    const userIds = Array.from(new Set(roles.map((r) => r.user_id)));
    if (userIds.length === 0) return { facilityId, users: [] };

    const { data: profilesData } = await db
      .from("profiles")
      .select("id, email, name, last_active_at")
      .in("id", userIds);
    const profiles = (profilesData ?? []) as Array<{
      id: string;
      email: string | null;
      name: string | null;
      last_active_at: string | null;
    }>;

    const { data: famData } = await db
      .from("resident_family")
      .select("user_id, resident_id, residents(name)")
      .in("user_id", userIds);
    const famLinks = (famData ?? []) as Array<{
      user_id: string;
      resident_id: string;
      residents: { name: string } | { name: string }[] | null;
    }>;

    const profileById = new Map(profiles.map((p) => [p.id, p]));
    const famByUser = new Map<string, { resident_id: string; name: string }[]>();
    for (const link of famLinks) {
      const arr = famByUser.get(link.user_id) ?? [];
      const res = Array.isArray(link.residents) ? link.residents[0] : link.residents;
      arr.push({ resident_id: link.resident_id, name: res?.name ?? "Unknown" });
      famByUser.set(link.user_id, arr);
    }

    const byUser = new Map<string, {
      user_id: string;
      email: string | null;
      name: string | null;
      roles: { role: string; deactivated_at: string | null }[];
      last_active_at: string | null;
      family_residents: { resident_id: string; name: string }[];
    }>();
    for (const r of roles) {
      const prof = profileById.get(r.user_id);
      const row = byUser.get(r.user_id) ?? {
        user_id: r.user_id,
        email: prof?.email ?? null,
        name: prof?.name ?? null,
        roles: [],
        last_active_at: prof?.last_active_at ?? null,
        family_residents: famByUser.get(r.user_id) ?? [],
      };
      row.roles.push({ role: r.role, deactivated_at: r.deactivated_at });
      byUser.set(r.user_id, row);
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
    const db = await loose();
    const { error } = await db
      .from("user_roles")
      .update({ deactivated_at: new Date().toISOString() })
      .eq("user_id", data.user_id)
      .eq("facility_id", facilityId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const unlockUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ user_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const facilityId = await getMyAdminFacilityId(context);
    if (!facilityId) throw new Error("Forbidden: admin only");
    const db = await loose();
    // Confirm the target user belongs to the admin's facility.
    const { data: roleRow } = await db
      .from("user_roles")
      .select("user_id")
      .eq("user_id", data.user_id)
      .eq("facility_id", facilityId)
      .limit(1)
      .maybeSingle();
    if (!roleRow) throw new Error("User not found in your facility.");

    const { data: got, error: getErr } = await db.auth.admin.getUserById(data.user_id);
    if (getErr) throw new Error(getErr.message);
    const meta = { ...(got?.user?.app_metadata ?? {}) } as Record<string, unknown>;
    delete meta.failed_login_attempts;
    delete meta.locked_until;
    const { error: updErr } = await db.auth.admin.updateUserById(data.user_id, {
      app_metadata: meta,
    });
    if (updErr) throw new Error(updErr.message);
    return { ok: true };
  });


export const reactivateUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ user_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const facilityId = await getMyAdminFacilityId(context);
    if (!facilityId) throw new Error("Forbidden: admin only");
    const db = await loose();
    const { error } = await db
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
    const db = await loose();

    const { data: otherRoles } = await db
      .from("user_roles")
      .select("facility_id")
      .eq("user_id", data.user_id)
      .neq("facility_id", facilityId);
    if (((otherRoles ?? []) as unknown[]).length > 0) {
      await db
        .from("user_roles")
        .delete()
        .eq("user_id", data.user_id)
        .eq("facility_id", facilityId);
      return { ok: true, unlinked: true as const };
    }

    const { error } = await db.auth.admin.deleteUser(data.user_id);
    if (error) throw new Error(error.message);
    return { ok: true, deleted: true as const };
  });

// ---------- Access log ----------

export const listAccessLog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const facilityId = await getMyAdminFacilityId(context);
    if (!facilityId) throw new Error("Forbidden: admin only");
    const db = await loose();
    const { data, error } = await db
      .from("login_events")
      .select("id, email, role, ip, user_agent, created_at")
      .eq("facility_id", facilityId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return (data ?? []) as Array<{
      id: string;
      email: string | null;
      role: string | null;
      ip: string | null;
      user_agent: string | null;
      created_at: string;
    }>;
  });

// ---------- Residents (admin) ----------

export const listFacilityResidents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const facilityId = await getMyAdminFacilityId(context);
    if (!facilityId) throw new Error("Forbidden: admin only");
    const db = await loose();
    const { data, error } = await db
      .from("residents")
      .select("id, name, room_number, care_stage, dementia_type, behaviors, deactivated_at, deactivated_reason, created_at")
      .eq("facility_id", facilityId)
      .order("name");
    if (error) throw new Error(error.message);
    const residents = (data ?? []) as Array<{
      id: string;
      name: string;
      room_number: string | null;
      care_stage: string | null;
      dementia_type: string | null;
      behaviors: string[] | null;
      deactivated_at: string | null;
      deactivated_reason: string | null;
      created_at: string;
    }>;

    const ids = residents.map((r) => r.id);
    const familyByResident = new Map<string, { user_id: string; email: string | null; name: string | null }[]>();
    if (ids.length) {
      const { data: links } = await db
        .from("resident_family")
        .select("resident_id, user_id, profiles:user_id(email, name)")
        .in("resident_id", ids);
      for (const l of (links ?? []) as Array<{
        resident_id: string;
        user_id: string;
        profiles: { email: string | null; name: string | null } | { email: string | null; name: string | null }[] | null;
      }>) {
        const arr = familyByResident.get(l.resident_id) ?? [];
        const p = Array.isArray(l.profiles) ? l.profiles[0] : l.profiles;
        arr.push({ user_id: l.user_id, email: p?.email ?? null, name: p?.name ?? null });
        familyByResident.set(l.resident_id, arr);
      }
    }

    return residents.map((r) => ({ ...r, family: familyByResident.get(r.id) ?? [] }));
  });

export const adminCreateResident = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        name: z.string().trim().min(1).max(120),
        room_number: z.string().trim().max(40).optional().or(z.literal("")),
        care_stage: z.enum(["early", "middle", "late", ""]).optional(),
        behaviors: z.array(z.string()).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const facilityId = await getMyAdminFacilityId(context);
    if (!facilityId) throw new Error("Forbidden: admin only");
    const db = await loose();
    const { data: row, error } = await db
      .from("residents")
      .insert({
        name: data.name,
        facility_id: facilityId,
        room_number: data.room_number || null,
        care_stage: data.care_stage || null,
        behaviors: data.behaviors ?? [],
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row as { id: string; name: string };
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
        behaviors: z.array(z.string()).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const facilityId = await getMyAdminFacilityId(context);
    if (!facilityId) throw new Error("Forbidden: admin only");
    const db = await loose();
    const { id, ...patch } = data;
    const { error } = await db
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
    const db = await loose();
    const { error } = await db
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
    const db = await loose();
    const { error } = await db
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
    const db = await loose();

    const { data: resident } = await db
      .from("residents")
      .select("id, facility_id")
      .eq("id", data.resident_id)
      .maybeSingle();
    if (!resident || (resident as { facility_id: string }).facility_id !== facilityId) {
      throw new Error("Resident not found in your facility.");
    }

    const normalized = data.email.toLowerCase().trim();
    const { data: prof } = await db
      .from("profiles")
      .select("id, email")
      .ilike("email", normalized)
      .maybeSingle();
    if (!prof) throw new Error("No account with that email. Ask them to sign up first.");
    const profile = prof as { id: string; email: string | null };

    await db.from("resident_family").upsert(
      { resident_id: data.resident_id, user_id: profile.id },
      { onConflict: "resident_id,user_id" },
    );
    await db.from("user_roles").upsert(
      { user_id: profile.id, role: "family", facility_id: facilityId },
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
    const db = await loose();
    const { data: resident } = await db
      .from("residents")
      .select("facility_id")
      .eq("id", data.resident_id)
      .maybeSingle();
    if (!resident || (resident as { facility_id: string }).facility_id !== facilityId) {
      throw new Error("Resident not found in your facility.");
    }
    const { error } = await db
      .from("resident_family")
      .delete()
      .eq("resident_id", data.resident_id)
      .eq("user_id", data.user_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Suppress unused-import warnings for the helper used only by assertSuperOrAdmin.
void assertSuperOrAdmin;

// ---------- Public lockout (server-backed so admins can clear it) ----------

const MAX_FAILED = 5;
const LOCKOUT_MINUTES = 15;

async function findUserIdByEmail(db: AnyClient, email: string): Promise<string | null> {
  const normalized = email.toLowerCase().trim();
  const { data } = await db
    .from("profiles")
    .select("id")
    .ilike("email", normalized)
    .maybeSingle();
  return ((data as { id?: string } | null)?.id) ?? null;
}

export const checkLockout = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ email: z.string().email() }).parse(d))
  .handler(async ({ data }) => {
    const db = await loose();
    const userId = await findUserIdByEmail(db, data.email);
    if (!userId) return { lockedUntil: null as number | null };
    const { data: got } = await db.auth.admin.getUserById(userId);
    const meta = (got?.user?.app_metadata ?? {}) as Record<string, unknown>;
    const lu = typeof meta.locked_until === "string" ? Date.parse(meta.locked_until) : 0;
    if (lu && lu > Date.now()) return { lockedUntil: lu };
    return { lockedUntil: null as number | null };
  });

export const recordFailedLogin = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ email: z.string().email() }).parse(d))
  .handler(async ({ data }) => {
    const db = await loose();
    const userId = await findUserIdByEmail(db, data.email);
    if (!userId) return { locked: false, lockedUntil: null as number | null };
    const { data: got } = await db.auth.admin.getUserById(userId);
    const meta = { ...(got?.user?.app_metadata ?? {}) } as Record<string, unknown>;
    const current = typeof meta.failed_login_attempts === "number" ? (meta.failed_login_attempts as number) : 0;
    const next = current + 1;
    meta.failed_login_attempts = next;
    let lockedUntil: number | null = null;
    if (next >= MAX_FAILED) {
      lockedUntil = Date.now() + LOCKOUT_MINUTES * 60 * 1000;
      meta.locked_until = new Date(lockedUntil).toISOString();
    }
    await db.auth.admin.updateUserById(userId, { app_metadata: meta });
    return { locked: lockedUntil !== null, lockedUntil };
  });

export const clearLockoutSelf = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await loose();
    const { data: got } = await db.auth.admin.getUserById(context.userId);
    const meta = { ...(got?.user?.app_metadata ?? {}) } as Record<string, unknown>;
    if (meta.failed_login_attempts === undefined && meta.locked_until === undefined) return { ok: true };
    delete meta.failed_login_attempts;
    delete meta.locked_until;
    await db.auth.admin.updateUserById(context.userId, { app_metadata: meta });
    return { ok: true };
  });



