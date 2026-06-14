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
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
          <Link to="/learn" className="flex shrink-0 items-center gap-2.5">
            <img
              src={logo}
              alt=""
              width={36}
              height={36}
              className="h-9 w-9"
            />
            <span className="font-display text-lg tracking-tight">
              NeuroTrace
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {tabs.map((t) => {
              const active = t.exact
                ? pathname === t.to
                : pathname.startsWith(t.to);
              return (
                <Link
                  key={t.to}
                  to={t.to}
                  className={`rounded-full px-3.5 py-2 text-sm transition-colors ${
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
          <Link
            to="/learn/coach"
            className="hidden shrink-0 items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground sm:inline-flex md:hidden"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Coach
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 pb-28 pt-6 md:pb-12">
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/95 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-3xl items-stretch justify-around px-1">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = t.exact
              ? pathname === t.to
              : pathname.startsWith(t.to);
            return (
              <Link
                key={t.to}
                to={t.to}
                className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 1.8} />
                {t.shortLabel ?? t.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
