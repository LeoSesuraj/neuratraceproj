import * as Sentry from "@sentry/react";

let initialized = false;

/**
 * Initialize Sentry on the client. Safe to call multiple times.
 * Strips AI Coach message content from breadcrumbs to avoid leaking
 * sensitive conversation data.
 */
export function initSentry() {
  if (initialized || typeof window === "undefined") return;
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
  if (!dsn) return;

  Sentry.init({
    dsn,
    sendDefaultPii: false,
    beforeBreadcrumb(breadcrumb) {
      // Strip AI Coach message content from breadcrumbs.
      const url =
        (breadcrumb.data && (breadcrumb.data.url as string | undefined)) || "";
      if (breadcrumb.category === "fetch" || breadcrumb.category === "xhr") {
        if (url.includes("/api/chat")) {
          if (breadcrumb.data) {
            delete (breadcrumb.data as Record<string, unknown>).body;
            delete (breadcrumb.data as Record<string, unknown>).response;
          }
          breadcrumb.message = "[redacted: coach message]";
        }
      }
      if (
        breadcrumb.category === "console" &&
        typeof breadcrumb.message === "string" &&
        /coach|message|prompt/i.test(breadcrumb.message)
      ) {
        breadcrumb.message = "[redacted]";
        if (breadcrumb.data) delete (breadcrumb.data as Record<string, unknown>).arguments;
      }
      return breadcrumb;
    },
    beforeSend(event) {
      // Hard-strip any request body that might contain coach content.
      if (event.request) {
        delete event.request.data;
        delete event.request.cookies;
      }
      return event;
    },
  });

  // Capture unhandled errors / rejections explicitly (Sentry installs
  // global handlers automatically, but we forward anything our own
  // listeners catch too).
  window.addEventListener("error", (e) => {
    Sentry.captureException(e.error ?? e.message);
  });
  window.addEventListener("unhandledrejection", (e) => {
    Sentry.captureException(e.reason);
  });

  initialized = true;
}

/** Set minimal user context — id and role only. No email or name. */
export function setSentryUser(userId: string | null, role?: string | null) {
  if (!initialized) return;
  if (!userId) {
    Sentry.setUser(null);
    return;
  }
  Sentry.setUser({ id: userId });
  Sentry.setTag("role", role ?? "unknown");
}

/**
 * Verify required public env vars are present. Throws a clear error if not.
 * Runs on both client and server module load.
 */
export function assertRequiredEnv() {
  const required: Array<[string, string | undefined]> = [
    ["VITE_SUPABASE_URL", import.meta.env.VITE_SUPABASE_URL as string | undefined],
    [
      "VITE_SUPABASE_ANON_KEY",
      (import.meta.env.VITE_SUPABASE_ANON_KEY ??
        import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) as string | undefined,
    ],
    [
      "VITE_ANTHROPIC_API_KEY",
      (import.meta.env.VITE_ANTHROPIC_API_KEY ??
        import.meta.env.VITE_LOVABLE_API_KEY) as string | undefined,
    ],
  ];
  for (const [name, value] of required) {
    if (!value) {
      const msg = `Missing required environment variable: ${name}. Check your .env configuration.`;
      console.error(msg);
      throw new Error(msg);
    }
  }
}
