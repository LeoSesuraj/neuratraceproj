// Deterministic daily-rotating signup keys (no DB rows).
// Computed from HMAC(secret, kind:scopeId:utcDate). Hard cutoff at 00:00 UTC.
import { createHmac } from "crypto";

const ALPH = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 32 chars, no ambiguous I/O/0/1

function secret(): string {
  return (
    process.env.SIGNUP_KEY_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "neurotrace-dev-secret"
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

export function normalizeKey(input: string): string {
  const raw = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (raw.length !== 8) return "";
  return raw;
}

