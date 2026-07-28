import { createFileRoute, Outlet, redirect, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Bell, LogOut } from "lucide-react";
import { LegalFooter } from "@/components/legal-footer";
import {
  useNotificationsRealtime,
  useUnreadNotificationsCount,
} from "@/hooks/use-notifications";
import { NonPhiTopBanner, NonPhiWelcomeModal } from "@/components/beta-notice";

const logo = "/neuratrace-logo.png";

const INACTIVITY_MS = 60 * 60 * 1000; // 60 minutes
const ACTIVITY_EVENTS = ["mousedown", "keydown", "touchstart", "scroll"] as const;

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth/login" });
    return { user: data.user };
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  const navigate = useNavigate();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(({ data }) => {
      if (!cancelled) setUserId(data.user?.id ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  useNotificationsRealtime(userId);

  async function signOutInactive() {
    await supabase.auth.signOut();
    toast.message("You were signed out due to inactivity.");
    navigate({ to: "/" });
  }

  useEffect(() => {
    function reset() {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        void signOutInactive();
      }, INACTIVITY_MS);
    }
    reset();
    for (const ev of ACTIVITY_EVENTS) {
      window.addEventListener(ev, reset, { passive: true });
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      for (const ev of ACTIVITY_EVENTS) {
        window.removeEventListener(ev, reset);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-soft"
      >
        Skip to main content
      </a>
      <NonPhiTopBanner />
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
          <Link to="/" aria-label="NeuraTrace home" className="flex items-center gap-2.5">
            <img src={logo} alt="NeuraTrace logo" className="h-11 w-11" />
            <span className="font-display text-xl tracking-tight">NeuraTrace</span>
          </Link>
          <div className="flex items-center gap-1">
            <NotificationsBellLink />
            <button
              onClick={signOut}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main id="main-content" className="mx-auto max-w-3xl px-5 py-6">
        <Outlet />
      </main>
      <LegalFooter />
      <NonPhiWelcomeModal />
    </div>
  );
}

function NotificationsBellLink() {
  const { data } = useUnreadNotificationsCount();
  const count = data?.count ?? 0;
  return (
    <Link
      to="/notifications"
      aria-label={count > 0 ? `Notifications, ${count} unread` : "Notifications"}
      className="relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-2 py-2 text-muted-foreground hover:text-foreground"
    >
      <Bell className="h-5 w-5" aria-hidden="true" />
      {count > 0 && (
        <span className="absolute right-1 top-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-semibold text-destructive-foreground">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
