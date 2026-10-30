import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import logo from "../assets/neuratrace-logo.png";

type NavItem = {
  label: string;
  to?: "/learn" | "/learn/understand" | "/learn/connect" | "/learn/coach" | "/auth/login";
  href?: string;
  exact?: boolean;
};

const items: NavItem[] = [
  { label: "Learn", to: "/learn", exact: true },
  { label: "Explore", to: "/learn/understand" },
  { label: "Practice", to: "/learn/connect" },
  { label: "AI Coach", to: "/learn/coach" },
  { label: "About", href: "/#about" },
  { label: "Care Portal", to: "/auth/login" },
];

export function PublicNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-5 sm:px-8" style={{ height: 72 }}>
        <Link to="/" aria-label="NeuraTrace home" className="flex shrink-0 items-center gap-2.5">
          <img src={logo} alt="NeuraTrace logo" width={40} height={40} className="h-10 w-10" />
          <span className="text-lg font-bold tracking-tight text-foreground">NeuraTrace</span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {items.map((item) => {
            const active =
              item.to != null &&
              (item.exact ? pathname === item.to : pathname.startsWith(item.to));
            const cls = `inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium transition-colors ${
              active
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`;
            return item.to ? (
              <Link key={item.label} to={item.to} aria-current={active ? "page" : undefined} className={cls}>
                {item.label}
              </Link>
            ) : (
              <a key={item.label} href={item.href} className={cls}>
                {item.label}
              </a>
            );
          })}
          <Link
            to="/learn"
            className="ml-3 inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-soft transition-colors hover:bg-primary-hover"
          >
            Start Learning
          </Link>
        </nav>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav aria-label="Mobile" className="border-t border-border/50 bg-background px-5 pb-6 pt-3 lg:hidden">
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.label}>
                {item.to ? (
                  <Link
                    to={item.to}
                    className="block rounded-2xl px-4 py-3 text-base font-medium text-foreground transition-colors hover:bg-secondary"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-2xl px-4 py-3 text-base font-medium text-foreground transition-colors hover:bg-secondary"
                  >
                    {item.label}
                  </a>
                )}
              </li>
            ))}
            <li className="pt-2">
              <Link
                to="/learn"
                className="block rounded-full bg-primary px-4 py-3 text-center text-base font-semibold text-primary-foreground"
              >
                Start Learning
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
