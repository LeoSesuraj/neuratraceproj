import { Link, useRouterState } from "@tanstack/react-router";
import logo from "@/assets/neurotrace-logo.png";
import {
  ArrowLeft,
  BookOpen,
  Heart,
  LifeBuoy,
  MessageCircleHeart,
  Sparkles,
  Compass,
} from "lucide-react";
import { LegalFooter } from "@/components/legal-footer";

type Tab = {
  to:
    | "/learn"
    | "/learn/connect"
    | "/learn/understand"
    | "/learn/journey"
    | "/learn/support"
    | "/learn/coach";
  label: string;
  shortLabel?: string;
  icon: typeof Heart;
  exact?: boolean;
};

const tabs: Tab[] = [
  { to: "/learn", label: "Home", icon: Heart, exact: true },
  { to: "/learn/connect", label: "Connect", icon: MessageCircleHeart },
  { to: "/learn/understand", label: "Understand", icon: BookOpen },
  { to: "/learn/journey", label: "Journey", icon: Compass },
  { to: "/learn/support", label: "Support", icon: LifeBuoy },
  { to: "/learn/coach", label: "AI Coach", shortLabel: "Coach", icon: Sparkles },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-soft"
      >
        Skip to main content
      </a>
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
          <Link to="/learn" aria-label="NeuroTrace home" className="flex shrink-0 items-center gap-2.5">
            <img
              src={logo}
              alt="NeuroTrace logo"
              width={44}
              height={44}
              className="h-11 w-11"
            />
            <span className="font-display text-xl tracking-tight">
              NeuroTrace
            </span>
          </Link>
          <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
            {tabs.map((t) => {
              const active = t.exact
                ? pathname === t.to
                : pathname.startsWith(t.to);
              return (
                <Link
                  key={t.to}
                  to={t.to}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex min-h-11 items-center rounded-full px-3.5 py-2 text-sm transition-colors ${
                    active
                      ? "bg-sky-soft text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              to="/"
              aria-label="Back to welcome"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Welcome</span>
            </Link>
            <Link
              to="/learn/coach"
              aria-label="Open AI Coach"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground sm:hidden"
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Coach
            </Link>
          </div>
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-3xl px-5 pb-28 pt-6 md:pb-12">
        {children}
      </main>

      <LegalFooter className="hidden pb-6 md:block" />

      <nav aria-label="Mobile primary" className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/95 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-3xl items-stretch overflow-x-auto px-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = t.exact
              ? pathname === t.to
              : pathname.startsWith(t.to);
            return (
              <Link
                key={t.to}
                to={t.to}
                aria-current={active ? "page" : undefined}
                aria-label={t.label}
                className={`flex min-h-[44px] min-w-[64px] flex-1 shrink-0 snap-start flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 1.8} aria-hidden="true" />
                {t.shortLabel ?? t.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
