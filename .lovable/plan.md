## Goal
Determine whether NeuroTrace is ready for a nursing home, and create a safe path to production for web + native deployment.

## Key finding: this is NOT ready for real patient data as-is

The security scan returns clean, the role-based access controls and RLS policies are in place, and the app has audit logs, lockout handling, and inactivity timeouts. **However, the app still shows a Beta warning telling users not to enter real patient information, and Lovable Cloud does not support HIPAA compliance or Business Associate Agreements (BAA).** If a nursing home uses it for real resident names, room numbers, diagnoses, or care notes, that would be PHI handled in a non-compliant environment.

## Required decision before any code changes

1. **Choose the compliance path.** The project must decide whether it needs to process PHI.
   - **Option A: No PHI (fastest, safest):** Keep the app as a non-clinical communication, education, and staff-family coordination tool. Continue to prohibit names, diagnoses, room numbers, medications, or any identifiable health data. Nursing homes can use anonymized IDs or first names only if allowed by your legal counsel. This matches the current Terms and Privacy Policy.
   - **Option B: PHI required:** Move off Lovable Cloud to a HIPAA/BAA-compliant backend and hosting stack (for example, a Supabase Enterprise or self-hosted environment with signed BAAs, plus a hosting provider that will sign a BAA). You will also need BAAs with every subprocessor that touches PHI (Sentry, Anthropic, push-notification provider, etc.). This is a major infrastructure migration, not a quick code change.

## Plan if you stay non-PHI (Option A)

2. **Update legal and in-app copy.**
   - Remove "Beta version" language and replace it with a permanent "non-PHI / educational use only" disclaimer.
   - Add a clear onboarding acknowledgement for the first facility admin: "This app does not support Protected Health Information. Do not enter real resident names, diagnoses, room numbers, or medical details."
   - Keep the existing Terms and Privacy Policy, but update them to describe the no-PHI model and the list of subprocessors that actually touch non-PHI data.

3. **Harden the existing code.**
   - Enforce email verification before a user can view any authenticated data. The current signup already requires confirmation, but verify it is enforced everywhere.
   - Switch the password-reset `redirectTo` from the hardcoded `https://neurotraceproj.vercel.app` to `window.location.origin` so it works in any deployment and the native shell.
   - Add multi-factor authentication (MFA) as an option for admin and staff accounts.
   - Strengthen password requirements beyond the current 8-character minimum.
   - Make the 60-minute inactivity timeout and the failed-login lockout policy visible to admins.
   - Extend the access log to keep more than 50 events per facility, with a documented retention policy and export path.
   - Add admin self-service for account data export and permanent deletion.

4. **Clean up admin and data flows.**
   - Remove the hardcoded `leonelbaskin@gmail.com` super-admin gate once the first facility is onboarded, or replace it with an admin-invitation flow so the customer controls their own operators.
   - Add family-consent and access-review workflows: staff or admin can invite family, family accepts, and the admin can revoke access at any time.
   - Make sure deactivated residents and users are hidden from normal views and can be permanently deleted later.

5. **Prepare the native Capacitor app.**
   - Add privacy labels for app stores, confirm no third-party analytics leak device data, and ensure the app does not cache PHI locally.
   - Set up distribution through Apple App Store and Google Play Store, or through an enterprise mobile-device management tool if the facility provides devices.
   - Add push notifications if desired, with a BAA-compatible provider if the provider will process any message content.

6. **Operational readiness.**
   - Write a lightweight incident-response and breach-notification plan.
   - Create a staff/family training guide that repeats the "no PHI" rule.
   - Set up a support process around the `neurotraceadmin@gmail.com` contact.
   - Schedule regular security scans and access reviews.

## Plan if you must process PHI (Option B)

7. **Migrate the backend to a HIPAA-compliant environment.**
   - Move off Lovable Cloud to a Supabase instance or other backend that will sign a BAA.
   - Move hosting to a provider that will sign a BAA.
   - Replace or remove any subprocessors that cannot sign a BAA (Sentry, Anthropic, analytics, push-notification providers, etc.).
   - This is a replatforming project, not a feature tweak, so the plan is to stop current work and design the new architecture.

## Verification

- Confirm the chosen path in writing before any production deployment.
- Run a final security scan after all changes.
- Run a role-based access test against a clean production-like environment.
- Have legal counsel approve the Terms, Privacy Policy, and subprocessor list.

## Non-PHI technical steps are ready to implement once you confirm Option A.

If you want to proceed with Option A, I can start with the legal-copy updates, the email-verification enforcement, and the password-reset URL fix. If you need Option B, I recommend pausing feature work and starting the infrastructure migration plan first.