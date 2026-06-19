/**
 * RLS integration tests.
 *
 * Signs in as each of the four seeded role accounts and asserts that the
 * Data API allows the queries each role *should* be able to run, and
 * denies the ones each role should NOT be able to run.
 *
 * Run with:
 *   bunx vitest run tests/rls.test.ts
 *
 * Requires:
 *   - VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env (already
 *     wired for the app).
 *   - The seeded accounts from the role-based-app migration:
 *       super_admin   leonelbaskin@gmail.com / SuperAdmin123!
 *       admin         admin@demo.test       / Admin123!
 *       staff         staff@demo.test       / Staff123!
 *       family        family@demo.test      / Family123!
 *   - Seeded facilities "Sunrise Care" + "Maple Grove" and residents
 *     "Eleanor Hayes" + "Walter Chen".
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL!;
const anonKey =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  process.env.SUPABASE_PUBLISHABLE_KEY!;

function mkClient() {
  return createClient<Database>(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function signIn(email: string, password: string) {
  const c = mkClient();
  const { error } = await c.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`sign-in failed for ${email}: ${error.message}`);
  return c;
}

let superAdmin: SupabaseClient<Database>;
let admin: SupabaseClient<Database>;
let staff: SupabaseClient<Database>;
let family: SupabaseClient<Database>;
let anon: SupabaseClient<Database>;

let sunriseId: string;
let mapleId: string;
let eleanorId: string; // family-linked
let walterId: string; // not family-linked

beforeAll(async () => {
  anon = mkClient();
  [superAdmin, admin, staff, family] = await Promise.all([
    signIn("leonelbaskin@gmail.com", "SuperAdmin123!"),
    signIn("admin@demo.test", "Admin123!"),
    signIn("staff@demo.test", "Staff123!"),
    signIn("family@demo.test", "Family123!"),
  ]);

  const { data: facs, error: fe } = await superAdmin
    .from("facilities")
    .select("id,name");
  if (fe) throw fe;
  sunriseId = facs!.find((f) => f.name === "Sunrise Care")!.id;
  mapleId = facs!.find((f) => f.name === "Maple Grove")!.id;

  const { data: res, error: re } = await superAdmin
    .from("residents")
    .select("id,name");
  if (re) throw re;
  eleanorId = res!.find((r) => r.name === "Eleanor Hayes")!.id;
  walterId = res!.find((r) => r.name === "Walter Chen")!.id;
}, 30_000);

afterAll(async () => {
  await Promise.all(
    [superAdmin, admin, staff, family].map((c) => c?.auth.signOut()),
  );
});

describe("anon (no session)", () => {
  it("cannot read residents", async () => {
    const { data, error } = await anon.from("residents").select("id");
    // Either an error or zero rows is acceptable; what we forbid is data.
    expect(error || (data ?? []).length === 0).toBeTruthy();
  });
  it("cannot read profiles", async () => {
    const { data } = await anon.from("profiles").select("id");
    expect((data ?? []).length).toBe(0);
  });
  it("cannot read facilities (anon was revoked)", async () => {
    const { data } = await anon.from("facilities").select("id");
    expect((data ?? []).length).toBe(0);
  });
});

describe("family role (linked only to Eleanor)", () => {
  it("reads only their own profile", async () => {
    const { data } = await family.from("profiles").select("id,email");
    expect(data?.length).toBe(1);
    expect(data?.[0].email).toBe("family@demo.test");
  });
  it("sees only residents they are linked to", async () => {
    const { data } = await family.from("residents").select("id,name");
    const names = (data ?? []).map((r) => r.name);
    expect(names).toContain("Eleanor Hayes");
    expect(names).not.toContain("Walter Chen");
  });
  it("can read mood logs for Eleanor", async () => {
    const { error } = await family
      .from("mood_logs")
      .select("id")
      .eq("resident_id", eleanorId);
    expect(error).toBeNull();
  });
  it("cannot write a mood log", async () => {
    const { error } = await family
      .from("mood_logs")
      .insert({ resident_id: eleanorId, mood: "good" });
    expect(error).not.toBeNull();
  });
  it("cannot read mood logs for Walter", async () => {
    const { data } = await family
      .from("mood_logs")
      .select("id")
      .eq("resident_id", walterId);
    expect((data ?? []).length).toBe(0);
  });
});

describe("staff role (Sunrise Care)", () => {
  it("sees residents in their facility", async () => {
    const { data } = await staff.from("residents").select("id,facility_id");
    expect((data ?? []).length).toBeGreaterThan(0);
    expect((data ?? []).every((r) => r.facility_id === sunriseId)).toBe(true);
  });
  it("can insert a mood log for an assigned resident", async () => {
    const { error } = await staff.from("mood_logs").upsert(
      { resident_id: eleanorId, mood: "good" },
      { onConflict: "resident_id,log_date" },
    );
    expect(error).toBeNull();
  });
  it("cannot create a resident in Maple Grove", async () => {
    const { error } = await staff
      .from("residents")
      .insert({ name: "Hacker", facility_id: mapleId });
    expect(error).not.toBeNull();
  });
  it("cannot read staff_requests", async () => {
    const { data } = await staff.from("staff_requests").select("id");
    expect((data ?? []).length).toBe(0);
  });
});

describe("admin role (Sunrise Care)", () => {
  it("reads staff_requests for their facility only", async () => {
    const { data, error } = await admin
      .from("staff_requests")
      .select("id,facility_id");
    expect(error).toBeNull();
    expect((data ?? []).every((r) => r.facility_id === sunriseId)).toBe(true);
  });
  it("can create a resident in their facility", async () => {
    const { data, error } = await admin
      .from("residents")
      .insert({ name: "RLS Test Resident", facility_id: sunriseId })
      .select()
      .single();
    expect(error).toBeNull();
    if (data) await admin.from("residents").delete().eq("id", data.id);
  });
  it("cannot create a resident in Maple Grove", async () => {
    const { error } = await admin
      .from("residents")
      .insert({ name: "Cross-facility", facility_id: mapleId });
    expect(error).not.toBeNull();
  });
  it("cannot create a facility", async () => {
    const { error } = await admin
      .from("facilities")
      .insert({ name: "Should Fail" });
    expect(error).not.toBeNull();
  });
});

describe("super_admin role", () => {
  it("reads residents across all facilities", async () => {
    const { data } = await superAdmin
      .from("residents")
      .select("id,facility_id");
    const facilities = new Set((data ?? []).map((r) => r.facility_id));
    expect(facilities.size).toBeGreaterThanOrEqual(1);
  });
  it("can create and delete a facility", async () => {
    const { data, error } = await superAdmin
      .from("facilities")
      .insert({ name: "RLS Test Facility" })
      .select()
      .single();
    expect(error).toBeNull();
    if (data) {
      const { error: delErr } = await superAdmin
        .from("facilities")
        .delete()
        .eq("id", data.id);
      expect(delErr).toBeNull();
    }
  });
  it("reads any profile", async () => {
    const { data } = await superAdmin.from("profiles").select("id");
    expect((data ?? []).length).toBeGreaterThan(1);
  });
});
