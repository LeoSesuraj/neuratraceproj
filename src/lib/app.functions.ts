import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// ---------- Public ----------

export const listFacilities = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("facilities")
    .select("id, name")
    .order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
});

// Public: identify a signup key without revealing what each scope's key is.
// Iterates current-day keys for each kind and finds a match.
export const lookupKey = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ code: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const { normalizeKey, dailyKey } = await import("./keys.server");
    const code = normalizeKey(data.code);
    if (!code) return { found: false as const };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Try family (per resident)
    const { data: residents } = await supabaseAdmin
      .from("residents")
      .select("id, name, facility_id, facilities(name)");
    for (const r of residents ?? []) {
      if (dailyKey("family", r.id) === code) {
        const fac = r.facilities as unknown as { name: string } | null;
        return {
          found: true as const,
          kind: "family" as const,
          resident_id: r.id,
          resident_name: r.name,
          facility_id: r.facility_id,
          facility_name: fac?.name ?? null,
        };
      }
    }

    // Try staff & admin (per facility)
    const { data: facilities } = await supabaseAdmin
      .from("facilities")
      .select("id, name");
    for (const f of facilities ?? []) {
      if (dailyKey("staff", f.id) === code) {
        return {
          found: true as const,
          kind: "staff" as const,
          facility_id: f.id,
          facility_name: f.name,
        };
      }
      if (dailyKey("admin", f.id) === code) {
        return {
          found: true as const,
          kind: "admin" as const,
          facility_id: f.id,
          facility_name: f.name,
        };
      }
    }

    return { found: false as const };
  });

async function redeemFamilyResidentKeyForUser(codeInput: string, userId: string) {
  const { normalizeKey, dailyKey } = await import("./keys.server");
  const code = normalizeKey(codeInput);
  if (!code) throw new Error("Invalid key.");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: residents } = await supabaseAdmin
    .from("residents")
    .select("id, facility_id");

  for (const r of residents ?? []) {
    if (dailyKey("family", r.id) === code) {
      await supabaseAdmin.from("resident_family").upsert(
        { resident_id: r.id, user_id: userId },
        { onConflict: "resident_id,user_id" },
      );
      await supabaseAdmin.from("user_roles").upsert(
        { user_id: userId, role: "family", facility_id: r.facility_id },
        { onConflict: "user_id,role,facility_id" },
      );
      return { ok: true, kind: "family" as const, resident_id: r.id };
    }
  }

  return null;
}

export const redeemFamilyKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ code: z.string().min(1) }).parse(d))
  .handler(async ({ data, context }) => {
    const family = await redeemFamilyResidentKeyForUser(data.code, context.userId);
    if (!family) throw new Error("That is not a resident family key.");
    return family;
  });

// Authed: after sign-up, link the new user to the resident/facility by key.
export const redeemKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ code: z.string().min(1) }).parse(d))
  .handler(async ({ data, context }) => {
    const family = await redeemFamilyResidentKeyForUser(data.code, context.userId);
    if (family) return family;

    const { normalizeKey, dailyKey } = await import("./keys.server");
    const code = normalizeKey(data.code);
    if (!code) throw new Error("Invalid key.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Staff / Admin
    const { data: facilities } = await supabaseAdmin.from("facilities").select("id");
    for (const f of facilities ?? []) {
      if (dailyKey("staff", f.id) === code) {
        await supabaseAdmin.from("user_roles").upsert(
          { user_id: context.userId, role: "staff", facility_id: f.id },
          { onConflict: "user_id,role,facility_id" },
        );
        return { ok: true, kind: "staff" as const, facility_id: f.id };
      }
      if (dailyKey("admin", f.id) === code) {
        await supabaseAdmin.from("user_roles").upsert(
          { user_id: context.userId, role: "admin", facility_id: f.id },
          { onConflict: "user_id,role,facility_id" },
        );
        return { ok: true, kind: "admin" as const, facility_id: f.id };
      }
    }

    throw new Error("Key not recognized. Ask for today's key — they refresh at midnight UTC.");
  });

// ---------- Authenticated ----------

export const getMyRole = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { SUPER_ADMIN_EMAILS } = await import("./super-admin");
    const email = (context.claims.email as string | undefined) ?? null;
    const isSuper =
      !!email && SUPER_ADMIN_EMAILS.includes(email.toLowerCase().trim());
    if (isSuper) {
      return { role: "super_admin" as const, facilityId: null, email };
    }
    const { data, error } = await context.supabase
      .from("user_roles")
      .select("role, facility_id")
      .order("role")
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return {
      role: (data?.role as string | null) ?? null,
      facilityId: data?.facility_id ?? null,
      email,
    };
  });

async function getPrimaryAccess(
  context: { supabase: import("@supabase/supabase-js").SupabaseClient; userId: string; claims: { email?: unknown } },
): Promise<{
  role: "super_admin" | "admin" | "staff" | "family" | null;
  facilityIds: string[];
}> {
  if (await isSuperAdmin(context)) return { role: "super_admin", facilityIds: [] };
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("role, facility_id")
    .eq("user_id", context.userId);
  if (error) throw new Error(error.message);
  const roles = data ?? [];
  const adminFacilities = roles
    .filter((r) => r.role === "admin" && r.facility_id)
    .map((r) => r.facility_id as string);
  if (adminFacilities.length) return { role: "admin", facilityIds: adminFacilities };
  const staffFacilities = roles
    .filter((r) => r.role === "staff" && r.facility_id)
    .map((r) => r.facility_id as string);
  if (staffFacilities.length) return { role: "staff", facilityIds: staffFacilities };
  if (roles.some((r) => r.role === "family")) return { role: "family", facilityIds: [] };
  return { role: null, facilityIds: [] };
}

// ---------- Daily Keys (display) ----------

async function assertFacilityMember(
  supabase: import("@supabase/supabase-js").SupabaseClient,
  userId: string,
  facilityId: string,
) {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("facility_id", facilityId)
    .in("role", ["staff", "admin"])
    .limit(1)
    .maybeSingle();
  if (!data) throw new Error("Forbidden");
}

async function isSuperAdmin(context: { claims: { email?: unknown } }): Promise<boolean> {
  const { SUPER_ADMIN_EMAILS } = await import("./super-admin");
  const email = (context.claims.email as string | undefined) ?? "";
  return SUPER_ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

export const getResidentDailyKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ resident_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    // Only staff/admin assigned to the resident (or super admin) may view.
    if (!(await isSuperAdmin(context))) {
      const { data: row } = await context.supabase
        .from("resident_staff")
        .select("resident_id")
        .eq("resident_id", data.resident_id)
        .eq("user_id", context.userId)
        .maybeSingle();
      if (!row) {
        const { data: isAdmin } = await context.supabase.rpc("has_role", {
          _user_id: context.userId,
          _role: "admin",
        });
        if (!isAdmin) throw new Error("Forbidden");
      }
    }
    const { dailyKey, utcDateString } = await import("./keys.server");
    return { code: dailyKey("family", data.resident_id), valid_date: utcDateString() };
  });

export const getFacilityStaffKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ facility_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    if (!(await isSuperAdmin(context))) {
      await assertFacilityMember(context.supabase, context.userId, data.facility_id);
    }
    const { dailyKey, utcDateString } = await import("./keys.server");
    return { code: dailyKey("staff", data.facility_id), valid_date: utcDateString() };
  });

export const getFacilityAdminKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ facility_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    if (!(await isSuperAdmin(context))) throw new Error("Forbidden: super admin only");
    const { dailyKey, utcDateString } = await import("./keys.server");
    return { code: dailyKey("admin", data.facility_id), valid_date: utcDateString() };
  });

// ---------- Super Admin (email-gated) ----------

async function assertSuperAdmin(context: { claims: { email?: unknown } }) {
  if (!(await isSuperAdmin(context))) {
    throw new Error("Forbidden: super admin only");
  }
}

export const listAllFacilities = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("facilities")
      .select("id, name, created_at")
      .order("name");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createFacility = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ name: z.string().min(1).max(120) }).parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("facilities")
      .insert({ name: data.name })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteFacility = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("facilities").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listAllResidents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("residents")
      .select("id, name, photo_url, dementia_type, facility_id, facilities(name)")
      .order("name");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

// ---------- Public seed for demo accounts (idempotent) ----------

export const seedDemoAccounts = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  async function ensureUser(email: string, password: string): Promise<string> {
    const { data: list } = await supabaseAdmin.auth.admin.listUsers();
    const existing = list?.users.find((u) => u.email === email);
    if (existing) {
      await supabaseAdmin.auth.admin.updateUserById(existing.id, {
        password,
        email_confirm: true,
      });
      return existing.id;
    }
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error || !data.user) throw new Error(error?.message ?? "createUser failed");
    return data.user.id;
  }

  const superUid = await ensureUser("leonelbaskin@gmail.com", "SuperAdmin123!");
  const adminUid = await ensureUser("admin@demo.test", "Admin123!");
  const staffUid = await ensureUser("staff@demo.test", "Staff123!");
  const familyUid = await ensureUser("family@demo.test", "Family123!");

  async function ensureFacility(name: string): Promise<string> {
    const { data: existing } = await supabaseAdmin
      .from("facilities")
      .select("id")
      .eq("name", name)
      .maybeSingle();
    if (existing) return existing.id;
    const { data, error } = await supabaseAdmin
      .from("facilities")
      .insert({ name })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return data.id;
  }

  const sunrise = await ensureFacility("Sunrise Care");
  const maple = await ensureFacility("Maple Grove");

  await supabaseAdmin.from("user_roles").upsert(
    [
      { user_id: adminUid, role: "admin", facility_id: sunrise },
      { user_id: staffUid, role: "staff", facility_id: sunrise },
      { user_id: familyUid, role: "family", facility_id: sunrise },
    ],
    { onConflict: "user_id,role,facility_id" },
  );

  async function ensureResident(name: string, type: string): Promise<string> {
    const { data: existing } = await supabaseAdmin
      .from("residents")
      .select("id")
      .eq("name", name)
      .eq("facility_id", sunrise)
      .maybeSingle();
    if (existing) return existing.id;
    const { data, error } = await supabaseAdmin
      .from("residents")
      .insert({ name, facility_id: sunrise, dementia_type: type })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return data.id;
  }

  const eleanor = await ensureResident("Eleanor Hayes", "Alzheimer's");
  const walter = await ensureResident("Walter Chen", "Vascular dementia");

  await supabaseAdmin.from("resident_staff").upsert(
    [
      { resident_id: eleanor, user_id: staffUid, facility_id: sunrise },
      { resident_id: walter, user_id: staffUid, facility_id: sunrise },
    ],
    { onConflict: "resident_id,user_id" },
  );

  await supabaseAdmin
    .from("resident_family")
    .upsert([{ resident_id: eleanor, user_id: familyUid }], {
      onConflict: "resident_id,user_id",
    });

  const today = new Date().toISOString().slice(0, 10);
  await supabaseAdmin.from("mood_logs").upsert(
    { resident_id: eleanor, mood: "good", log_date: today, logged_by: staffUid },
    { onConflict: "resident_id,log_date" },
  );

  type R = "improved" | "stable" | "declined";
  const ratings: readonly R[] = ["improved", "stable", "declined"];
  const surveys: Array<{
    resident_id: string;
    staff_id: string;
    week_of: string;
    eating: R;
    mood: R;
    social: R;
    mobility: R;
    behaviors: "none" | "mild" | "significant";
  }> = [];
  for (let i = 0; i < 8; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i * 7);
    surveys.push({
      resident_id: eleanor,
      staff_id: staffUid,
      week_of: d.toISOString().slice(0, 10),
      eating: ratings[i % 3],
      mood: i % 2 === 0 ? "stable" : "improved",
      social: "stable",
      mobility: "stable",
      behaviors: i === 0 ? "mild" : "none",
    });
  }
  await supabaseAdmin
    .from("weekly_surveys")
    .upsert(surveys, { onConflict: "resident_id,week_of" });

  return {
    ok: true,
    facilities: { sunrise, maple },
    users: { superUid, adminUid, staffUid, familyUid },
  };
});

// ---------- Staff / Resident management ----------

export const listResidentsForMe = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const access = await getPrimaryAccess(context);

    // Super admin sees everything.
    if (access.role === "super_admin") {
      const { data, error } = await supabaseAdmin
        .from("residents")
        .select("id, name, photo_url, facility_id, dementia_type")
        .order("name");
      if (error) throw new Error(error.message);
      return data ?? [];
    }

    const ids = new Set<string>();

    if (access.role === "admin") {
      const { data } = await supabaseAdmin
        .from("residents")
        .select("id")
        .in("facility_id", access.facilityIds);
      (data ?? []).forEach((r) => ids.add(r.id));
    } else if (access.role === "staff") {
      const { data } = await supabaseAdmin
        .from("resident_staff")
        .select("resident_id")
        .eq("user_id", context.userId);
      (data ?? []).forEach((r) => ids.add(r.resident_id as string));
    } else if (access.role === "family") {
      const { data } = await supabaseAdmin
        .from("resident_family")
        .select("resident_id")
        .eq("user_id", context.userId);
      (data ?? []).forEach((r) => ids.add(r.resident_id as string));
    }

    if (ids.size === 0) return [];

    const { data, error } = await supabaseAdmin
      .from("residents")
      .select("id, name, photo_url, facility_id, dementia_type")
      .in("id", Array.from(ids))
      .order("name");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const listFamilyResidentsForMe = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: links, error: linkError } = await supabaseAdmin
      .from("resident_family")
      .select("resident_id")
      .eq("user_id", context.userId);
    if (linkError) throw new Error(linkError.message);
    const ids = (links ?? []).map((r) => r.resident_id as string);
    if (ids.length === 0) return [];
    const { data, error } = await supabaseAdmin
      .from("residents")
      .select("id, name, photo_url, facility_id, dementia_type")
      .in("id", ids)
      .order("name");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createResident = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        name: z.string().min(1).max(120),
        date_of_birth: z.string().optional(),
        dementia_type: z.string().max(120).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: role } = await context.supabase
      .from("user_roles")
      .select("facility_id")
      .in("role", ["staff", "admin"])
      .not("facility_id", "is", null)
      .limit(1)
      .maybeSingle();
    if (!role?.facility_id) throw new Error("No facility for current user");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: resident, error } = await supabaseAdmin
      .from("residents")
      .insert({
        name: data.name,
        facility_id: role.facility_id,
        date_of_birth: data.date_of_birth || null,
        dementia_type: data.dementia_type || null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    await supabaseAdmin.from("resident_staff").insert({
      resident_id: resident.id,
      user_id: context.userId,
      facility_id: role.facility_id,
    });

    return { resident };
  });

export const logTodayMood = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        resident_id: z.string().uuid(),
        mood: z.enum(["good", "mixed", "hard"]),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    if (!(await canEditResident(context.supabase, context.userId, data.resident_id))) {
      throw new Error("Forbidden");
    }
    const today = new Date().toISOString().slice(0, 10);
    const { error } = await context.supabase.from("mood_logs").upsert(
      {
        resident_id: data.resident_id,
        mood: data.mood,
        log_date: today,
        logged_by: context.userId,
      },
      { onConflict: "resident_id,log_date" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const submitWeeklySurvey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        resident_id: z.string().uuid(),
        week_of: z.string(),
        eating: z.enum(["improved", "stable", "declined"]),
        mood: z.enum(["improved", "stable", "declined"]),
        social: z.enum(["improved", "stable", "declined"]),
        mobility: z.enum(["improved", "stable", "declined"]),
        behaviors: z.enum(["none", "mild", "significant"]),
        notes: z.string().max(2000).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    if (!(await canEditResident(context.supabase, context.userId, data.resident_id))) {
      throw new Error("Forbidden");
    }
    const { error } = await context.supabase.from("weekly_surveys").upsert(
      { ...data, staff_id: context.userId },
      { onConflict: "resident_id,week_of" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const NOTE_PREFIX = "__DAILY_NOTE__";

type DailyNotePayload = {
  activities: string;
  food: string;
  feelings: string;
  note_date: string;
};

function encodeNote(p: DailyNotePayload): string {
  return NOTE_PREFIX + JSON.stringify(p);
}

function decodeNote(caption: string | null): DailyNotePayload | null {
  if (!caption || !caption.startsWith(NOTE_PREFIX)) return null;
  try {
    return JSON.parse(caption.slice(NOTE_PREFIX.length)) as DailyNotePayload;
  } catch {
    return null;
  }
}

export const createPhotoPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        resident_id: z.string().uuid(),
        photo_path: z.string().min(1),
        caption: z.string().max(1000).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    if (!(await canEditResident(context.supabase, context.userId, data.resident_id))) {
      throw new Error("Forbidden");
    }
    const { error } = await context.supabase.from("posts").insert({
      resident_id: data.resident_id,
      author_id: context.userId,
      photo_url: data.photo_path,
      caption: data.caption || null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

async function canEditResident(
  supabase: import("@supabase/supabase-js").SupabaseClient,
  userId: string,
  residentId: string,
): Promise<boolean> {
  const { data: familyLink } = await supabase
    .from("resident_family")
    .select("resident_id")
    .eq("resident_id", residentId)
    .eq("user_id", userId)
    .maybeSingle();
  if (familyLink) return false;
  const { data: isAdmin } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (isAdmin) return true;
  const { data: link } = await supabase
    .from("resident_staff")
    .select("resident_id")
    .eq("resident_id", residentId)
    .eq("user_id", userId)
    .maybeSingle();
  return !!link;
}

export const upsertDailyNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        resident_id: z.string().uuid(),
        note_date: z.string(),
        activities: z.string().max(2000).default(""),
        food: z.string().max(2000).default(""),
        feelings: z.string().max(2000).default(""),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    if (!(await canEditResident(context.supabase, context.userId, data.resident_id))) {
      throw new Error("Forbidden");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const caption = encodeNote({
      activities: data.activities,
      food: data.food,
      feelings: data.feelings,
      note_date: data.note_date,
    });

    const { data: existing } = await supabaseAdmin
      .from("posts")
      .select("id, caption")
      .eq("resident_id", data.resident_id)
      .is("photo_url", null)
      .like("caption", `${NOTE_PREFIX}%`);
    const match = (existing ?? []).find((p) => {
      const n = decodeNote(p.caption);
      return n?.note_date === data.note_date;
    });

    if (match) {
      const { error } = await supabaseAdmin
        .from("posts")
        .update({ caption })
        .eq("id", match.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin.from("posts").insert({
        resident_id: data.resident_id,
        author_id: context.userId,
        photo_url: null,
        caption,
      });
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deletePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("posts")
      .select("resident_id")
      .eq("id", data.id)
      .maybeSingle();
    if (!row) throw new Error("Post not found");
    if (!(await canEditResident(context.supabase, context.userId, row.resident_id))) {
      throw new Error("Forbidden");
    }
    const { error } = await supabaseAdmin.from("posts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Family / Resident view ----------

async function signPhoto(path: string | null): Promise<string | null> {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.storage
    .from("resident-photos")
    .createSignedUrl(path, 60 * 60);
  return data?.signedUrl ?? null;
}

export const getResidentOverview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ resident_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: resident, error } = await context.supabase
      .from("residents")
      .select("id, name, photo_url, dementia_type, facility_id")
      .eq("id", data.resident_id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!resident) throw new Error("Not found");

    const today = new Date().toISOString().slice(0, 10);
    const { data: mood } = await context.supabase
      .from("mood_logs")
      .select("mood")
      .eq("resident_id", data.resident_id)
      .eq("log_date", today)
      .maybeSingle();

    const { data: rawPosts } = await context.supabase
      .from("posts")
      .select("id, photo_url, caption, created_at, author_id")
      .eq("resident_id", data.resident_id)
      .order("created_at", { ascending: false })
      .limit(100);

    const photoPosts: Array<{
      id: string;
      photo_url: string | null;
      caption: string | null;
      created_at: string;
      author_id: string;
    }> = [];
    const noteEntries: Array<{
      id: string;
      created_at: string;
      author_id: string;
      note: DailyNotePayload;
    }> = [];

    for (const p of rawPosts ?? []) {
      const note = decodeNote(p.caption);
      if (note) {
        noteEntries.push({
          id: p.id,
          created_at: p.created_at,
          author_id: p.author_id,
          note,
        });
      } else {
        photoPosts.push(p);
      }
    }

    const { data: surveys } = await context.supabase
      .from("weekly_surveys")
      .select("week_of, eating, mood, social, mobility, behaviors, notes")
      .eq("resident_id", data.resident_id)
      .order("week_of", { ascending: false })
      .limit(8);

    const { data: alerts } = await context.supabase
      .from("decline_alerts")
      .select("id, category, triggered_at")
      .eq("resident_id", data.resident_id)
      .is("dismissed_at", null);

    const signedPhoto = await signPhoto(resident.photo_url);
    const photosWithUrls = await Promise.all(
      photoPosts.map(async (p) => ({ ...p, photo_url: await signPhoto(p.photo_url) })),
    );

    const canEdit = await canEditResident(
      context.supabase,
      context.userId,
      data.resident_id,
    );

    const notes = noteEntries
      .slice()
      .sort((a, b) => (a.note.note_date < b.note.note_date ? 1 : -1))
      .slice(0, 14);

    return {
      resident: { ...resident, photo_url: signedPhoto },
      todayMood: (mood?.mood as "good" | "mixed" | "hard" | undefined) ?? null,
      posts: photosWithUrls,
      notes,
      surveys: (surveys ?? []).slice().reverse(),
      latestSurvey: (surveys ?? [])[0] ?? null,
      alerts: alerts ?? [],
      canEdit,
    };
  });

export const dismissAlert = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("decline_alerts")
      .update({ dismissed_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const uploadResidentPhoto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        resident_id: z.string().uuid(),
        filename: z.string(),
        contentType: z.string(),
        base64: z.string(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    if (!(await canEditResident(context.supabase, context.userId, data.resident_id))) {
      throw new Error("Forbidden");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const bytes = Uint8Array.from(atob(data.base64), (c) => c.charCodeAt(0));
    const ext = data.filename.split(".").pop() || "jpg";
    const path = `${data.resident_id}/${crypto.randomUUID()}.${ext}`;

    async function tryUpload() {
      return supabaseAdmin.storage
        .from("resident-photos")
        .upload(path, bytes, { contentType: data.contentType, upsert: false });
    }
    let { error } = await tryUpload();
    if (error && /bucket not found/i.test(error.message)) {
      await supabaseAdmin.storage.createBucket("resident-photos", { public: true });
      ({ error } = await tryUpload());
    }
    if (error) throw new Error(error.message);

    const { data: pub } = supabaseAdmin.storage
      .from("resident-photos")
      .getPublicUrl(path);
    return { path, url: pub.publicUrl };
  });
