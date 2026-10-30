# NeuraTrace — Visual Redesign & Immersive Learning Plan

Based on the uploaded redesign brief. The brief's warm editorial palette **supersedes** the cool clinical palette applied earlier this week.

## Audit findings

**Current state:**
- `/` (index.tsx) is a login-first landing page — exactly what the brief says to eliminate.
- Public learning lives under `/learn/*` (home, connect, understand, journey, support, coach) inside `AppShell` — functional but card-grid generic.
- Design tokens in `src/styles.css`: cool off-white `#F7F9FA`, blue `#087DA5`. Fonts: Plus Jakarta Sans + Fraunces (already loaded in `__root.tsx`).
- Care Portal: `_authenticated.*` routes (resident, staff, admin, super admin, notifications, messaging) — **untouched by this redesign**.
- Backend (`src/lib/*.functions.ts`, Supabase, keys, lockouts, PHI checks) — **untouched**.

**Reusable:** font loading, token architecture, `LegalFooter` (to be expanded), situations/guides content in `src/lib/`, UI primitives in `src/components/ui`.

## Design system (Phase 1 foundation)

New tokens in `src/styles.css` (oklch equivalents of the brief's hex values):
- Background: warm ivory `#F7F5F0` · Text: midnight navy `#172438`
- Primary: deep blue-teal `#285968` · Secondary text: muted slate `#68717B`
- Alt section: warm stone `#ECEAE4` · Accent: soft sage `#A7B9AD`
- Dark navy sections for cinematic moments (brain explorer, hero accents)
- Typography: Plus Jakarta Sans for headlines/UI (large 64–88px heroes, tight tracking); Fraunces serif reserved for quotes and emotional emphasis only (reverses current serif-everywhere headings)
- Soft shadows, generous whitespace, minimal pill buttons, reduced-motion support

## Phase 1 — Visual system + public homepage (this approval covers this)

1. **Retokenize** `src/styles.css` to the warm editorial palette; update base typography rules.
2. **New public navigation** (`PublicNav` component): NeuraTrace | Learn | Explore | Practice | AI Coach | About | Care Portal + "Start Learning" CTA; polished mobile menu; replaces `AppShell` header on public pages.
3. **New homepage** at `/` — login form moves to `/auth/login` (already exists; `/` redirects signed-in users to their portal):
   - Hero: "Understand their world. Stay connected." + Begin Learning / Explore the Brain CTAs, two-column editorial composition with a brain visual
   - Human Story: "Behind every diagnosis is a person." — editorial photo section
   - Learning Experience preview: horizontal storytelling layout
   - Explore the Brain: dark navy interactive section (2D SVG brain with selectable regions, hippocampus highlighted — architecture ready for 3D later)
   - Learning Chapters: 8 large editorial tiles (Chapter 1 fully linked, others marked "coming soon")
   - "What would you say?" — working interactive situation preview (reuses existing situations logic)
   - AI Learning Companion section (links to existing coach, with educational-guidance disclaimer)
   - Care Portal access section (small, near bottom)
   - Comprehensive footer: branding, learning nav, Care Portal, About, Privacy, Terms, educational disclaimer, contact (neuratraceadmin@gmail.com)
4. **Restyle public learn pages** (`/learn/*`) into the new system — same routes and content, new composition.
5. Care Portal pages inherit new tokens automatically; no layout changes there.

**Media:** generate a small set of original hero/brain/human-story images via image generation; all media behind easily replaceable asset imports.

## Later phases (separate approvals)

- **Phase 2:** immersive lesson player + flagship chapter "Why Does My Loved One Keep Asking the Same Question?" (7 parts: Experience → Understand → Explore → Practice → Converse → Reflect → Complete), progress tracked without an account (localStorage).
- **Phase 3:** full interactive brain explorer page.
- **Phase 4:** AI Coach expansion, branching conversations.
- **Phase 5:** remaining chapters, media, assessments.

## Guardrails

- No changes to auth, database, RLS, server functions, or Care Portal logic.
- No invented endorsements, certifications, or clinical claims; educational disclaimer stays visible.
- Accessibility: WCAG 2.2 AA targets, keyboard nav, reduced-motion, 16px+ body text, safe-area insets preserved for the Capacitor app.
