// Super admin is identified by email. Add more emails here as needed.
export const SUPER_ADMIN_EMAILS = ["leonelbaskin@gmail.com"];

export function isSuperAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return SUPER_ADMIN_EMAILS.includes(email.toLowerCase().trim());
}
