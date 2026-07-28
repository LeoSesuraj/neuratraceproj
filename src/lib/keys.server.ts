// Deterministic daily-rotating signup keys (no DB rows).
// Computed from HMAC(secret, kind:scopeId:utcDate). Hard cutoff at 00:00 UTC.
import { createHmac } from "crypto";

const ALPH = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 32 chars, no ambiguous I/O/0/1

function secret(): string {
  return (
    process.env.SIGNUP_KEY_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "neuratrace-dev-secret"
  );
}

export function utcDateString(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export type KeyKind = "family" | "staff" | "admin";

export function dailyKey(
  kind: KeyKind,
  scopeId: string,
  date: string = utcDateString(),
): string {
  const buf = createHmac("sha256", secret())
    .update(`${kind}:${scopeId}:${date}`)
    .digest();
  let out = "";
  for (let i = 0; i < 8; i++) out += ALPH[buf[i] % 32];
  return out;
}

// Accepts 8-9 alphanumeric characters (demo static codes are 9 chars).
export function normalizeKey(input: string): string {
  const raw = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (raw.length < 8 || raw.length > 9) return "";
  return raw;
}

// Static demo codes. Only one is wired: NTFAMILY1 → Margaret B (family).
// Returns the resolved match, or null if the code is not a demo code.
export async function resolveDemoKey(code: string): Promise<
  | { kind: "family"; resident_id: string; facility_id: string; resident_name: string; facility_name: string | null }
  | null
> {
  if (code !== "NTFAMILY1") return null;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("residents")
    .select("id, name, facility_id, facilities(name)")
    .ilike("name", "Margaret%")
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  const fac = data.facilities as unknown as { name: string } | null;
  return {
    kind: "family",
    resident_id: data.id,
    facility_id: data.facility_id,
    resident_name: data.name,
    facility_name: fac?.name ?? null,
  };
}
