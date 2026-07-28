// Super admins are identified by email. Add more emails via the SUPER_ADMIN_EMAILS
// environment variable (comma-separated) on the server. The hardcoded fallback is
// only used when the env variable is empty.
function fallbackEmails(): string[] {
  return ["leonelbaskin@gmail.com"];
}

export function getSuperAdminEmails(): string[] {
  const env =
    typeof process !== "undefined" && process.env?.SUPER_ADMIN_EMAILS
      ? process.env.SUPER_ADMIN_EMAILS.split(",").map((s) => s.trim().toLowerCase())
      : [];
  return env.length > 0 ? env : fallbackEmails();
}

export const SUPER_ADMIN_EMAILS = getSuperAdminEmails();

export function isSuperAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getSuperAdminEmails().includes(email.toLowerCase().trim());
}

