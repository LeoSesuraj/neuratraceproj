import { Link, useRouterState } from "@tanstack/react-router";
import logo from "@/assets/neurotrace-logo.png";
import { Heart, MessageCircleHeart, Sparkles } from "lucide-react";

type Tab = { to: "/" | "/connect" | "/coach"; label: string; icon: typeof Heart; exact?: boolean };

const tabs: Tab[] = [
  { to: "/", label: "Home", icon: Heart, exact: true },
  { to: "/connect", label: "Connect", icon: MessageCircleHeart },
  { to: "/coach", label: "AI Coach", icon: Sparkles },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5">
          <Link to="/" className="flex items-center gap-2.5">
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
          <nav className="hidden items-center gap-1 sm:flex">
            {tabs.map((t) => {
              const active = t.exact
                ? pathname === t.to
                : pathname.startsWith(t.to);
              return (
                <Link
                  key={t.to}
                  to={t.to}
                  className={`rounded-full px-4 py-2 text-sm transition-colors ${
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
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 pb-28 pt-6 sm:pb-12">
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/95 backdrop-blur sm:hidden">
        <div className="mx-auto flex max-w-3xl items-stretch justify-around px-2">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = t.exact
              ? pathname === t.to
              : pathname.startsWith(t.to);
            return (
              <Link
                key={t.to}
                to={t.to}
                className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 1.8} />
                {t.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
