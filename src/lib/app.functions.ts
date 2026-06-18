import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

function inviteRedirectTo(): string | undefined {
  try {
    const req = getRequest();
    const origin =
      req?.headers.get("origin") ??
      (req?.headers.get("host")
        ? `https://${req.headers.get("host")}`
        : undefined);
    return origin ? `${origin}/auth/set-password` : undefined;
  } catch {
    return undefined;
  }
}

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

export const submitStaffRequest = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ email: z.string().email(), facility_id: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("staff_requests")
      .insert({ email: data.email, facility_id: data.facility_id });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const lookupInvite = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ token: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: invite, error } = await supabaseAdmin
      .from("invites")
      .select("id, role, resident_id, facility_id, used, residents(name)")
      .eq("token", data.token)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!invite) return { found: false as const };
    const residents = invite.residents as unknown as { name: string } | null;
    return {
      found: true as const,
      role: invite.role,
      used: invite.used,
      residentId: invite.resident_id,
      residentName: residents?.name ?? null,
    };
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

// ---------- Super Admin (email-gated) ----------

async function assertSuperAdmin(context: { claims: { email?: unknown } }) {
  const { SUPER_ADMIN_EMAILS } = await import("./super-admin");
  const email = (context.claims.email as string | undefined) ?? "";
  if (!SUPER_ADMIN_EMAILS.includes(email.toLowerCase().trim())) {
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

export const listAllStaffRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("staff_requests")
      .select("id, email, facility_id, status, created_at, facilities(name)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
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

export const createFacilityAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ email: z.string().email(), facility_id: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: invited, error: iErr } =
      await supabaseAdmin.auth.admin.inviteUserByEmail(data.email, {
        data: { facility_id: data.facility_id, role: "admin" },
        redirectTo: inviteRedirectTo(),
      });
    if (iErr && !iErr.message.toLowerCase().includes("already")) {
      throw new Error(iErr.message);
    }
    let userId = invited?.user?.id;
    if (!userId) {
      const { data: list } = await supabaseAdmin.auth.admin.listUsers();
      userId = list?.users.find((u) => u.email === data.email)?.id;
    }
    if (!userId) throw new Error("Could not resolve user");
    await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: userId, role: "admin", facility_id: data.facility_id });
    return { ok: true };
  });

export const decideStaffRequestSuper = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ id: z.string().uuid(), approve: z.boolean() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: req, error: rErr } = await supabaseAdmin
      .from("staff_requests")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (rErr || !req) throw new Error("Request not found");

    if (!data.approve) {
      await supabaseAdmin
        .from("staff_requests")
        .update({ status: "denied", decided_at: new Date().toISOString(), decided_by: context.userId })
        .eq("id", data.id);
      return { ok: true };
    }
    const { data: invited, error: iErr } =
      await supabaseAdmin.auth.admin.inviteUserByEmail(req.email, {
        data: { facility_id: req.facility_id, role: "staff" },
        redirectTo: inviteRedirectTo(),
      });
    if (iErr && !iErr.message.toLowerCase().includes("already")) {
      throw new Error(iErr.message);
    }
    let userId = invited?.user?.id;
    if (!userId) {
      const { data: list } = await supabaseAdmin.auth.admin.listUsers();
      userId = list?.users.find((u) => u.email === req.email)?.id;
    }
    if (userId) {
      await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: userId, role: "staff", facility_id: req.facility_id });
    }
    await supabaseAdmin
      .from("staff_requests")
      .update({ status: "approved", decided_at: new Date().toISOString(), decided_by: context.userId })
      .eq("id", data.id);
    return { ok: true };
  });

// ---------- Public seed for demo accounts (idempotent) ----------

export const seedDemoAccounts = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  async function ensureUser(email: string, password: string): Promise<string> {
    const { data: list } = await supabaseAdmin.auth.admin.listUsers();
    const existing = list?.users.find((u) => u.email === email);
    if (existing) {
      // Reset password + confirm email so demo accounts always work.
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

  // Roles (super admin gets a placeholder admin row at sunrise too, but UI uses email check)
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

  // Sample mood today
  const today = new Date().toISOString().slice(0, 10);
  await supabaseAdmin.from("mood_logs").upsert(
    { resident_id: eleanor, mood: "good", log_date: today, logged_by: staffUid },
    { onConflict: "resident_id,log_date" },
  );

  // 8 weekly surveys
  type R = "improved" | "stable" | "declined";
  type B = "none" | "mild" | "significant";
  const ratings: readonly R[] = ["improved", "stable", "declined"];
  const surveys: Array<{
    resident_id: string;
    staff_id: string;
    week_of: string;
    eating: R;
    mood: R;
    social: R;
    mobility: R;
    behaviors: B;
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


export const redeemFamilyInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ token: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: invite, error } = await supabaseAdmin
      .from("invites")
      .select("*")
      .eq("token", data.token)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!invite || invite.used || invite.role !== "family" || !invite.resident_id) {
      throw new Error("Invalid or already-used invite.");
    }
    await supabaseAdmin.from("resident_family").upsert({
      resident_id: invite.resident_id,
      user_id: context.userId,
    });
    await supabaseAdmin.from("user_roles").upsert({
      user_id: context.userId,
      role: "family",
      facility_id: invite.facility_id,
    });
    await supabaseAdmin.from("invites").update({ used: true }).eq("id", invite.id);
    return { ok: true, residentId: invite.resident_id };
  });

// ---------- Admin ----------

async function assertAdmin(supabase: import("@supabase/supabase-js").SupabaseClient, userId: string) {
  const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (!data) throw new Error("Forbidden");
}

export const listPendingStaffRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("staff_requests")
      .select("id, email, facility_id, status, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const decideStaffRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ id: z.string().uuid(), approve: z.boolean() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: req, error: rErr } = await supabaseAdmin
      .from("staff_requests")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (rErr || !req) throw new Error("Request not found");

    if (!data.approve) {
      await supabaseAdmin
        .from("staff_requests")
        .update({ status: "denied", decided_at: new Date().toISOString(), decided_by: context.userId })
        .eq("id", data.id);
      return { ok: true };
    }

    // Approve: ensure auth user exists AND always send an email so the staff
    // member can set a password.
    //  - New user  → inviteUserByEmail (sends invite email).
    //  - Existing  → generateLink({ type: "recovery" }) which sends a reset
    //    email pointing at /auth/set-password.
    const redirectTo = inviteRedirectTo();
    let userId: string | undefined;
    let emailSent = false;
    let emailError: string | undefined;

    const { data: list } = await supabaseAdmin.auth.admin.listUsers();
    const existing = list?.users.find(
      (u) => u.email?.toLowerCase() === req.email.toLowerCase(),
    );

    if (existing) {
      userId = existing.id;
      const { error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
        type: "recovery",
        email: req.email,
        options: { redirectTo },
      });
      if (linkErr) emailError = linkErr.message;
      else emailSent = true;
    } else {
      const { data: invited, error: iErr } =
        await supabaseAdmin.auth.admin.inviteUserByEmail(req.email, {
          data: { facility_id: req.facility_id, role: "staff" },
          redirectTo,
        });
      if (invited?.user?.id) {
        userId = invited.user.id;
        emailSent = true;
      } else {
        emailError = iErr?.message ?? "Unknown invite error";
        // Fallback so approval is not blocked, but flag that no email went out.
        const tempPassword = `Temp${Math.random().toString(36).slice(2, 10)}!A1`;
        const { data: created, error: cErr } =
          await supabaseAdmin.auth.admin.createUser({
            email: req.email,
            password: tempPassword,
            email_confirm: true,
            user_metadata: {
              facility_id: req.facility_id,
              role: "staff",
              temp_password: tempPassword,
            },
          });
        if (cErr)
          throw new Error(
            `Could not invite or create user: ${emailError} / ${cErr.message}`,
          );
        userId = created.user?.id;
      }
    }

    if (userId) {
      await supabaseAdmin.from("user_roles").upsert({
        user_id: userId,
        role: "staff",
        facility_id: req.facility_id,
      });
    }
    await supabaseAdmin
      .from("staff_requests")
      .update({
        status: "approved",
        decided_at: new Date().toISOString(),
        decided_by: context.userId,
      })
      .eq("id", data.id);

    if (!emailSent) {
      console.warn(
        `[decideStaffRequest] No email sent to ${req.email}: ${emailError}`,
      );
    }
    return { ok: true, emailSent, emailError };
  });

// ---------- Staff / Resident management ----------

export const listResidentsForMe = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("residents")
      .select("id, name, photo_url, facility_id, dementia_type")
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
    // Get the user's facility
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

    const { data: invite } = await supabaseAdmin
      .from("invites")
      .insert({
        role: "family",
        resident_id: resident.id,
        facility_id: role.facility_id,
        created_by: context.userId,
      })
      .select("token")
      .single();

    return { resident, inviteToken: invite?.token ?? null };
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
    const { error } = await context.supabase.from("weekly_surveys").upsert(
      { ...data, staff_id: context.userId },
      { onConflict: "resident_id,week_of" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

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
    const { error } = await context.supabase.from("posts").insert({
      resident_id: data.resident_id,
      author_id: context.userId,
      photo_url: data.photo_path,
      caption: data.caption || null,
    });
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

    const { data: posts } = await context.supabase
      .from("posts")
      .select("id, photo_url, caption, created_at, author_id")
      .eq("resident_id", data.resident_id)
      .order("created_at", { ascending: false })
      .limit(50);

    const { data: surveys } = await context.supabase
      .from("weekly_surveys")
      .select("week_of, eating, mood, social, mobility, behaviors")
      .eq("resident_id", data.resident_id)
      .order("week_of", { ascending: false })
      .limit(8);

    const { data: alerts } = await context.supabase
      .from("decline_alerts")
      .select("id, category, triggered_at")
      .eq("resident_id", data.resident_id)
      .is("dismissed_at", null);

    const signedPhoto = await signPhoto(resident.photo_url);
    const postsWithUrls = await Promise.all(
      (posts ?? []).map(async (p) => ({ ...p, photo_url: await signPhoto(p.photo_url) })),
    );

    return {
      resident: { ...resident, photo_url: signedPhoto },
      todayMood: (mood?.mood as "good" | "mixed" | "hard" | undefined) ?? null,
      posts: postsWithUrls,
      surveys: (surveys ?? []).slice().reverse(),
      alerts: alerts ?? [],
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
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const bytes = Uint8Array.from(atob(data.base64), (c) => c.charCodeAt(0));
    const ext = data.filename.split(".").pop() || "jpg";
    const path = `${data.resident_id}/${crypto.randomUUID()}.${ext}`;
    let { error } = await supabaseAdmin.storage
      .from("resident-photos")
      .upload(path, bytes, { contentType: data.contentType, upsert: false });
    if (error && /bucket not found/i.test(error.message)) {
      await supabaseAdmin.storage.createBucket("resident-photos", { public: true });
      ({ error } = await supabaseAdmin.storage
        .from("resident-photos")
        .upload(path, bytes, { contentType: data.contentType, upsert: false }));
    }
    if (error) throw new Error(error.message);
    return { path };
  });

