// Resilient server-side data access.
//
// The project's privileged service key can be revoked or rotated out from under
// us (that has already happened once). Every read that used to assume the
// admin client now goes through here: we probe the admin client once per server
// instance and, when it is unusable, fall back to the caller's own
// row-level-security client so pages still render real data.
import type { SupabaseClient } from "@supabase/supabase-js";

type AnyClient = SupabaseClient<any, any, any>;

let adminUsable: boolean | null = null;

async function loadAdmin(): Promise<AnyClient | null> {
  if (adminUsable === false) return null;
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await (supabaseAdmin as unknown as AnyClient)
      .from("facilities")
      .select("id")
      .limit(1);
    if (error) {
      adminUsable = false;
      console.warn("[db] service key unusable, falling back to user RLS:", error.message);
      return null;
    }
    adminUsable = true;
    return supabaseAdmin as unknown as AnyClient;
  } catch (e) {
    adminUsable = false;
    console.warn("[db] service key unavailable, falling back to user RLS:", e);
    return null;
  }
}

/** Admin client when it works, otherwise the signed-in user's client (RLS). */
export async function db(fallback: AnyClient): Promise<AnyClient> {
  return (await loadAdmin()) ?? fallback;
}

/** For public (unauthenticated) reads: admin client, else the publishable key. */
export async function publicDb(): Promise<AnyClient> {
  const admin = await loadAdmin();
  if (admin) return admin;
  const { createClient } = await import("@supabase/supabase-js");
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input: any, init?: any) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  }) as unknown as AnyClient;
}
