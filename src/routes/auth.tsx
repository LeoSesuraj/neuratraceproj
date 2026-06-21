import { Outlet, createFileRoute, Link } from "@tanstack/react-router";
import logo from "@/assets/neurotrace-logo.png";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/auth")({
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-soft"
      >
        Skip to main content
      </a>
      <header className="border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5">
          <Link to="/" aria-label="NeuroTrace home" className="flex items-center gap-2.5">
            <img src={logo} alt="NeuroTrace logo" className="h-10 w-10" />
            <span className="font-display text-xl tracking-tight">NeuroTrace</span>
          </Link>
          <Link
            to="/"
            aria-label="Back to welcome"
            className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Link>
        </div>
      </header>
      <main id="main-content" className="mx-auto max-w-md px-5 py-10">
        <Outlet />
      </main>
    </div>
  );
}
