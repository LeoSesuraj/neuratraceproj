// Hardcoded demo personas.
//
// The facility-admin and staff auth accounts no longer exist in the backend and
// cannot be recreated right now (the service key is rejected). For demos we map
// those two logins onto the working super-admin session and override the role
// client-side so each dashboard renders for its persona.
export const DEMO_PASSWORD = "Demo2026!Pass";
export const DEMO_BASE_EMAIL = "superadmin@neuratrace.demo";
export const SUNRISE_FACILITY_ID = "11111111-1111-1111-1111-111111111111";

const STORAGE_KEY = "nt.demo-persona";

export type DemoPersona = {
  key: string;
  email: string;
  role: "admin" | "staff";
  facilityId: string;
  label: string;
};

// Real admin@/staff@ accounts exist again (see db/demo-reset-accounts.sql), so
// the persona remapping is disabled: those emails now sign in as themselves.
export const DEMO_PERSONAS: Record<string, DemoPersona> = {
  "admin@neuratrace.demo": {
    key: "admin",
    email: "admin@neuratrace.demo",
    role: "admin",
    facilityId: SUNRISE_FACILITY_ID,
    label: "Facility admin, Sunrise Memory Care Center",
  },
  "staff@neuratrace.demo": {
    key: "staff",
    email: "staff@neuratrace.demo",
    role: "staff",
    facilityId: SUNRISE_FACILITY_ID,
    label: "Caregiver, Sunrise Memory Care Center",
  },
};

export function lookupDemoPersona(_email: string): DemoPersona | null {
  return null;
}

export function setDemoPersona(persona: DemoPersona) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, persona.key);
}

export function clearDemoPersona() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function getDemoPersona(): DemoPersona | null {
  return null;
}

export type RoleInfo = {
  role: string | null;
  facilityId: string | null;
  email: string | null;
};

export function applyDemoPersona(info: RoleInfo): RoleInfo {
  const persona = getDemoPersona();
  if (!persona) return info;
  return { role: persona.role, facilityId: persona.facilityId, email: persona.email };
}
