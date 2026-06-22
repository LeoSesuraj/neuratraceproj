import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";
import logo from "@/assets/neurotrace-logo.png";

function BrandMark() {
  return (
    <div className="flex flex-col items-center">
      <img src={logo} alt="NeuroTrace logo" width={72} height={72} className="h-18 w-18" style={{ height: 72, width: 72 }} />
      <p className="mt-3 font-serif text-lg text-foreground">NeuroTrace</p>
    </div>
  );
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="max-w-md text-center">
        <BrandMark />
        <h1 className="mt-8 font-serif text-3xl text-foreground">Page not found</h1>
        <p className="mt-3 text-base text-muted-foreground">
          The page you're looking for doesn't exist or has moved.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/learn"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            Go to Learn
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full border border-input bg-background px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
    // Report to Sentry if configured
    const sentry = (globalThis as { Sentry?: { captureException?: (e: unknown) => void } }).Sentry;
    sentry?.captureException?.(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="max-w-md text-center">
        <BrandMark />
        <h1 className="mt-8 font-serif text-3xl text-foreground">Something went wrong</h1>
        <p className="mt-3 text-base text-muted-foreground">
          We hit an unexpected error. Please refresh the page or go back to the home page.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full border border-input bg-background px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#f6fafd" },
      { title: "NeuroTrace — A gentle companion for dementia caregivers" },
      {
        name: "description",
        content:
          "NeuroTrace helps families understand dementia behaviors, communicate with loved ones, and feel less alone — with an AI coach trained for caregiving.",
      },
      { property: "og:title", content: "NeuroTrace" },
      {
        property: "og:description",
        content:
          "Understand dementia. Connect with your loved one. Feel less alone.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    // Sentry.init() runs synchronously in src/router.tsx before render.
    // Here we only attach user context once auth state is known.
    void (async () => {
      const { setSentryUser } = await import("@/lib/sentry");
      const { supabase } = await import("@/integrations/supabase/client");
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const userId = data.session.user.id;
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .limit(1)
          .maybeSingle();
        setSentryUser(userId, roles?.role ?? null);
      }
      supabase.auth.onAuthStateChange((_event, session) => {
        setSentryUser(session?.user?.id ?? null);
      });
    })();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <Toaster position="top-center" />
    </QueryClientProvider>
  );
}
