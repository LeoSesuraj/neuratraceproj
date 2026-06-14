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
    const { data, error } = await context.supabase
      .from("user_roles")
      .select("role, facility_id")
      .order("role")
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { role: data?.role ?? null, facilityId: data?.facility_id ?? null };
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

    // Approve: invite the user by email, assign staff role
    const { data: invited, error: iErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      req.email,
      { data: { facility_id: req.facility_id, role: "staff" } },
    );
    if (iErr && !iErr.message.toLowerCase().includes("already")) {
      throw new Error(iErr.message);
    }
    let userId = invited?.user?.id;
    if (!userId) {
      // user might already exist; look up
      const { data: list } = await supabaseAdmin.auth.admin.listUsers();
      userId = list?.users.find((u) => u.email === req.email)?.id;
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
      .update({ status: "approved", decided_at: new Date().toISOString(), decided_by: context.userId })
      .eq("id", data.id);
    return { ok: true };
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
    const { error } = await supabaseAdmin.storage
      .from("resident-photos")
      .upload(path, bytes, { contentType: data.contentType, upsert: false });
    if (error) throw new Error(error.message);
    return { path };
  });
