export const PASSWORD_MIN_LENGTH = 12;

export const PASSWORD_HINT =
  "Password must be at least 12 characters and include uppercase, lowercase, a number, and a special character.";

export function isValidPassword(password: string): boolean {
  if (password.length < PASSWORD_MIN_LENGTH) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[^A-Za-z0-9]/.test(password)) return false;
  return true;
}
