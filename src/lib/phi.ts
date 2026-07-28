// Client + server helpers that block Protected Health Information (PHI)
// patterns from entering free-text fields. This is a defensive filter for
// the non-PHI pilot, not a HIPAA control.

export const PHI_PATTERNS: { label: string; re: RegExp }[] = [
  { label: "Social Security number", re: /\b\d{3}-\d{2}-\d{4}\b/ },
  { label: "Social Security number", re: /\b\d{9}\b/ },
  {
    label: "phone number",
    re: /\b(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/,
  },
  { label: "email address", re: /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/i },
  {
    label: "date of birth",
    re: /\b(?:0?[1-9]|1[0-2])[/\-.](?:0?[1-9]|[12]\d|3[01])[/\-.](?:\d{2}|\d{4})\b/,
  },
  { label: "medical record number", re: /\bMRN[:#\s-]*\d{3,}\b/i },
  { label: "medical record number", re: /\bmedical\s+record\s+(?:no\.?|number|#)?\s*\d{3,}/i },
];

export type PhiMatch = { label: string; snippet: string };

export function findPhi(text: string): PhiMatch | null {
  if (!text) return null;
  for (const { label, re } of PHI_PATTERNS) {
    const m = text.match(re);
    if (m) return { label, snippet: m[0] };
  }
  return null;
}

export function assertNoPhi(text: string, fieldLabel = "This field"): void {
  const hit = findPhi(text);
  if (hit) {
    throw new Error(
      `${fieldLabel} looks like it contains a ${hit.label}. Remove personal or medical identifiers before saving.`,
    );
  }
}

// ---------- Resident pseudonym rules ----------

export const PSEUDONYM_MAX = 20;

export const PSEUDONYM_HINT =
  "Use initials or a nickname (max 20 characters). Do not enter a resident's real full name.";

// Reject the "First Last" pattern (two capitalized words, 3+ letters each) as
// a proxy for a real full name.
const FULL_NAME_RE = /^\s*[A-Z][a-z]{2,}\s+[A-Z][a-z]{2,}(\s|$)/;

export function validatePseudonym(input: string): string | null {
  const value = input.trim();
  if (!value) return "Enter a resident identifier.";
  if (value.length > PSEUDONYM_MAX)
    return `Keep it under ${PSEUDONYM_MAX} characters. Use initials or a nickname.`;
  if (FULL_NAME_RE.test(value))
    return "Please use initials or a nickname instead of a full name.";
  const phi = findPhi(value);
  if (phi)
    return `Remove the ${phi.label} from the identifier. Use initials or a nickname.`;
  return null;
}
